import { query } from "../src/config/db.js";

export async function resetDatabase() {
  if (
    process.env.PGDATABASE !==
    "researchconnect_test"
  ) {
    throw new Error(
      "Refusing to reset a non-test database"
    );
  }

  await query(`
    TRUNCATE TABLE
      study_views,
      ledger_entries,
      chat_messages,
      reviews,
      bookings,
      time_slots,
      study_applications,
      screening_questions,
      studies,
      users
    CASCADE
  `);
}