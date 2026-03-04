import { z } from "zod";

export const plannerRequestSchema = z.object({
  boardId: z.string().min(1),
  command: z.string().min(1),
  screenshot: z.string().min(1),
  nodes: z.array(z.object({ id: z.string() }).passthrough()).default([]),
});

export type PlannerRequest = z.infer<typeof plannerRequestSchema>;

// Action schemas
const moveActionSchema = z.object({
  type: z.literal("move"),
  nodeId: z.string(),
  to: z.object({
    x: z.number().min(-10000).max(10000),
    y: z.number().min(-10000).max(10000),
  }),
});

const connectActionSchema = z.object({
  type: z.literal("connect"),
  from: z.string(),
  to: z.string(),
});

const highlightActionSchema = z.object({
  type: z.literal("highlight"),
  nodeId: z.string(),
  duration: z.number().optional(),
});

const zoomActionSchema = z.object({
  type: z.literal("zoom"),
  level: z.number().min(0.1).max(5),
  center: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

const groupActionSchema = z.object({
  type: z.literal("group"),
  nodeIds: z.array(z.string()).min(1),
  label: z.string().optional(),
});

const createActionSchema = z.object({
  type: z.literal("create"),
  nodeType: z.string(),
  text: z.string(),
  position: z.object({
    x: z.number().min(-10000).max(10000),
    y: z.number().min(-10000).max(10000),
  }).optional(),
});

const deleteActionSchema = z.object({
  type: z.literal("delete"),
  nodeId: z.string(),
});

const transformActionSchema = z.object({
  type: z.literal("transform"),
  nodeId: z.string(),
  nodeType: z.string(),
});

export const actionSchema = z.discriminatedUnion("type", [
  moveActionSchema,
  connectActionSchema,
  highlightActionSchema,
  zoomActionSchema,
  groupActionSchema,
  createActionSchema,
  deleteActionSchema,
  transformActionSchema,
]);

export const actionPlanSchema = z.object({
  actions: z.array(actionSchema),
});

export type Action = z.infer<typeof actionSchema>;
export type ActionPlan = z.infer<typeof actionPlanSchema>;

export function validateActionPlan(data: unknown): ActionPlan {
  return actionPlanSchema.parse(data);
}

export function validateNodeReferences(actions: Action[], nodeIds: string[]): void {
  const nodeIdSet = new Set(nodeIds);
  
  for (const action of actions) {
    if (action.type === "move" || action.type === "highlight") {
      if (!nodeIdSet.has(action.nodeId)) {
        throw new Error(`Invalid nodeId reference: ${action.nodeId}`);
      }
    } else if (action.type === "connect") {
      if (!nodeIdSet.has(action.from)) {
        throw new Error(`Invalid nodeId reference: ${action.from}`);
      }
      if (!nodeIdSet.has(action.to)) {
        throw new Error(`Invalid nodeId reference: ${action.to}`);
      }
    } else if (action.type === "group") {
      for (const nodeId of action.nodeIds) {
        if (!nodeIdSet.has(nodeId)) {
          throw new Error(`Invalid nodeId reference in group: ${nodeId}`);
        }
      }
    } else if (action.type === "delete" || action.type === "transform") {
      if (!nodeIdSet.has(action.nodeId)) {
        throw new Error(`Invalid nodeId reference: ${action.nodeId}`);
      }
    }
    // Note: "create" actions don't reference existing nodes
  }
}
