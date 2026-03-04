import { getGenAI, vertexConfig } from "../config/vertex";
import { plannerPrompt } from "../prompts/planner.prompt";
import {
  validateActionPlan,
  validateNodeReferences,
  type PlannerRequest,
  type ActionPlan,
} from "../validators/action.validator";
import { orchestratePlanning } from "./orchestrator.service";

export const geminiService = {
  async planActions(input: PlannerRequest): Promise<ActionPlan> {
    try {
      const genAI = getGenAI();

      // Orchestrate: parse intent and build spatial context
      const orchestrationContext = orchestratePlanning(input);

      // Prepare the enhanced prompt with spatial intelligence
      const prompt = plannerPrompt(
        input.command,
        orchestrationContext.spatialSummary,
        orchestrationContext.guidance
      );

      // Prepare the image part
      const imagePart = {
        inlineData: {
          data: input.screenshot.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/png",
        },
      };

      // Prepare node context
      const nodeContext = input.nodes.length > 0
        ? `\n\nCurrent nodes on canvas:\n${JSON.stringify(input.nodes, null, 2)}`
        : "\n\nCanvas is currently empty.";

      // Generate content with multimodal input
      const result = await genAI.models.generateContent({
        model: vertexConfig.model,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt + nodeContext },
              imagePart,
            ],
          },
        ],
      });

      const text = result.text ?? "";

      // Parse and validate the response
      let parsedResponse: unknown;
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("AI response was not valid JSON");
      }

      // Validate action plan structure
      const actionPlan = validateActionPlan(parsedResponse);

      // Validate node references
      const nodeIds = input.nodes.map((n) => n.id);
      validateNodeReferences(actionPlan.actions, nodeIds);

      return actionPlan;
    } catch (error) {
      console.error("Gemini service error:", error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Failed to generate action plan");
    }
  },
};
