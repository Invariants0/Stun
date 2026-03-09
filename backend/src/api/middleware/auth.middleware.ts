import type { NextFunction, Request, Response } from "express";
import { getFirebaseAuth, envVars } from "../../config";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "").trim();

    if (!token) {
      res.status(401).json({ error: "Unauthorized", message: "No token provided" });
      return;
    }

    // Verify Firebase ID token (issued by Firebase client SDK after signInWithCustomToken)
    const decoded = await getFirebaseAuth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email ?? "" };
    next();
  } catch (err: any) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
      details: envVars.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

/** Alias kept for route files that use the older name */
export const authenticateToken = requireAuth;
