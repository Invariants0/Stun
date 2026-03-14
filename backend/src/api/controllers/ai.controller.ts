import type { NextFunction, Request, Response } from "express";
import { plannerRequestSchema } from "../../validators/action.validator";
import { geminiService } from "../../services/gemini.service";

export const aiController = {
  async plan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = plannerRequestSchema.parse(req.body);
      console.log("[AI COMMAND RECEIVED]", {
        boardId: input.boardId,
        command: input.command,
        viewport: input.viewport,
        nodeCount: input.nodes.length,
      });
      const result = await geminiService.planActions(input);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
