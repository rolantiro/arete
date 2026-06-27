import { cookies } from "next/headers";

const SESSION_COOKIE = "arete_session_id";

/**
 * Returns the current guest session id. middleware.ts guarantees
 * this cookie is set on every request (including the very first
 * one) before any Server Component or Route Handler runs, since
 * Server Components can only read cookies, not write them.
 *
 * The fallback id generation below only matters for edge cases
 * (e.g. middleware being bypassed in certain test setups) — in
 * normal operation the cookie set here is never persisted by this
 * function itself, only read.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const newId = crypto.randomUUID();
  try {
    cookieStore.set(SESSION_COOKIE, newId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch {
    // Read-only context (Server Component render). middleware.ts
    // already ensures this shouldn't happen in normal traffic.
  }
  return newId;
}

export { SESSION_COOKIE };
