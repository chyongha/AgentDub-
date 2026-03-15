import { createClient } from "@libsql/client";

// ── Connection ────────────────────────────────────────────────────────────────
// Lazy singleton — only created on first use, not at build time.
// This prevents Vercel build failures when env vars are not available
// during the build phase (they are only available at runtime).

let _db: ReturnType<typeof createClient> | null = null;

function getDb(): ReturnType<typeof createClient> {
  if (_db) return _db;

  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("Missing env variable: TURSO_DATABASE_URL");
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("Missing env variable: TURSO_AUTH_TOKEN");
  }

  _db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return _db;
}

// Proxy so callers can still write `db.execute(...)` unchanged
export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof createClient>];
  },
});

// ── Schema ────────────────────────────────────────────────────────────────────

export async function initDb() {
  const client = getDb();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS whitelist (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name       TEXT,
      image      TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await client.execute(`
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

  await client.execute({
    sql: `INSERT OR IGNORE INTO whitelist (email) VALUES (?)`,
    args: ["kts123@estsoft.com"],
  });
}

// ── Whitelist helpers ─────────────────────────────────────────────────────────

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const result = await getDb().execute({
    sql: `SELECT 1 FROM whitelist WHERE email = ? LIMIT 1`,
    args: [email],
  });
  return result.rows.length > 0;
}

export async function addToWhitelist(email: string): Promise<void> {
  await getDb().execute({
    sql: `INSERT OR IGNORE INTO whitelist (email) VALUES (?)`,
    args: [email],
  });
}