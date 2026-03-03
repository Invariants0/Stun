import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.middleware";
import { boardService } from "../services/board.service";

export const boardRouter = Router();

const boardPayloadSchema = z.object({
  nodes: z.array(z.unknown()).default([]),
  edges: z.array(z.unknown()).default([]),
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
    const board = await boardService.getBoard(
      req.params.id,
      req.user?.uid ?? "anonymous",
    );
    res.json(board);
  } catch (error) {
    next(error);
  }
});

boardRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = boardPayloadSchema.parse(req.body ?? {});
    const board = await boardService.updateBoard(
      req.params.id,
      req.user?.uid ?? "anonymous",
      payload,
    );
    res.json(board);
  } catch (error) {
    next(error);
  }
});
