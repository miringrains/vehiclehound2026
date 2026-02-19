import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

const client = new Client({
  host: "aws-0-us-east-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.vqcwkjqvarzibowfrzvp",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const migrationsDir = path.resolve("supabase/migrations");

async function run() {
  await client.connect();
  console.log("Connected to Supabase Postgres");

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`\nRunning: ${file}`);
    try {
      await client.query(sql);
      console.log(`  ✓ Success`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  await client.end();
  console.log("\nDone.");
}

run().catch(console.error);
