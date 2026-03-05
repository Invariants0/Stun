import { describe, it, expect, beforeAll } from "bun:test";
import { GeminiClient } from "./gemini-client";

describe("Gemini API Connectivity", () => {
  let client: GeminiClient;
  let startTime: number;
  let endTime: number;

  beforeAll(() => {
    // Load API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    client = new GeminiClient(apiKey);
  });

  it("should connect to Gemini API successfully", async () => {
    startTime = Date.now();
    
    const response = await client.generateContent("Respond with the word OK");
    
    endTime = Date.now();
    const latency = endTime - startTime;

    // Verify response structure
    expect(response).toBeDefined();
    expect(response.candidates).toBeDefined();
    expect(response.candidates?.length).toBeGreaterThan(0);

    console.log(`✓ API Response Time: ${latency}ms`);
  }, 30000);

  it("should return text content in response", async () => {
    const response = await client.generateContent("Respond with the word OK");

    // Verify text exists
    const text = client.extractText(response);
    expect(text).toBeDefined();
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);

    console.log(`✓ Response Text: "${text.substring(0, 50)}..."`);
  }, 30000);

  it("should handle simple prompts correctly", async () => {
    const response = await client.generateContent(
      "What is 2 + 2? Answer with just the number."
    );

    const text = client.extractText(response);
    expect(text).toContain("4");

    console.log(`✓ Math Test Response: "${text}"`);
  }, 30000);

  it("should verify API key is valid", async () => {
    // This test will fail if API key is invalid
    const response = await client.generateContent("Hello");
    
    expect(response.error).toBeUndefined();
    expect(response.candidates).toBeDefined();

    console.log("✓ API Key is valid");
  }, 30000);
});
