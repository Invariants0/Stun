/**
 * Board Access Middleware
 *
 * Validates that the authenticated user has edit access to the board
 * specified in req.body.boardId before proceeding to the controller.
 */

import type { NextFunction, Request, Response } from "express";
import { boardAccessService } from "../../services/boardAccess.service";

export async function validateBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const boardId: string | undefined = req.body?.boardId;

  if (!boardId) {
    res.status(400).json({ error: "Bad Request", message: "boardId is required" });
    return;
  }

  if (!req.user?.uid) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  try {
    const canEdit = await boardAccessService.canEdit(boardId, req.user.uid);
    if (!canEdit) {
      res.status(403).json({ error: "Forbidden", message: "Insufficient board access" });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
