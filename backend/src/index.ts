import cors from "cors";
import express from "express";

import { aiRouter } from "./routes/ai.route";
import { authRouter } from "./routes/auth.route";
import { boardRouter } from "./routes/board.route";
import { healthRouter } from "./routes/health.route";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/boards", boardRouter);
app.use("/ai", aiRouter);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`Stun backend listening on :${port}`);
});
