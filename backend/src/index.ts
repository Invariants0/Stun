import { initializeApp, cert, getApps } from "firebase-admin/app";
import { createApp } from "./app";

// ─── Bootstrap Firebase Admin SDK (single init) ───────────────────────────────
if (getApps().length === 0) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    initializeApp({ credential: cert(JSON.parse(key)) });
  } else {
    // Cloud Run Workload Identity / local emulator – ADC handles auth
    initializeApp({ projectId: process.env.GCP_PROJECT_ID });
    console.warn("[firebase] No FIREBASE_SERVICE_ACCOUNT_KEY – using Application Default Credentials");
  }
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const app  = createApp();
const port = Number(process.env.PORT ?? 8080);

app.listen(port, () => {
  console.log(`[stun] backend listening on :${port}`);
});
