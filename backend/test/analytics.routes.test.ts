import request from "supertest";
import {
    describe,
    expect,
    it,
} from "vitest";
import { query } from "../src/config/db.js";
import {
    authenticatedApp,
    unauthenticatedApp,
} from "./authHelper.js";
import { createTestUser } from "./users.js";

async function createTestStudy(
  researcherId: string,
  title = "Analytics Test Study"
) {
  const { rows } = await query<{ id: string }>(
    `
      INSERT INTO studies (
        researcher_id,
        title,
        description,
        category,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      researcherId,
      title,
      "Study used for analytics tests",
      "Psychology",
      "open",
    ]
  );

  return rows[0];
}

describe("analytics routes", () => {
  it("rejects an unauthenticated user", async () => {
    await request(unauthenticatedApp())
      .get("/analytics/overview")
      .expect(401)
      .expect({
        error: "Not authenticated",
      });
  });

  it("rejects a participant from researcher analytics", async () => {
    const participant =
      await createTestUser("participant");

    await request(
      authenticatedApp(participant)
    )
      .get("/analytics/overview")
      .expect(403)
      .expect({
        error: "Requires role: researcher",
      });
  });

  it("returns zero analytics for a researcher with no studies", async () => {
    const researcher =
      await createTestUser("researcher");

    const response = await request(
      authenticatedApp(researcher)
    )
      .get("/analytics/overview")
      .expect(200);

    expect(response.body).toEqual({
      studiesPosted: 0,
      totalViews: 0,
      viewsToday: 0,
      totalSignups: 0,
      signupsToday: 0,
    });
  });

  it("returns 404 when the selected study does not exist", async () => {
    const researcher =
      await createTestUser("researcher");

    const missingStudyId =
        "00000000-0000-0000-0000-000000000001";

    await request(
      authenticatedApp(researcher)
    )
      .get(
        `/analytics/overview?studyId=${missingStudyId}`
      )
      .expect(404)
      .expect({
        error: "Study not found",
      });
  });

  it("prevents a researcher from viewing another researcher's study analytics", async () => {
    const owner =
      await createTestUser("researcher");
    const otherResearcher =
      await createTestUser("researcher");

    const study = await createTestStudy(owner.id);

    await request(
      authenticatedApp(otherResearcher)
    )
      .get(
        `/analytics/overview?studyId=${study.id}`
      )
      .expect(403)
      .expect({
        error: "You do not own this study",
      });
  });

  it("counts studies, views, and applications in the overview", async () => {
    const researcher =
      await createTestUser("researcher");
    const participant =
      await createTestUser("participant");

    const study = await createTestStudy(
      researcher.id
    );

    await query(
      `
        INSERT INTO study_views (
          study_id,
          viewer_id
        )
        VALUES ($1, $2)
      `,
      [study.id, participant.id]
    );

    await query(
      `
        INSERT INTO study_applications (
          study_id,
          participant_id,
          status
        )
        VALUES ($1, $2, $3)
      `,
      [study.id, participant.id, "pending"]
    );

    const response = await request(
      authenticatedApp(researcher)
    )
      .get("/analytics/overview?tz=UTC")
      .expect(200);

    expect(response.body).toEqual({
      studiesPosted: 1,
      totalViews: 1,
      viewsToday: 1,
      totalSignups: 1,
      signupsToday: 1,
    });
  });

  it("groups applications by enrollment status", async () => {
    const researcher =
      await createTestUser("researcher");
    const participantOne =
      await createTestUser("participant");
    const participantTwo =
      await createTestUser("participant");
    const participantThree =
      await createTestUser("participant");

    const study = await createTestStudy(
      researcher.id
    );

    await query(
      `
        INSERT INTO study_applications (
          study_id,
          participant_id,
          status
        )
        VALUES
          ($1, $2, 'pending'),
          ($1, $3, 'accepted'),
          ($1, $4, 'accepted')
      `,
      [
        study.id,
        participantOne.id,
        participantTwo.id,
        participantThree.id,
      ]
    );

    const response = await request(
      authenticatedApp(researcher)
    )
      .get(
        `/analytics/enrollments?studyId=${study.id}`
      )
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          status: "pending",
          count: 1,
        },
        {
          status: "accepted",
          count: 2,
        },
      ])
    );

    expect(response.body).toHaveLength(2);
  });
});
