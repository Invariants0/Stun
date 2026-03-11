import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

o// ACTIVE ENDPOINTS - Used by frontend
authRouter.get("/url",          authController.getAuthUrl);     // Used by signin page
authRouter.post("/signin",      authController.signin);         // Used by auth callback
authRouter.get("/me",           requireAuth, authController.me); // Used by rehydrate

// UNUSED ENDPOINTS - Commented out during hackathon (March 2026)
// These were implemented but never connected to frontend
// authRouter.post("/callback",    authController.callback);     // Alternative OAuth callback - unused
// authRouter.post("/verify-token", authController.verifyToken); // Token validation - unused  
// authRouter.post("/signout",     authController.signout);      // Server-side signout - frontend uses Firebase directly
// authRouter.get("/me",           requireAuth, authController.me); // User profile endpoint - unused
