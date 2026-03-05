import { initFirebase, envVars, logger } from "./config";
import { createApp } from "./app";
import { startPresenceCleanup } from "./services/presence.service";

// ─── Bootstrap Firebase Admin SDK (single init) ───────────────────────────────
initFirebase();

// ─── Start presence cleanup interval (every 5 min) ────────────────────────────
startPresenceCleanup();

// ─── Start Server ─────────────────────────────────────────────────────────────
const app  = createApp();

app.listen(envVars.PORT, () => {
  logger.info(`[stun] backend listening on :${envVars.PORT}`);
});
