import type { NextFunction, Request, Response } from "express";
import { plannerRequestSchema } from "../../validators/action.validator";
import { geminiService } from "../../services/gemini.service";

export const aiController = {
  async plan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = plannerRequestSchema.parse(req.body);
      const result = await geminiService.planActions(input);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
