import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

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

    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (err: any) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}
