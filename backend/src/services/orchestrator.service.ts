/**
 * AI Orchestration Service
 * Coordinates intent parsing, context building, and AI planning
 */

import { parseIntent, getIntentGuidance } from "./intent-parser";
import {
  buildSpatialContext,
  generateContextSummary,
  type ContextBuilderInput,
} from "./context-builder";
import { clampToSafeBounds, type BoundingBox } from "../utils/spatial";
import type { PlannerRequest } from "../validators/action.validator";
import type { Action } from "../validators/action.validator";

export interface OrchestrationContext {
  intent: string;
  intentConfidence: string;
  spatialSummary: string;
  guidance: string;
  rawContext: ReturnType<typeof buildSpatialContext>;
}

/**
 * Orchestrate the AI planning process
 * Enriches the request with spatial intelligence before AI call
 */
export function orchestratePlanning(
  request: PlannerRequest
): OrchestrationContext {
  // Parse command intent
  const parsedIntent = parseIntent(request.command);

  // Build spatial context
  const contextInput: ContextBuilderInput = {
    nodes: request.nodes.map(node => ({
      ...node,
      id: node.id,
      position: (node as any).position ?? { x: 0, y: 0 },
    })),
    edges: (request as any).edges,
    viewport: (request as any).viewport,
    selectedNodes: (request as any).selectedNodes,
  };

  const spatialContext = buildSpatialContext(contextInput);

  // Generate context summary
  const spatialSummary = generateContextSummary(spatialContext);

  // Get intent-specific guidance
  const guidance = getIntentGuidance(parsedIntent.intent);

  return {
    intent: parsedIntent.intent,
    intentConfidence: parsedIntent.confidence,
    spatialSummary,
    guidance,
    rawContext: spatialContext,
  };
}

/**
 * Validate and sanitize action positions to ensure they're within safe bounds
 * Prevents nodes from spawning outside canvas bounds
 */
export function sanitizeActionPositions(
  actions: Action[],
  bounds: BoundingBox
): Action[] {
  // Expand bounds slightly for safety margin
  const safeBounds: BoundingBox = {
    x1: bounds.x1 - 1000,
    y1: bounds.y1 - 1000,
    x2: bounds.x2 + 1000,
    y2: bounds.y2 + 1000,
  };

  // If bounds are empty (no nodes), use default safe bounds
  if (bounds.x1 === 0 && bounds.x2 === 0) {
    safeBounds.x1 = -5000;
    safeBounds.y1 = -5000;
    safeBounds.x2 = 5000;
    safeBounds.y2 = 5000;
  }

  return actions.map(action => {
    if (action.type === "move") {
      const clampedPosition = clampToSafeBounds(action.to, safeBounds);
      return {
        ...action,
        to: clampedPosition,
      };
    } else if (action.type === "create" && action.position) {
      const clampedPosition = clampToSafeBounds(action.position, safeBounds);
      return {
        ...action,
        position: clampedPosition,
      };
    }
    return action;
  });
}
