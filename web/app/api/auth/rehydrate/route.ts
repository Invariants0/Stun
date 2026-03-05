import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * GET /api/auth/rehydrate
 *
 * Called on page load when the in-memory token is gone (e.g. after a hard
 * refresh).  Reads the httpOnly "authToken" cookie server-side, forwards it
 * to the backend /auth/me endpoint, and returns the user profile to the
 * client — WITHOUT ever exposing the raw token to client-side JavaScript.
 *
 * Returns 401 when the cookie is absent or the token is invalid/expired.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    // Disable caching — auth state must always be fresh
    cache: "no-store",
  });

  if (!backendRes.ok) {
    // Token is expired/invalid — clear the stale cookie
    const res = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    res.cookies.set("authToken", "", { maxAge: 0, path: "/" });
    return res;
  }

  const data = await backendRes.json();
  // Return only the user profile — never the raw token
  return NextResponse.json({ user: data.user ?? data });
}
