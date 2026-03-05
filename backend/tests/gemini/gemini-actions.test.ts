import { describe, it, expect, beforeAll } from "bun:test";
import { GeminiClient } from "./gemini-client";
import commands from "../fixtures/commands.json";

describe("Gemini Canvas Actions", () => {
  let client: GeminiClient;

  beforeAll(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    client = new GeminiClient(apiKey);
  });

  it("should return JSON for move node command", async () => {
    const prompt = `You are an AI controlling an infinite canvas. Return JSON only.
User command: move node_23 20px left.

Expected format:
{
  "actions": [
    {
      "type": "move",
      "nodeId": "node_23",
      "to": { "x": -20, "y": 0 }
    }
  ]
}

Return only valid JSON, no explanation.`;

    const response = await client.generateContent(prompt, 0.3);
    const text = client.extractText(response);

    // Verify response exists
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(0);

    console.log(`✓ Move Command Response: ${text.substring(0, 100)}...`);

    // Try to parse JSON
    let jsonData;
    try {
      jsonData = client.extractJSON(response);
    } catch (error) {
      console.log("Raw response:", text);
      throw error;
    }

    // Verify actions array exists
    expect(jsonData).toBeDefined();
    expect(jsonData.actions).toBeDefined();
    expect(Array.isArray(jsonData.actions)).toBe(true);

    console.log(`✓ Actions Array: ${JSON.stringify(jsonData.actions, null, 2)}`);
  }, 30000);

  it("should return JSON for create node command", async () => {
    const prompt = `You are an AI controlling an infinite canvas. Return JSON only.
User command: create a text node saying "Hello World".

Expected format:
{
  "actions": [
    {
      "type": "create",
      "nodeType": "text",
      "text": "Hello World",
      "position": { "x": 0, "y": 0 }
    }
  ]
}

Return only valid JSON, no explanation.`;

    const response = await client.generateContent(prompt, 0.3);
    const jsonData = client.extractJSON(response);

    expect(jsonData.actions).toBeDefined();
    expect(Array.isArray(jsonData.actions)).toBe(true);
    expect(jsonData.actions.length).toBeGreaterThan(0);

    const action = jsonData.actions[0];
    expect(action.type).toBe("create");

    console.log(`✓ Create Action: ${JSON.stringify(action, null, 2)}`);
  }, 30000);

  it("should handle multiple commands from fixtures", async () => {
    const command = commands[0]; // "summarize the canvas"

    const prompt = `You are an AI controlling an infinite canvas. Return JSON only.
User command: ${command}

Expected format:
{
  "actions": [
    {
      "type": "highlight",
      "nodeId": "summary_node"
    }
  ]
}

Return only valid JSON, no explanation.`;

    const response = await client.generateContent(prompt, 0.3);
    const jsonData = client.extractJSON(response);

    expect(jsonData).toBeDefined();
    expect(jsonData.actions).toBeDefined();

    console.log(`✓ Command "${command}" processed successfully`);
  }, 30000);

  it("should return structured actions for complex commands", async () => {
    const prompt = `You are an AI controlling an infinite canvas. Return JSON only.
User command: connect node_1 to node_2 and highlight both.

Expected format:
{
  "actions": [
    {
      "type": "connect",
      "from": "node_1",
      "to": "node_2"
    },
    {
      "type": "highlight",
      "nodeId": "node_1"
    },
    {
      "type": "highlight",
      "nodeId": "node_2"
    }
  ]
}

Return only valid JSON, no explanation.`;

    const response = await client.generateContent(prompt, 0.3);
    const jsonData = client.extractJSON(response);

    expect(jsonData.actions).toBeDefined();
    expect(Array.isArray(jsonData.actions)).toBe(true);
    expect(jsonData.actions.length).toBeGreaterThan(0);

    console.log(`✓ Complex Command Actions: ${jsonData.actions.length} actions generated`);
  }, 30000);
});
