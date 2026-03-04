import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.middleware";
import { boardAccessService } from "../services/boardAccess.service";
import { presenceService } from "../services/presence.service";

export const presenceRouter = Router();

// Update presence
presenceRouter.post("/:boardId", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.boardId) 
      ? req.params.boardId[0] 
      : req.params.boardId;
    const userId = req.user?.uid ?? "anonymous";

    // Verify user has access to board
    const canView = await boardAccessService.canView(boardId, userId);
    if (!canView) {
      res.status(403).json({ error: "Unauthorized access to board" });
      return;
    }

    const { cursor } = z.object({
      cursor: z.object({
        x: z.number(),
        y: z.number(),
      }).optional(),
    }).parse(req.body ?? {});

    await presenceService.updatePresence(boardId, userId, cursor);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get active users
presenceRouter.get("/:boardId", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.boardId) 
      ? req.params.boardId[0] 
      : req.params.boardId;
    const userId = req.user?.uid ?? "anonymous";

    // Verify user has access to board
    const canView = await boardAccessService.canView(boardId, userId);
    if (!canView) {
      res.status(403).json({ error: "Unauthorized access to board" });
      return;
    }

    const activeUsers = await presenceService.getActiveUsers(boardId);
    res.json({ activeUsers });
  } catch (error) {
    next(error);
  }
});

// Remove presence
presenceRouter.delete("/:boardId", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.boardId) 
      ? req.params.boardId[0] 
      : req.params.boardId;
    const userId = req.user?.uid ?? "anonymous";

    await presenceService.removePresence(boardId, userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
