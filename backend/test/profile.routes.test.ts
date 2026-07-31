import request from "supertest";
import {
    describe,
    expect,
    it,
} from "vitest";
import {
    authenticatedApp,
    unauthenticatedApp,
} from "./authHelper.js";
import { createTestUser } from "./users.js";

describe("profile routes", () => {
    it("rejects an unauthenticated profile request", async () => {
        await request(unauthenticatedApp())
        .get("/users/me")
        .expect(401)
        .expect({
            error: "Not authenticated",
        });
    });

    it("returns the authenticated participant profile", async () => {
        const participant =
        await createTestUser("participant");

        const response = await request(
        authenticatedApp(participant)
        )
        .get("/users/me")
        .expect(200);

        expect(response.body.user).toMatchObject({
        id: participant.id,
        email: participant.email,
        name: participant.name,
        role: "participant",
        });
    });

    it("returns the authenticated researcher profile", async () => {
        const researcher =
        await createTestUser("researcher");

        const response = await request(
        authenticatedApp(researcher)
        )
        .get("/users/me")
        .expect(200);

        expect(response.body.user).toMatchObject({
            id: researcher.id,
            role: "researcher",
            email: researcher.email,
            name: researcher.name,
        });
    });

    it("updates the biography", async () => {
        const participant =
            await createTestUser("participant");

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
            profile_bio: "Updated biography",
            })
            .expect(200);

        expect(response.body.user.profile_bio)
            .toBe("Updated biography");
    });

    it("updates the School Affiliation", async () => {
        const participant =
            await createTestUser("participant");

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
            school_affiliation: "New Affiliation",
            })
            .expect(200);

        expect(response.body.user.school_affiliation)
            .toBe("New Affiliation");
    });

    it("updates the phone number", async () => {
        const participant =
            await createTestUser("participant");

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
            phone_number: "999-999-9999",
            })
            .expect(200);

        expect(response.body.user.phone_number)
            .toBe("999-999-9999");
    });

    it("clears a profile field using null", async () => {
        const participant =
            await createTestUser("participant");

        const app = authenticatedApp(participant);

        await request(app)
            .patch("/users/me")
            .send({
            profile_bio: "Temporary biography",
            })
            .expect(200);

        const response = await request(app)
            .patch("/users/me")
            .send({
            profile_bio: null,
            })
            .expect(200);

        expect(response.body.user.profile_bio)
            .toBeNull();
    });

    it("rejects an invalid phone number", async () => {
        const participant =
            await createTestUser("participant");

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
            phone_number: "not-a-phone-number",
            })
            .expect(400);

        expect(response.body).toEqual({
            error:
            "Enter a valid phone number containing 7 to 15 digits",
        });
    });

    it("rejects a phone number with fewer than 7 digits", async () => {
        const participant =
            await createTestUser("participant");

        await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
            phone_number: "12345",
            })
            .expect(400)
            .expect({
                error:
                    "Enter a valid phone number containing 7 to 15 digits",
            });
    });

    it("rejects a non-string biography", async () => {
        const participant =
            await createTestUser("participant");

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
                profile_bio: 123,
            })
            .expect(400);

        expect(response.body).toEqual({
            error: "Biography must be text or null",
        });
    });

    it("rejects a biography longer than 1000 characters", async () => {
        const participant =
            await createTestUser("participant");

        const biography = "a".repeat(1001);

        const response = await request(
            authenticatedApp(participant)
        )
            .patch("/users/me")
            .send({
                profile_bio: biography,
            })
            .expect(400);

        expect(response.body).toEqual({
            error:
            "Biography cannot exceed 1000 characters",
        });
    });
});