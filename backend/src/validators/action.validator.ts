import { z } from "zod";

export const plannerRequestSchema = z.object({
  boardId: z.string().min(1),
  command: z.string().min(1),
  screenshot: z.string().min(1),
  nodes: z.array(z.object({ id: z.string() }).passthrough()).default([]),
});

export type PlannerRequest = z.infer<typeof plannerRequestSchema>;
