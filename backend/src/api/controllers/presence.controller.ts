import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { boardAccessService } from "../../services/boardAccess.service";
import { presenceService } from "../../services/presence.service";

const cursorSchema = z.object({
  cursor: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
});

export const presenceController = {
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { boardId } = req.params;
      const userId = req.user!.uid;

      const canView = await boardAccessService.canView(boardId as string, userId);
      if (!canView) {
        res.status(403).json({ error: "Unauthorized access to board" });
        return;
      }

      const { cursor } = cursorSchema.parse(req.body ?? {});
      await presenceService.updatePresence(boardId as string, userId, cursor);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { boardId } = req.params;
      const userId = req.user!.uid;

      const canView = await boardAccessService.canView(boardId as string, userId);
      if (!canView) {
        res.status(403).json({ error: "Unauthorized access to board" });
        return;
      }

      const activeUsers = await presenceService.getActiveUsers(boardId as string);
      res.json({ activeUsers });
    } catch (err) {
      next(err);
    }
  },
};
