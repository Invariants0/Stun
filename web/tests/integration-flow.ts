/**
 * Integration Flow Test
 * 
 * Simple test script to verify end-to-end integration
 * Run with: bun run web/tests/integration-flow.ts
 * 
 * Prerequisites:
 * - Backend running on localhost:8080
 * - Valid Firebase auth token
 */

import { api } from "../lib/api-client";
import type { Board, BoardPayload, AIActionRequest } from "../types/api.types";

// Test configuration
const TEST_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  testBoardName: `test-board-${Date.now()}`,
};

// Mock auth token (replace with real token for actual testing)
let authToken: string | null = null;

// Test results
const results: { test: string; passed: boolean; error?: string }[] = [];

function log(message: string) {
  console.log(`[TEST] ${message}`);
}

function logSuccess(test: string) {
  console.log(`✅ ${test}`);
  results.push({ test, passed: true });
}

function logError(test: string, error: any) {
  console.error(`❌ ${test}: ${error.message || error}`);
  results.push({ test, passed: false, error: error.message || String(error) });
}

async function testCreateBoard(): Promise<Board | null> {
  const test = "Create Board";
  try {
    log("Creating new board...");
    const payload: BoardPayload = {
      nodes: [
        {
          id: "node-1",
          type: "text",
          position: { x: 100, y: 100 },
          data: { label: "Test Node" },
        },
      ],
      edges: [],
      elements: [],
    };

    const board = await api.post<Board>("/boards", payload);
    
    if (!board.id) {
      throw new Error("Board created but no ID returned");
    }

    log(`Board created with ID: ${board.id}`);
    logSuccess(test);
    return board;
  } catch (error) {
    logError(test, error);
    return null;
  }
}

async function testLoadBoard(boardId: string): Promise<boolean> {
  const test = "Load Board";
  try {
    log(`Loading board ${boardId}...`);
    const board = await api.get<Board>(`/boards/${boardId}`);
    
    if (board.id !== boardId) {
      throw new Error("Loaded board ID doesn't match");
    }

    if (!Array.isArray(board.nodes)) {
      throw new Error("Board nodes is not an array");
    }

    log(`Board loaded successfully with ${board.nodes.length} nodes`);
    logSuccess(test);
    return true;
  } catch (error) {
    logError(test, error);
    return false;
  }
}

async function testUpdateBoard(boardId: string): Promise<boolean> {
  const test = "Update Board";
  try {
    log(`Updating board ${boardId}...`);
    const payload: BoardPayload = {
      nodes: [
        {
          id: "node-1",
          type: "text",
          position: { x: 100, y: 100 },
          data: { label: "Test Node" },
        },
        {
          id: "node-2",
          type: "text",
          position: { x: 300, y: 200 },
          data: { label: "Updated Node" },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
        },
      ],
      elements: [],
    };

    const board = await api.put<Board>(`/boards/${boardId}`, payload);
    
    if (board.nodes.length !== 2) {
      throw new Error(`Expected 2 nodes, got ${board.nodes.length}`);
    }

    if (board.edges.length !== 1) {
      throw new Error(`Expected 1 edge, got ${board.edges.length}`);
    }

    log(`Board updated successfully`);
    logSuccess(test);
    return true;
  } catch (error) {
    logError(test, error);
    return false;
  }
}

async function testAICommand(boardId: string): Promise<boolean> {
  const test = "AI Command";
  try {
    log(`Testing AI command on board ${boardId}...`);
    
    // Create a small test screenshot (1x1 pixel base64 image)
    const testScreenshot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const payload: AIActionRequest = {
      boardId,
      command: "move node-1 to the right",
      screenshot: testScreenshot,
      nodes: [
        {
          id: "node-1",
          type: "text",
          position: { x: 100, y: 100 },
          data: { label: "Test Node" },
        },
      ],
    };

    const result = await api.post("/ai/plan", payload) as any;
    
    if (!result.actions || !Array.isArray(result.actions)) {
      throw new Error("AI response missing actions array");
    }

    log(`AI returned ${result.actions.length} actions`);
    logSuccess(test);
    return true;
  } catch (error) {
    logError(test, error);
    return false;
  }
}

async function testListBoards(): Promise<boolean> {
  const test = "List Boards";
  try {
    log("Listing all boards...");
    const response = await api.get<{ boards: Board[] }>("/boards");
    
    if (!Array.isArray(response.boards)) {
      throw new Error("Boards response is not an array");
    }

    log(`Found ${response.boards.length} boards`);
    logSuccess(test);
    return true;
  } catch (error) {
    logError(test, error);
    return false;
  }
}

async function runTests() {
  console.log("\n🧪 Starting Integration Tests\n");
  console.log(`API Base URL: ${TEST_CONFIG.apiBaseUrl}\n`);

  // Test 1: Create board
  const board = await testCreateBoard();
  if (!board) {
    console.log("\n❌ Cannot continue tests without a board");
    printResults();
    return;
  }

  // Test 2: Load board
  await testLoadBoard(board.id);

  // Test 3: Update board
  await testUpdateBoard(board.id);

  // Test 4: List boards
  await testListBoards();

  // Test 5: AI command (may fail if Gemini API not configured)
  await testAICommand(board.id);

  printResults();
}

function printResults() {
  console.log("\n" + "=".repeat(50));
  console.log("TEST RESULTS");
  console.log("=".repeat(50) + "\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.test}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=".repeat(50) + "\n");

  if (failed > 0) {
    console.log("⚠️  Some tests failed. Check the errors above.");
    process.exit(1);
  } else {
    console.log("🎉 All tests passed!");
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Test suite crashed:", error);
  process.exit(1);
});
