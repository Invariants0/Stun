import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = {
    uid: token,
    email: undefined,
  };

  next();
}
