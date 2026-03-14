import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { boardService } from "../../services/board.service";
import { getFirebaseAuth } from "../../config";
import type { BoardPayload } from "../models/board.model";

const boardPayloadSchema = z.object({
  nodes: z.array(z.unknown()).default([]),
  edges: z.array(z.unknown()).default([]),
  elements: z.array(z.unknown()).optional(),
  files: z.record(z.string(), z.any()).optional(),
});

const visibilitySchema = z.object({
  visibility: z.enum(["view", "edit"]),
});

const collaboratorSchema = z
  .object({
    userId: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((val) => Boolean(val.userId || val.email), {
    message: "userId or email is required",
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
      const { userId, email } = collaboratorSchema.parse(req.body);
      let collaboratorId = userId;
      if (!collaboratorId && email) {
        const userRecord = await getFirebaseAuth().getUserByEmail(email);
        collaboratorId = userRecord.uid;
      }
      if (!collaboratorId) {
        res.status(400).json({ error: "INVALID_COLLABORATOR", message: "userId or email is required" });
        return;
      }
      await boardService.addCollaborator(req.params['id'] as string, req.user!.uid, collaboratorId);
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
      const collaboratorIds = await boardService.getCollaborators(req.params['id'] as string, req.user!.uid);
      const auth = getFirebaseAuth();
      const results = await Promise.allSettled(
        collaboratorIds.map((uid) => auth.getUser(uid))
      );
      const collaborators = results.map((result, index) => {
        const userId = collaboratorIds[index];
        if (result.status === "fulfilled") {
          const user = result.value;
          return {
            userId,
            userEmail: user.email ?? "",
            userName: user.displayName ?? "",
            displayName: user.displayName ?? "",
            photoURL: user.photoURL ?? "",
            addedAt: "",
          };
        }
        return {
          userId,
          userEmail: "",
          userName: "",
          displayName: "",
          photoURL: "",
          addedAt: "",
        };
      });
      res.json({ collaborators });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await boardService.deleteBoard(req.params['id'] as string, req.user!.uid);
      res.json({ success: true, message: "Board deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
