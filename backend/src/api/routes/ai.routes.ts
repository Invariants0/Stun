import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { aiController } from "../controllers/ai.controller";

export const aiRouter = Router();

aiRouter.post("/plan", requireAuth, aiController.plan);
