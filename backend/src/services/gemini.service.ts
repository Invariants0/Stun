import { plannerPrompt } from "../prompts/planner.prompt";
import type { PlannerRequest } from "../validators/action.validator";

export const geminiService = {
  async planActions(input: PlannerRequest) {
    const _prompt = plannerPrompt(input.command);

    return {
      actions: [
        {
          type: "move",
          nodeId: input.nodes?.[0]?.id ?? "node-1",
          to: { x: 400, y: 200 },
        },
      ],
    };
  },
};
