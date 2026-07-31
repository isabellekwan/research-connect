import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

export default async function globalSetup() {
  const host =
    process.env.PGHOST || "localhost";

  const port = Number(
    process.env.PGPORT || 5433
  );

  const user =
    process.env.PGUSER || "researchconnect";

  const password =
    process.env.PGPASSWORD || "testpassword";

  const database =
    process.env.PGDATABASE ||
    "researchconnect_test";

  // Check the resolved database name.
  if (database !== "researchconnect_test") {
    throw new Error(
      `Refusing to reset non-test database: ${database}`
    );
  }

  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database,
  });

  await client.connect();

  await client.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);

  const schemaPath = resolve(
    process.cwd(),
    "src/db/schema.sql"
  );

  const schema = await readFile(schemaPath, "utf8");

  await client.query(schema);
  await client.end();
}