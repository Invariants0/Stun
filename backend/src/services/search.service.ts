/**
 * Semantic Search Service
 *
 * Generates embeddings for canvas nodes and performs cosine-similarity
 * search using Google's text-embedding-004 model.
 */

import { getGenAI } from "../config/genai";
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

const EMBEDDING_MODEL = "text-embedding-004";

/** Fields examined when building a node's text representation, in priority order. */
const TEXT_FIELDS = [
  "label", "content", "text", "title", "summary",
  "description", "alt", "transcript", "caption", "name",
];

class SearchService {
  /** Build a plain-text description of a node for embedding. */
  private extractText(node: SearchNode): string {
    const data = node.data ?? {};
    const parts: string[] = [];

    for (const key of TEXT_FIELDS) {
      const val = data[key];
      if (typeof val === "string" && val.trim()) {
        parts.push(val.trim());
      }
    }

    // Include node type as lightweight semantic signal
    if (node.type && node.type !== "default") {
      parts.push(`[${node.type}]`);
    }

    return parts.join(" ").slice(0, 1500);
  }

  /**
   * Embed an array of texts in a single batched API call.
   * Returns a parallel array of embedding vectors.
   */
  private async batchEmbed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const genai = getGenAI();
    const response = await genai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
    });

    return (response.embeddings ?? []).map((e) => e.values ?? []);
  }

  /** Cosine similarity between two equal-length vectors. */
  private cosine(a: number[], b: number[]): number {
    if (a.length === 0 || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot   += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Semantically search canvas nodes for the given query.
   *
   * @param query   - Natural language search query
   * @param nodes   - All nodes currently on the canvas
   * @param filters - Optional type/minScore/topK filters
   */
  async search(
    query: string,
    nodes: SearchNode[],
    filters: SearchFilters = {},
  ): Promise<SearchResult[]> {
    const { type, minScore = 0.25, topK = 10 } = filters;

    // Apply type pre-filter
    const candidates = type ? nodes.filter((n) => n.type === type) : nodes;
    if (candidates.length === 0) return [];

    // Build text representations and discard empty nodes
    const nodeTexts = candidates.map((n) => this.extractText(n));
    const validIndices = nodeTexts.reduce<number[]>((acc, t, i) => {
      if (t.trim()) acc.push(i);
      return acc;
    }, []);

    if (validIndices.length === 0) return [];

    const validTexts = validIndices.map((i) => nodeTexts[i]);

    // Embed query + all valid node texts in one round-trip
    logger.debug(`[search] Embedding query + ${validTexts.length} nodes`);
    const allEmbeddings = await this.batchEmbed([query, ...validTexts]);

    const [queryVec, ...nodeVecs] = allEmbeddings;

    // Score nodes
    const results: SearchResult[] = validIndices.map((nodeIndex, embIndex) => {
      const node = candidates[nodeIndex];
      const score = this.cosine(queryVec, nodeVecs[embIndex]);
      const preview = nodeTexts[nodeIndex].slice(0, 120);

      return {
        nodeId: node.id,
        score,
        preview,
        type: node.type ?? "default",
        position: node.position,
      };
    });

    return results
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export const searchService = new SearchService();
