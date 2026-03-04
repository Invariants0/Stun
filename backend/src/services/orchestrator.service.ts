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
import type { PlannerRequest } from "../validators/action.validator";

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
