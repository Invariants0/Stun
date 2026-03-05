import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { aiRateLimiter } from "../middleware/ratelimit.middleware";
import { aiController } from "../controllers/ai.controller";

export const aiRouter = Router();

aiRouter.post("/plan", requireAuth, aiRateLimiter, aiController.plan);
