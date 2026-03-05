import type { NextFunction, Request, Response } from "express";
import axios from "axios";
import { getFirebaseAuth, envVars } from "../../config";

const REDIRECT_URI = () => `${envVars.FRONTEND_URL}/auth/callback`;

/**
 * Decode a JWT payload without verifying the signature.
 * Safe here because the token came directly from Google's token endpoint
 * over HTTPS — we trust the source, not the signature.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

async function exchangeCodeForUser(code: string, redirectUri: string) {
  // Exchange authorization code for tokens at Google's token endpoint
  // Must use application/x-www-form-urlencoded, not JSON
  const params = new URLSearchParams({
    code,
    client_id: envVars.GOOGLE_CLIENT_ID,
    client_secret: envVars.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const { data: tokens } = await axios.post<{ id_token: string }>(
    "https://oauth2.googleapis.com/token",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!tokens.id_token) throw new Error("No id_token from Google");

  // Decode payload to extract user info (uid, email, name, picture)
  const payload = decodeJwtPayload(tokens.id_token);
  const uid        = payload.sub         as string;
  const email      = (payload.email      as string) ?? "";
  const displayName = payload.name       as string | undefined;
  const photoURL   = payload.picture     as string | undefined;

  // Issue a Firebase custom token — the client SDK exchanges this
  // for a proper Firebase ID token (auto-refreshed, long-lived).
  const customToken = await getFirebaseAuth().createCustomToken(uid);

  return {
    customToken,
    user: { uid, email, displayName, photoURL },
  };
}

export const authController = {
  /** Returns the Google OAuth authorization URL for the frontend to redirect to */
  getAuthUrl(req: Request, res: Response): void {
    const redirectUri = (req.body?.redirectUri as string) ?? REDIRECT_URI();
    const params = new URLSearchParams({
      client_id: envVars.GOOGLE_CLIENT_ID,
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
      const decoded = await getFirebaseAuth().verifyIdToken(token);
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
