import cors from "cors";
import express from "express";
import helmet from "helmet";
import { envVars } from "./config";
import { registerRoutes } from "./api/routes/index";
import { errorMiddleware } from "./api/middleware/error.middleware";

export function createApp() {
  const app = express();

  // ─── Global Middleware ─────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow loading resources from anywhere (e.g., OpenAI API). In production, consider enabling and configuring this properly.
    crossOriginEmbedderPolicy: false, // Disable COEP to allow embedding resources from other origins. In production, consider enabling and configuring this properly.
  }));
  app.use(cors({ origin: envVars.FRONTEND_URL }));
  app.use(express.json({ limit: "10mb" }));

  // ─── Routes ───────────────────────────────────────────────────────────────
  registerRoutes(app);

  // ─── Error Handler (must be last) ─────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
