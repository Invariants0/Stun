import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { boardService } from "../../services/board.service";
import type { BoardPayload } from "../models/board.model";

const boardPayloadSchema = z.object({
  nodes: z.array(z.unknown()).default([]),
  edges: z.array(z.unknown()).default([]),
  elements: z.array(z.unknown()).optional(),
});

const visibilitySchema = z.object({
  visibility: z.enum(["private", "view", "edit"]),
});

const collaboratorSchema = z.object({
  userId: z.string().min(1),
});

export const boardController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = boardPayloadSchema.parse(req.body ?? {}) as BoardPayload;
      const board = await boardService.createBoard(req.user!.uid, payload);
      res.status(201).json(board);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const boards = await boardService.listBoards(req.user!.uid);
      res.json({ boards });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.getBoard(req.params['id'] as string, req.user!.uid);
      res.json(board);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = boardPayloadSchema.parse(req.body ?? {}) as BoardPayload;
      const board = await boardService.updateBoard(req.params['id'] as string, req.user!.uid, payload);
      res.json(board);
    } catch (err) {
      next(err);
    }
  },

  async updateVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { visibility } = visibilitySchema.parse(req.body);
      await boardService.updateVisibility(req.params['id'] as string, req.user!.uid, visibility);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async addCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = collaboratorSchema.parse(req.body);
      await boardService.addCollaborator(req.params['id'] as string, req.user!.uid, userId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async removeCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await boardService.removeCollaborator(
        req.params['id'] as string,
        req.user!.uid,
        req.params['userId'] as string
      );
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async getCollaborators(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collaborators = await boardService.getCollaborators(req.params['id'] as string, req.user!.uid);
      res.json({ collaborators });
    } catch (err) {
      next(err);
    }
  },
};
