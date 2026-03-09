/**
 * Search Routes - Semantic Canvas Search API
 */

import express from "express";
import { searchController } from "../controllers/search.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const searchRouter = express.Router();

/**
 * POST /search
 * Semantically search canvas nodes using embedding similarity.
 */
searchRouter.post(
  "/",
  requireAuth,
  searchController.search.bind(searchController),
);
