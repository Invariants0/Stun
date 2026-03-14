import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "authToken";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (keeps session alive longer)

/**
 * POST /api/auth/set-token
 * Body: { token: string }
 *
 * Sets an httpOnly, Secure, SameSite=Strict cookie on the frontend domain.
 * This is the BFF (Backend-for-Frontend) pattern — the only way to set
 * httpOnly cookies when the backend is on a different origin.
 */
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

/**
 * DELETE /api/auth/set-token
 * Clears the httpOnly auth cookie (sign-out).
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return res;
}
