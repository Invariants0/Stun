import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.middleware";
import { boardService } from "../services/board.service";

export const boardRouter = Router();

const boardPayloadSchema = z.object({
  nodes: z.array(z.unknown()).default([]),
  edges: z.array(z.unknown()).default([]),
  elements: z.array(z.unknown()).optional(),
});

boardRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = boardPayloadSchema.parse(req.body ?? {});
    const board = await boardService.createBoard(
      req.user?.uid ?? "anonymous",
      payload,
    );
    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
});

boardRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.uid ?? "anonymous";
    const board = await boardService.getBoard(boardId, userId);
    res.json(board);
  } catch (error) {
    next(error);
  }
});

boardRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.uid ?? "anonymous";
    const payload = boardPayloadSchema.parse(req.body ?? {});
    const board = await boardService.updateBoard(boardId, userId, payload);
    res.json(board);
  } catch (error) {
    next(error);
  }
});

// Update board visibility
boardRouter.patch("/:id/visibility", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.uid ?? "anonymous";
    const { visibility } = z.object({
      visibility: z.enum(["private", "view", "edit"]),
    }).parse(req.body);

    await boardService.updateVisibility(boardId, userId, visibility);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Add collaborator
boardRouter.post("/:id/share", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ownerId = req.user?.uid ?? "anonymous";
    const { userId } = z.object({
      userId: z.string(),
    }).parse(req.body);

    await boardService.addCollaborator(boardId, ownerId, userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Remove collaborator
boardRouter.delete("/:id/share/:userId", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ownerId = req.user?.uid ?? "anonymous";
    const collaboratorId = Array.isArray(req.params.userId) 
      ? req.params.userId[0] 
      : req.params.userId;

    await boardService.removeCollaborator(boardId, ownerId, collaboratorId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get collaborators
boardRouter.get("/:id/collaborators", requireAuth, async (req, res, next) => {
  try {
    const boardId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.uid ?? "anonymous";
    const collaborators = await boardService.getCollaborators(boardId, userId);
    res.json({ collaborators });
  } catch (error) {
    next(error);
  }
});
