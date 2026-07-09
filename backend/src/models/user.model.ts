import type { Profile } from "passport-google-oauth20";
import { query } from "../config/db.js";
import type { User, UserRole } from "../types/index.js";

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const { rows } = await query<User>(`SELECT * FROM users WHERE google_id = $1`, [
    googleId,
  ]);
  return rows[0] ?? null;
}

/**
 * Looks up a user by their Google profile, creating one on first login.
 * New users are created with role = NULL; the frontend routes them to a
 * "choose your role" step before they can access researcher/participant
 * features (see auth.controller#setRole).
 */
export async function findOrCreateUserFromGoogleProfile(profile: Profile): Promise<User> {
  const existing = await findUserByGoogleId(profile.id);
  if (existing) return existing;

  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error("Google profile did not return an email address");
  }

  const { rows } = await query<User>(
    `INSERT INTO users (google_id, email, name, avatar_url, role)
     VALUES ($1, $2, $3, $4, NULL)
     RETURNING *`,
    [profile.id, email, profile.displayName, profile.photos?.[0]?.value ?? null]
  );
  return rows[0];
}

export async function setUserRole(userId: string, role: UserRole): Promise<User> {
  const { rows } = await query<User>(
    `UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [userId, role]
  );
  if (!rows[0]) {
    throw new Error("User not found");
  }
  return rows[0];
}