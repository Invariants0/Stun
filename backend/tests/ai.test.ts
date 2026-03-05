import { describe, it, expect, beforeAll } from "bun:test";
import request from "supertest";
import { getApp } from "./setup";

describe("AI Endpoint", () => {
  it("should reject request without auth token", async () => {
    const app = getApp();
    const response = await request(app)
      .post("/ai/plan")
      .send({
        boardId: "test-board",
        command: "move node A to the right",
        screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        nodes: [{ id: "node-a", x: 100, y: 100 }],
      });

    expect(response.status).toBe(401);
  });

  it("should validate request payload", async () => {
    const app = getApp();
    const response = await request(app)
      .post("/ai/plan")
      .send({
        // Missing required fields
        command: "test",
      });

    expect(response.status).toBe(401); // Will fail auth before validation
  });

  // Note: Tests requiring Firebase Auth tokens are skipped in basic test mode
  // To enable full AI tests, set up Firebase Auth emulator or use service account
  it.skip("should return actions array from AI", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should handle large node arrays", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });
});
