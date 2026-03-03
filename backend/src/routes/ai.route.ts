import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware";
import { plannerRequestSchema } from "../validators/action.validator";
import { geminiService } from "../services/gemini.service";

export const aiRouter = Router();

aiRouter.post("/plan", requireAuth, async (req, res, next) => {
  try {
    const input = plannerRequestSchema.parse(req.body);
    const result = await geminiService.planActions(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
