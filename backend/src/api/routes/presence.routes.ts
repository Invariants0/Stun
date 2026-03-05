import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { presenceRateLimiter } from "../middleware/ratelimit.middleware";
import { presenceController } from "../controllers/presence.controller";

export const presenceRouter = Router();

presenceRouter.post("/:boardId", requireAuth, presenceRateLimiter, presenceController.update);
presenceRouter.get("/:boardId",  requireAuth, presenceRateLimiter, presenceController.getActive);
