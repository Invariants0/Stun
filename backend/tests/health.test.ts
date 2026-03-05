import { describe, it, expect } from "bun:test";
import request from "supertest";
import { getApp } from "./setup";

describe("Health Endpoint", () => {
  it("should return 200 and status ok", async () => {
    const app = getApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("service", "stun-backend");
  });

  it("should respond quickly (< 100ms)", async () => {
    const app = getApp();
    const start = Date.now();
    
    await request(app).get("/health");
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
