import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.get("/url",          authController.getAuthUrl);
authRouter.post("/signin",      authController.signin);
authRouter.post("/callback",    authController.callback);
authRouter.post("/verify-token", authController.verifyToken);
authRouter.post("/signout",     authController.signout);
authRouter.get("/me",           requireAuth, authController.me);
