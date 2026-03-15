/**
 * Text Search Service
 *
 * Simple text-based search across canvas nodes.
 * Searches node fields for matching text and returns results ranked by relevance.
 */

import { logger } from "../config/logger";

// ============================================================================
// Public types
// ============================================================================

export interface SearchNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
}

export interface SearchResult {
  nodeId: string;
  score: number;
  preview: string;
  type: string;
  position?: { x: number; y: number };
}

export interface SearchFilters {
  /** Only return nodes whose type matches this value */
  type?: string;
  /** Minimum cosine similarity score (0-1), default 0.25 */
  minScore?: number;
  /** Maximum number of results to return, default 10 */
  topK?: number;
}

// ============================================================================
// Implementation
// ============================================================================

const TEXT_FIELDS = [
  "label", "content", "text", "title", "summary",
  "description", "alt", "transcript", "caption", "name",
  "value", "message", "body", "details", "note",
];

class SearchService {
  /** Build a plain-text description of a node for searching. */
  private extractText(node: SearchNode): string {
    const data = node.data ?? {};
    const parts: string[] = [];

    // Extract from known text fields
    for (const key of TEXT_FIELDS) {
      const val = data[key];
      if (typeof val === "string" && val.trim()) {
        parts.push(val.trim());
      }
    }

    // If no text found, search all string fields
    if (parts.length === 0) {
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === "string" && val.trim() && val.length > 1) {
          parts.push(val.trim());
        }
      }
    }

    // Include node type as text signal
    if (node.type && node.type !== "default") {
      parts.push(`[${node.type}]`);
    }

    return parts.join(" ").slice(0, 1500) || `node-${node.id}`;
  }

  /**
   * Calculate relevance score based on text matching.
   * Returns a score between 0 and 1.
   */
  private calculateScore(nodeText: string, query: string): number {
    const queryLower = query.toLowerCase();
    const textLower = nodeText.toLowerCase();

    // Exact match (anywhere in text)
    if (textLower === queryLower) return 1.0;

    // Word boundary match (word starts with query)
    const words = textLower.split(/\s+/);
    if (words.some((w) => w.startsWith(queryLower))) return 0.8;

    // Substring match
    if (textLower.includes(queryLower)) return 0.5;

    return 0;
  }

  /**
   * Search canvas nodes for the given query using text matching.
   *
   * @param query   - Search query string
   * @param nodes   - All nodes currently on the canvas
   * @param filters - Optional type/minScore/topK filters
   */
  async search(
    query: string,
    nodes: SearchNode[],
    filters: SearchFilters = {},
  ): Promise<SearchResult[]> {
    const { type, minScore = 0.3, topK = 10 } = filters;

    // Apply type pre-filter
    const candidates = type ? nodes.filter((n) => n.type === type) : nodes;
    if (candidates.length === 0) {
      logger.debug(`[search] No candidates after type filter: type=${type}`);
      return [];
    }

    // Search and score all nodes
    const results: SearchResult[] = candidates
      .map((node) => {
        const text = this.extractText(node);
        const score = this.calculateScore(text, query);
        const preview = text.slice(0, 120);

        return {
          nodeId: node.id,
          score,
          preview,
          type: node.type ?? "default",
          position: node.position,
        };
      })
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    logger.debug(`[search] Found ${results.length} results matching "${query}" with score >= ${minScore}`);
    return results;
  }
}

export const searchService = new SearchService();
