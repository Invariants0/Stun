/**
 * Layout Routes - Canvas Layout Transformation API
 */

import express from "express";
import { layoutController } from "../controllers/layout.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateBoard } from "../middleware/board.middleware";

export const layoutRouter = express.Router();

/**
 * POST /layout/transform
 * Transform canvas nodes into specified layout
 */
layoutRouter.post("/transform", 
  authenticateToken, 
  validateBoard, 
  layoutController.transform.bind(layoutController)
);

/**
 * GET /layout/types
 * Get available layout types and their descriptions
 */
layoutRouter.get("/types", 
  authenticateToken,
  layoutController.getLayoutTypes.bind(layoutController)
);

/**
 * POST /layout/preview
 * Preview layout transformation without applying
 */
layoutRouter.post("/preview", 
  authenticateToken,
  validateBoard,
  layoutController.preview.bind(layoutController)
);