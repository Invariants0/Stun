import { getGenAI, genAIConfig } from "../config";
import { BadRequestError } from "../api/middleware/error.middleware";
import { plannerPrompt } from "../prompts/planner.prompt";
import {
  validateActionPlan,
  validateNodeReferences,
  type PlannerRequest,
  type ActionPlan,
} from "../validators/action.validator";
import { orchestratePlanning } from "./orchestrator.service";

/** Extract the first top-level JSON object from a freeform LLM response */
function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new BadRequestError("AI response contained no JSON");
  try {
    return JSON.parse(match[0]);
  } catch {
    throw new BadRequestError("AI response was not valid JSON");
  }
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
    const parsed = extractJson(text);
    const actionPlan = validateActionPlan(parsed);
    const nodeIds = input.nodes.map((n) => n.id);
    validateNodeReferences(actionPlan.actions, nodeIds);

    return actionPlan;
  },
};
