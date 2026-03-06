import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";
import { logger } from "./logger";

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ─── Schema ───────────────────────────────────────────────────────────────────

const EnvConfigSchema = z.object({
  // Server
  PORT: z.coerce
    .number({ error: "PORT must be a valid number" })
    .int()
    .positive()
    .default(8080),
  NODE_ENV: z
    .enum(["development", "production", "test"] as const, {
      error: "NODE_ENV must be one of: development, production, test",
    })
    .default("development"),
  FRONTEND_URL: z
    .string()
    .url({ message: "FRONTEND_URL must be a valid URL" })
    .default("http://localhost:3000"),

  // GCP / Firebase
  GCP_PROJECT_ID: z.string().min(1, { message: "GCP_PROJECT_ID is required" }),
  GCP_REGION: z.string().default("us-central1"),
  // Optional in test mode (emulator doesn't need it)
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  BOARDS_COLLECTION: z.string().default("boards"),

  // Google OAuth - Optional in test mode
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // GenAI
  GEMINI_API_KEY: z.string().min(1, { message: "GEMINI_API_KEY is required" }),
  VERTEX_MODEL: z.string().default("gemini-2.0-flash-exp"),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

// ─── Raw process.env capture ─────────────────────────────────────────────────

const rawConfig = {
  PORT:                        process.env.PORT,
  NODE_ENV:                    process.env.NODE_ENV,
  FRONTEND_URL:                process.env.FRONTEND_URL,
  GCP_PROJECT_ID:              process.env.GCP_PROJECT_ID,
  GCP_REGION:                  process.env.GCP_REGION,
  FIREBASE_SERVICE_ACCOUNT_KEY:process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  BOARDS_COLLECTION:           process.env.BOARDS_COLLECTION,
  GOOGLE_CLIENT_ID:            process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET:        process.env.GOOGLE_CLIENT_SECRET,
  GEMINI_API_KEY:              process.env.GEMINI_API_KEY,
  VERTEX_MODEL:                process.env.VERTEX_MODEL,
};

// ─── Parse & validate ─────────────────────────────────────────────────────────

let envVars: EnvConfig;

try {
  envVars = EnvConfigSchema.parse(rawConfig);
  logger.info("[config] Environment configuration loaded.");
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error("[config] Environment configuration validation failed:");
    error.issues.forEach((issue) => {
      logger.error(`  • ${issue.path.join(".")}: ${issue.message}`);
    });
  } else {
    logger.error("[config] Unknown error during environment config validation:", { error });
  }
  throw new Error(
    "[config] Environment configuration validation failed. Check your .env file.",
  );
}

// ─── Uppercase named exports (skill pattern) ──────────────────────────────────

export const {
  PORT,
  NODE_ENV,
  FRONTEND_URL,
  GCP_PROJECT_ID,
  GCP_REGION,
  FIREBASE_SERVICE_ACCOUNT_KEY,
  BOARDS_COLLECTION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GEMINI_API_KEY,
  VERTEX_MODEL,
} = envVars;

export default envVars;
