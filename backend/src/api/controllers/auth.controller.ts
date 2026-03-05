import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import axios from "axios";

const REDIRECT_URI = () =>
  process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/auth/callback`
    : "http://localhost:3000/auth/callback";

async function exchangeCodeForUser(code: string, redirectUri: string) {
  const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const idToken: string = tokenRes.data.id_token;
  const auth = getAuth();
  const decoded = await auth.verifyIdToken(idToken);

  // Upsert Firebase user
  try {
    await auth.getUser(decoded.uid);
  } catch {
    await auth.createUser({
      uid: decoded.uid,
      email: decoded.email,
      displayName: (decoded as any).name,
      photoURL: (decoded as any).picture,
    });
  }

  const customToken = await auth.createCustomToken(decoded.uid);

  return {
    token: customToken,
    user: {
      uid: decoded.uid,
      email: decoded.email,
      displayName: (decoded as any).name,
      photoURL: (decoded as any).picture,
    },
  };
}

export const authController = {
  /** Returns the Google OAuth authorization URL for the frontend to redirect to */
  getAuthUrl(req: Request, res: Response): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
      return;
    }

    const redirectUri = (req.body?.redirectUri as string) ?? REDIRECT_URI();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });

    res.json({ authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  },

  async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, redirectUri } = req.body as { code?: string; redirectUri?: string };
      if (!code) {
        res.status(400).json({ error: "MISSING_CODE", message: "Authorization code is required" });
        return;
      }

      const result = await exchangeCodeForUser(code, redirectUri ?? REDIRECT_URI());
      res.json({ success: true, ...result });
    } catch (err: any) {
      next(err);
    }
  },

  async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, redirectUri } = req.body as { code?: string; redirectUri?: string };
      if (!code) {
        res.status(400).json({ error: "MISSING_CODE", message: "Authorization code is required" });
        return;
      }

      const result = await exchangeCodeForUser(code, redirectUri ?? REDIRECT_URI());
      res.json({ success: true, ...result });
    } catch (err: any) {
      next(err);
    }
  },

  async verifyToken(req: Request, res: Response): Promise<void> {
    const token = (req.body?.token as string) ?? req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(400).json({ error: "MISSING_TOKEN", message: "Token is required" });
      return;
    }

    try {
      const decoded = await getAuth().verifyIdToken(token);
      res.json({
        success: true,
        valid: true,
        user: { uid: decoded.uid, email: decoded.email },
      });
    } catch (err: any) {
      res.status(401).json({ success: false, valid: false, error: "INVALID_TOKEN", message: err.message });
    }
  },

  signout(_req: Request, res: Response): void {
    // Token revocation is client-side; this endpoint is for any server-side cleanup
    res.json({ success: true, message: "Sign out successful" });
  },

  me(req: Request, res: Response): void {
    res.json({ user: req.user ?? null });
  },
};
