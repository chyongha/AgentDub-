import { createClient } from "@libsql/client";

// ── Connection ────────────────────────────────────────────────────────────────

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("Missing env variable: TURSO_DATABASE_URL");
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error("Missing env variable: TURSO_AUTH_TOKEN");
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Schema ────────────────────────────────────────────────────────────────────

/**
 * Creates all tables and seeds default data.
 * Safe to run multiple times — uses IF NOT EXISTS + INSERT OR IGNORE.
 */
export async function initDb() {
  // 1. Whitelist table — controls who can sign in
  await db.execute(`
    CREATE TABLE IF NOT EXISTS whitelist (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // 2. Users table — populated on first sign-in if email is whitelisted
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name       TEXT,
      image      TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // 3. Projects table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      title       TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      source_lang TEXT,
      target_lang TEXT,
      created_at  INTEGER DEFAULT (unixepoch()),
      updated_at  INTEGER DEFAULT (unixepoch())
    )
  `);

  // 4. Seed default whitelisted email
  const defaultEmails = [
    "kts1232estsoft.com",
    "legocho2162@gmail.com"
  ];

  for (const email of defaultEmails){
    await db.execute({
      sql: 'INSERT OR IGNORE INTO whitelist (email) VALUES (?)',
      args: [email],
    });
  }
}

// ── Whitelist helpers ─────────────────────────────────────────────────────────

/**
 * Returns true if the given email is in the whitelist.
 */
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const result = await db.execute({
    sql: `SELECT 1 FROM whitelist WHERE email = ? LIMIT 1`,
    args: [email],
  });
  return result.rows.length > 0;
}

/**
 * Adds an email to the whitelist. No-op if it already exists.
 */
export async function addToWhitelist(email: string): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO whitelist (email) VALUES (?)`,
    args: [email],
  });
}