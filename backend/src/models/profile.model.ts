import { query } from "../config/db.js";
import type {
    UpdateProfileInput,
    UserProfile,
} from "../types/index.js";

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const { rows } = await query<UserProfile>(    `
      SELECT
        u.id,
        u.email,
        u.name,
        u.avatar_url,
        u.role,
        u.profile_bio,
        u.school_affiliation,
        u.phone_number,
        u.created_at,
        COALESCE(
          SUM(
            CASE
              WHEN le.type = 'credit' THEN le.amount
              WHEN le.type = 'debit' THEN -le.amount
            END
          ),
          0
        ) AS total_credits
      FROM users u
      LEFT JOIN ledger_entries le
        ON le.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [id]);
  return rows[0] ?? null;
}

export async function updateUserProfile(
  id: string,
  input: UpdateProfileInput
): Promise<UserProfile | null> {
  const updates: string[] = [];
  const values: unknown[] = [id];

  if ("profile_bio" in input) {
    values.push(input.profile_bio);

    updates.push(
      `profile_bio = $${values.length}`
    );
  }

  if ("school_affiliation" in input) {
    values.push(input.school_affiliation);

    updates.push(
      `school_affiliation = $${values.length}`
    );
  }

  if ("phone_number" in input) {
    values.push(input.phone_number);

    updates.push(
      `phone_number = $${values.length}`
    );
  }

  if (updates.length === 0) {
    return getUserProfile(id);
  }

  updates.push("updated_at = now()");

  await query(
    `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $1
    `,
    values
  );

  return getUserProfile(id);
}