/**
 * Search Controller
 *
 * Handles semantic search requests over canvas nodes.
 */

import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { searchService } from "../../services/search.service";
import { logger } from "../../config/logger";

// ============================================================================
// Zod schemas
// ============================================================================

const SearchNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

const SearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  nodes: z.array(SearchNodeSchema).min(1).max(500),
  filters: z
    .object({
      type: z.string().optional(),
      minScore: z.number().min(0).max(1).optional(),
      topK: z.number().int().min(1).max(50).optional(),
    })
    .optional(),
});

// ============================================================================
// Controller
// ============================================================================

class SearchController {
  /**
   * POST /search
   *
   * Body: { query, nodes, filters? }
   * Returns ranked list of matching nodes with similarity scores.
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = SearchRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: "Validation Error",
          details: validation.error.issues,
        });
        return;
      }

      const { query, nodes, filters } = validation.data;

      logger.info(`[search] user=${req.user?.uid} query="${query}" nodes=${nodes.length}`);

      const results = await searchService.search(query, nodes, filters ?? {});

      res.json({ results, total: results.length, query });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
