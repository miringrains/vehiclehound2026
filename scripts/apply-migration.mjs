import { readFileSync } from 'fs';
import pg from 'pg';

const file = process.argv[2];
if (!file) { console.error('Usage: node apply-migration.mjs <file.sql>'); process.exit(1); }

const sql = readFileSync(file, 'utf8');

const client = new pg.Client({
  connectionString: `postgresql://postgres.vqcwkjqvarzibowfrzvp:${process.env.DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected. Running migration:', file);

try {
  await client.query(sql);
  console.log('Migration applied successfully.');
} catch (err) {
  console.error('Migration error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
