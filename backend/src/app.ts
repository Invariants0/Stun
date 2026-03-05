import cors from "cors";
import express from "express";

import { registerRoutes } from "./api/routes/index";
import { errorMiddleware } from "./api/middleware/error.middleware";

export function createApp() {
  const app = express();

  // ─── Global Middleware ─────────────────────────────────────────────────────
  app.use(cors({ origin: process.env.FRONTEND_URL ?? "*" }));
  app.use(express.json({ limit: "10mb" }));

  // ─── Routes ───────────────────────────────────────────────────────────────
  registerRoutes(app);

  // ─── Error Handler (must be last) ─────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
