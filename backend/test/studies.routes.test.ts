import request from "supertest";
import {
    describe,
    expect,
    it,
} from "vitest";
import {
    authenticatedApp,
    unauthenticatedApp
} from "./authHelper.js";
import { createTestUser } from "./users.js";

const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

const validStudy = {
  title: "Memory and Attention Study",
  description:
    "A study examining working memory.",
  category: "Psychology",
  location: "Remote",
  isRemote: true,
  compensation: 25,
  status: "open",
  screeningQuestions: [],
  timeSlots: [
      {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        capacity: 10,
      },
    ],
};

describe("studies routes", () =>{
    it("allows a researcher to create a study", async () => {
        const researcher =
            await createTestUser("researcher");

        const response = await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send(validStudy)
            .expect(201);

        expect(response.body.study).toMatchObject({
            title: validStudy.title,
            researcher_id: researcher.id,
            status: "open",
        });
    });

    it("rejects study creation by a participant", async () => {
        const participant =
            await createTestUser("participant");

        await request(
            authenticatedApp(participant)
        )
            .post("/studies")
            .send(validStudy)
            .expect(403)
            .expect({
            error: "Requires role: researcher",
            });
    });

    it("rejects study creation by an unauthenticated user", async () => {
        await request(unauthenticatedApp())
            .post("/studies")
            .send(validStudy)
            .expect(401)
            .expect({
                error: "Not authenticated",
            });
    });
    it("rejects a study without a title", async () => {
        const researcher =
            await createTestUser("researcher");

        const { title, ...studyWithoutTitle } =
            validStudy;

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send(studyWithoutTitle)
            .expect(400)
            .expect({
            error:
                "Title, description, and category are required",
            });
    });

    it("rejects a study without a description", async () => {
        const researcher =
            await createTestUser("researcher");

        const {
            description,
            ...studyWithoutDescription
        } = validStudy;

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send(studyWithoutDescription)
            .expect(400)
            .expect({
            error:
                "Title, description, and category are required",
            });
    });

    it("rejects a study without a category", async () => {
        const researcher =
            await createTestUser("researcher");

        const {
            category,
            ...studyWithoutCategory
        } = validStudy;

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send(studyWithoutCategory)
            .expect(400)
            .expect({
            error:
                "Title, description, and category are required",
            });
    });

    it("rejects a study with negative compensation", async () => {
        const researcher =
            await createTestUser("researcher");

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
            ...validStudy,
            compensation: -10,
            })
            .expect(400)
            .expect({
            error:
                "Compensation must be a non-negative number",
            });
    });

    it("rejects a study with an invalid status", async () => {
        const researcher =
            await createTestUser("researcher");

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
            ...validStudy,
            status: "completed",
            })
            .expect(400)
            .expect({
                error: "Status must be draft or open",
            });
    });

    it("rejects a study with more than 20 screening questions", async () => {
        const researcher =
            await createTestUser("researcher");

        const screeningQuestions = [];

        for (let i = 1; i <= 21; i++) {
            screeningQuestions.push({
                questionText: `Screening question ${i}`,
                qualifyingAnswer: true,
            });
        }

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
                ...validStudy,
                screeningQuestions,
            })
            .expect(400)
            .expect({
            error:
                "A study can have at most 20 screening questions",
            });
    });

    it("rejects a study without session times", async () => {
        const researcher =
            await createTestUser("researcher");

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
                ...validStudy,
                timeSlots: [],
            })
            .expect(400)
            .expect({
            error:
                "Add between 1 and 50 session times",
            });
    });

    it("rejects a study when timeSlots is omitted", async () => {
        const researcher =
            await createTestUser("researcher");

        const {
            timeSlots,
            ...studyWithoutTimeSlots
        } = validStudy;

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send(studyWithoutTimeSlots)
            .expect(400)
            .expect({
            error:
                "Add between 1 and 50 session times",
            });
    });
    it("rejects a session with invalid dates", async () => {
        const researcher =
            await createTestUser("researcher");

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
            ...validStudy,
            timeSlots: [
                {
                startTime: "not-a-date",
                endTime: "also-not-a-date",
                capacity: 10,
                },
            ],
            })
            .expect(400)
            .expect({
            error:
                "Each session needs a valid start and end time",
            });
    });
    it("rejects a session whose end time is before its start time", async () => {
        const researcher =
            await createTestUser("researcher");

        const startTime = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        const endTime = new Date(
            startTime.getTime() - 60 * 60 * 1000
        );

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
            ...validStudy,
            timeSlots: [
                {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                capacity: 10,
                },
            ],
            })
            .expect(400)
            .expect({
            error:
                "Each session needs a valid start and end time",
            });
    });

    it("rejects a session whose start and end times are equal", async () => {
        const researcher =
            await createTestUser("researcher");

        const time = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
            ...validStudy,
            timeSlots: [
                {
                startTime: time,
                endTime: time,
                capacity: 10,
                },
            ],
            })
            .expect(400)
            .expect({
            error:
                "Each session needs a valid start and end time",
            });
    });

    it("rejects a session with a non-integer capacity", async () => {
        const researcher =
            await createTestUser("researcher");

        await request(
            authenticatedApp(researcher)
        )
            .post("/studies")
            .send({
                ...validStudy,
                timeSlots: [
                    {
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        capacity: 10.5,
                    },
                ],
            })
            .expect(400)
            .expect({
                error:
                    "Session capacity must be between 1 and 500",
            });
    });
});
