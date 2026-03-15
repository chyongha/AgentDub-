import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";

/**
 * GET /api/init-db
 *
 * Run this ONCE to create all tables and seed the whitelist.
 * Protected by a secret token to prevent accidental re-runs in production.
 *
 * Usage:
 *   curl http://localhost:3000/api/init-db?secret=YOUR_INIT_SECRET
 *
 * Set INIT_SECRET in your .env.local to any random string.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Guard: require secret in production
  if (process.env.NODE_ENV === "production") {
    if (!process.env.INIT_SECRET || secret !== process.env.INIT_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Provide ?secret=YOUR_INIT_SECRET" },
        { status: 401 }
      );
    }
  }

  try {
    await initDb();
    return NextResponse.json({
      ok: true,
      message: "Database initialized successfully.",
      tables: ["whitelist", "users", "projects"],
      seeded: ["kts123@estsoft.com"],
    });
  } catch (err) {
    console.error("[init-db] error:", err);
    return NextResponse.json(
      { error: "Database initialization failed.", detail: String(err) },
      { status: 500 }
    );
  }
}