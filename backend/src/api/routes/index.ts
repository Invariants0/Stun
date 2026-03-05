import type { Express } from "express";
import { aiRouter } from "./ai.routes";
import { authRouter } from "./auth.routes";
import { boardRouter } from "./board.routes";
import { healthRouter } from "./health.routes";
import { presenceRouter } from "./presence.routes";

export function registerRoutes(app: Express): void {
  app.use("/health",   healthRouter);
  app.use("/auth",     authRouter);
  app.use("/boards",   boardRouter);
  app.use("/ai",       aiRouter);
  app.use("/presence", presenceRouter);
}
