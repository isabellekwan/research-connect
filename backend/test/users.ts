import { query } from "../src/config/db.js";
import type {
    User,
    UserRole,
} from "../src/types/index.js";

export async function createTestUser(
  role: UserRole,
  suffix = crypto.randomUUID()
): Promise<User> {

    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const { rows } = await query<User>(
        `
        INSERT INTO users (
            google_id,
            email,
            name,
            avatar_url,
            role
        )
        VALUES ($1, $2, $3, NULL, $4)
        RETURNING *
        `,
        [
        `google-${suffix}`,
        `${suffix}@example.com`,
        `Test ${role}-${randomNumber}`,
        role,
        ]
    );

    return rows[0];
}