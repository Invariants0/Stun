import { beforeAll, afterAll } from "bun:test";
import type { Express } from "express";
import type { Server } from "http";
import { createApp } from "../src/app";
import { initFirebase } from "../src/config/firebase";
import { logger } from "../src/config/logger";

let server: Server | null = null;
let app: Express | null = null;

export function getApp(): Express {
  if (!app) {
    throw new Error("App not initialized. Call setupTestEnvironment first.");
  }
  return app;
}

export function getServer(): Server {
  if (!server) {
    throw new Error("Server not initialized. Call setupTestEnvironment first.");
  }
  return server;
}

beforeAll(async () => {
  // Ensure we're in test mode
  process.env.NODE_ENV = "test";
  
  // Load test environment variables
  const { config } = await import("dotenv");
  config({ path: ".env.test" });

  // Initialize Firebase with emulator
  initFirebase();
  
  // Create Express app
  app = createApp();
  
  // Start server
  const PORT = process.env.PORT || 9090;
  await new Promise<void>((resolve) => {
    server = app!.listen(PORT, () => {
      logger.info(`[test] Server started on port ${PORT}`);
      resolve();
    });
  });
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((err) => {
        if (err) reject(err);
        else {
          logger.info("[test] Server closed");
          resolve();
        }
      });
    });
  }
});
