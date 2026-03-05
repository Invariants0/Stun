import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { presenceController } from "../controllers/presence.controller";

export const presenceRouter = Router();

presenceRouter.post("/:boardId", requireAuth, presenceController.update);
presenceRouter.get("/:boardId",  requireAuth, presenceController.getActive);
