import { describe, it, expect, beforeAll } from "bun:test";
import { z } from "zod";
import { GeminiClient } from "./gemini-client";

// Define Zod schemas for action validation
const MoveActionSchema = z.object({
  type: z.literal("move"),
  nodeId: z.string(),
  to: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const CreateActionSchema = z.object({
  type: z.literal("create"),
  nodeType: z.string(),
  text: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

const ConnectActionSchema = z.object({
  type: z.literal("connect"),
  from: z.string(),
  to: z.string(),
});

const HighlightActionSchema = z.object({
  type: z.literal("highlight"),
  nodeId: z.string(),
  duration: z.number().optional(),
});

const DeleteActionSchema = z.object({
  type: z.literal("delete"),
  nodeId: z.string(),
});

const ZoomActionSchema = z.object({
  type: z.literal("zoom"),
  level: z.number(),
  center: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

const ActionSchema = z.discriminatedUnion("type", [
  MoveActionSchema,
  CreateActionSchema,
  ConnectActionSchema,
  HighlightActionSchema,
  DeleteActionSchema,
  ZoomActionSchema,
]);

const ActionPlanSchema = z.object({
  actions: z.array(ActionSchema),
});

describe("Gemini Schema Validation", () => {
  let client: GeminiClient;

  beforeAll(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    client = new GeminiClient(apiKey);
  });

  it("should validate move action schema", async () => {
    const prompt = `Return ONLY this exact JSON, nothing else:
{
  "actions": [
    {
      "type": "move",
      "nodeId": "node_23",
      "to": { "x": 100, "y": 200 }
    }
  ]
}`;

    const response = await client.generateContent(prompt, 0.1);
    const jsonData = client.extractJSON(response);

    // Validate with Zod
    const result = ActionPlanSchema.safeParse(jsonData);
    
    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
      console.log("Received data:", JSON.stringify(jsonData, null, 2));
    }

    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.actions[0].type).toBe("move");
      console.log("✓ Move action schema validated successfully");
    }
  }, 30000);

  it("should validate create action schema", async () => {
    const prompt = `Return ONLY this exact JSON, nothing else:
{
  "actions": [
    {
      "type": "create",
      "nodeType": "text",
      "text": "Hello World",
      "position": { "x": 0, "y": 0 }
    }
  ]
}`;

    const response = await client.generateContent(prompt, 0.1);
    const jsonData = client.extractJSON(response);

    const result = ActionPlanSchema.safeParse(jsonData);
    
    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
    }

    expect(result.success).toBe(true);
    console.log("✓ Create action schema validated successfully");
  }, 30000);

  it("should validate connect action schema", async () => {
    const prompt = `Return ONLY this exact JSON, nothing else:
{
  "actions": [
    {
      "type": "connect",
      "from": "node_1",
      "to": "node_2"
    }
  ]
}`;

    const response = await client.generateContent(prompt, 0.1);
    const jsonData = client.extractJSON(response);

    const result = ActionPlanSchema.safeParse(jsonData);
    expect(result.success).toBe(true);
    console.log("✓ Connect action schema validated successfully");
  }, 30000);

  it("should validate multiple actions in array", async () => {
    const prompt = `Return ONLY this exact JSON, nothing else:
{
  "actions": [
    {
      "type": "move",
      "nodeId": "node_1",
      "to": { "x": 50, "y": 50 }
    },
    {
      "type": "highlight",
      "nodeId": "node_1",
      "duration": 2000
    },
    {
      "type": "connect",
      "from": "node_1",
      "to": "node_2"
    }
  ]
}`;

    const response = await client.generateContent(prompt, 0.1);
    const jsonData = client.extractJSON(response);

    const result = ActionPlanSchema.safeParse(jsonData);
    
    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
      console.log("Received data:", JSON.stringify(jsonData, null, 2));
    }

    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.actions.length).toBe(3);
      console.log(`✓ Multiple actions validated: ${result.data.actions.length} actions`);
    }
  }, 30000);

  it("should reject invalid action schema", () => {
    const invalidData = {
      actions: [
        {
          type: "move",
          // Missing required nodeId
          to: { x: 100, y: 200 },
        },
      ],
    };

    const result = ActionPlanSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      console.log("✓ Invalid schema correctly rejected");
      console.log("  Errors:", result.error.issues.map(e => e.message).join(", "));
    }
  });
});
