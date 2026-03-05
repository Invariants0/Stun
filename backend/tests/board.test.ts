import { describe, it, expect, beforeAll, afterEach } from "bun:test";
import request from "supertest";
import { getApp } from "./setup";
import { getFirestore, firestoreCollections } from "../src/config/firebase";

describe("Board Integration Tests", () => {
  let createdBoardIds: string[] = [];

  afterEach(async () => {
    // Clean up created boards
    const db = getFirestore();
    const deletePromises = createdBoardIds.map((id) =>
      db.collection(firestoreCollections.boards).doc(id).delete()
    );
    await Promise.all(deletePromises);
    createdBoardIds = [];
  });

  it("should reject request without auth token", async () => {
    const app = getApp();
    const response = await request(app)
      .post("/boards")
      .send({
        nodes: [],
        edges: [],
        elements: [],
      });

    expect(response.status).toBe(401);
  });

  it("should reject GET request without auth token", async () => {
    const app = getApp();
    const response = await request(app).get("/boards");

    expect(response.status).toBe(401);
  });

  // Note: Tests requiring Firebase Auth tokens are skipped in basic test mode
  // To enable full board tests, set up Firebase Auth emulator or use service account
  it.skip("should create a new board", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should list user boards", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should get a specific board", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should update a board", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should reject unauthorized access to board", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });

  it.skip("should handle non-existent board", async () => {
    // This test requires Firebase Auth token generation
    // Enable when Firebase Auth is properly configured for tests
  });
});
