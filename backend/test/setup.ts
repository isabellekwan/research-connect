import { afterAll, beforeEach } from "vitest";
import { pool } from "../src/config/db.js";
import { resetDatabase } from "../test/databaseReset.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});