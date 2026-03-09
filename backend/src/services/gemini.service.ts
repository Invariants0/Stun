import { getGenAI, genAIConfig } from "../config";
import { BadRequestError } from "../api/middleware/error.middleware";
import { plannerPrompt } from "../prompts/planner.prompt";
import {
  validateActionPlan,
  validateNodeReferences,
  type PlannerRequest,
  type ActionPlan,
} from "../validators/action.validator";
import { orchestratePlanning, sanitizeActionPositions } from "./orchestrator.service";

/** Extract the first top-level JSON object from a freeform LLM response */
function extractJson(text: string): unknown {
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Fall through to try other methods
    }
  }

  // Try to find the largest JSON object in the text
  const jsonMatches = text.match(/\{[\s\S]*?\}/g);
  if (!jsonMatches || jsonMatches.length === 0) {
    throw new BadRequestError("AI response contained no JSON object");
  }

  // Sort by length descending to get the largest JSON object
  const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);

  // Try to parse each match until we find valid JSON
  for (const match of sortedMatches) {
    try {
      const parsed = JSON.parse(match);
      // Validate it's an object (not a primitive)
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      // Continue to next match
    }
  }

  throw new BadRequestError("AI response contained no valid JSON object");
}

export const geminiService = {
  async planActions(input: PlannerRequest): Promise<ActionPlan> {
    const genAI = getGenAI();

    const orchestrationContext = orchestratePlanning(input);
    const prompt = plannerPrompt(
      input.command,
      orchestrationContext.spatialSummary,
      orchestrationContext.guidance
    );

    const imagePart = {
      inlineData: {
        data: input.screenshot.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/png" as const,
      },
    };

    const nodeContext =
      input.nodes.length > 0
        ? `\n\nCurrent nodes on canvas:\n${JSON.stringify(input.nodes, null, 2)}`
        : "\n\nCanvas is currently empty.";

    const result = await genAI.models.generateContent({
      model: genAIConfig.model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt + nodeContext }, imagePart],
        },
      ],
    });

    const text = result.text ?? "";
    console.log("[Gemini] Raw AI response:", text.substring(0, 500)); // Log first 500 chars
    
    const parsed = extractJson(text);
    console.log("[Gemini] Parsed JSON:", JSON.stringify(parsed, null, 2));
    
    const actionPlan = validateActionPlan(parsed);
    console.log("[Gemini] Validated action plan:", JSON.stringify(actionPlan, null, 2));
    
    const nodeIds = input.nodes.map((n) => n.id);
    validateNodeReferences(actionPlan.actions, nodeIds);

    // Sanitize action positions to ensure zone-safe placement
    const bounds = orchestrationContext.rawContext.bounds;
    const boundingBox = {
      x1: bounds.minX,
      y1: bounds.minY,
      x2: bounds.maxX,
      y2: bounds.maxY,
    };
    const sanitizedActions = sanitizeActionPositions(
      actionPlan.actions,
      boundingBox
    );

    console.log("[Gemini] Final sanitized actions:", JSON.stringify(sanitizedActions, null, 2));

    return { actions: sanitizedActions };
  },
};
