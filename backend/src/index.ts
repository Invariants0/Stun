import cors from "cors";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { aiRouter } from "./routes/ai.route";
import { authRouter } from "./routes/auth.route";
import { boardRouter } from "./routes/board.route";
import { healthRouter } from "./routes/health.route";
import { presenceRouter } from "./routes/presence.route";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/boards", boardRouter);
app.use("/ai", aiRouter);
app.use("/presence", presenceRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.issues,
    });
    return;
  }

  if (err.message === "Board not found") {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message === "Unauthorized access to board") {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.message === "Only owner can change board visibility") {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.message === "Only owner can add collaborators") {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.message === "Only owner can remove collaborators") {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.message === "User is already a collaborator") {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message === "Owner is already a collaborator") {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes("Invalid nodeId reference")) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`Stun backend listening on :${port}`);
});
