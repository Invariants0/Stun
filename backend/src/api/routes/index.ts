import type { Express } from "express";
import { aiRouter } from "./ai.routes";
import { authRouter } from "./auth.routes";
import { boardRouter } from "./board.routes";
import { healthRouter } from "./health.routes";
import { layoutRouter } from "./layout.routes";
import { mediaRouter } from "./media.routes";
import { presenceRouter } from "./presence.routes";
import { searchRouter } from "./search.routes";

export function registerRoutes(app: Express): void {
  app.use("/health",   healthRouter);
  app.use("/auth",     authRouter);
  app.use("/boards",   boardRouter);
  app.use("/ai",       aiRouter);
  app.use("/layout",   layoutRouter);
  app.use("/media",    mediaRouter);
  app.use("/presence", presenceRouter);
  app.use("/search",   searchRouter);
}
