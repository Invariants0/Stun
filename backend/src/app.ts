import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { envVars, logger } from "./config";
import { registerRoutes } from "./api/routes/index";
import { errorMiddleware } from "./api/middleware/error.middleware";

export function createApp() {
  const app = express();

  // ─── Global Middleware ─────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow loading resources from anywhere (e.g., OpenAI API). In production, consider enabling and configuring this properly.
    crossOriginEmbedderPolicy: false, // Disable COEP to allow embedding resources from other origins. In production, consider enabling and configuring this properly.
  }));

  // CORS configuration: Allow requests from the frontend (handles Cloud Run URL format variations)
  app.use(cors({
    origin: (origin, callback) => {
      // Allow no origin (mobile apps, Postman, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Allow if origin is the configured frontend URL
      if (origin === envVars.FRONTEND_URL) {
        callback(null, true);
        return;
      }

      // Allow other origins from the same Cloud Run project domain
      const isCloudRunOrigin = origin.includes('.run.app');
      if (isCloudRunOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS policy violation'));
    },
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  // ─── Routes ───────────────────────────────────────────────────────────────
  registerRoutes(app);

  // ─── Error Handler (must be last) ─────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
