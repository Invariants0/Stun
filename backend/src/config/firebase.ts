/**
 * Firebase Admin SDK — single initialisation point.
 *
 * Call initFirebase() once at startup (index.ts).
 * All other modules import getFirestore() / getFirebaseAuth() from here.
 */
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore as getFirestoreSDK, type Firestore } from "firebase-admin/firestore";
import envVars from "./envVars";
import { logger } from "./logger";

export function initFirebase(): void {
  if (getApps().length > 0) return; // already initialised

  if (envVars.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(envVars.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount)});
      logger.info("[firebase] Initialized with service account key");
    } catch (error) {
      logger.error("[firebase] Failed to initialize with service account key", error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY. Error: ${message}`);
    }
  } else {
    // Cloud Run Workload Identity or local emulator — ADC
    initializeApp({ projectId: envVars.GCP_PROJECT_ID });
    logger.warn("[firebase] No FIREBASE_SERVICE_ACCOUNT_KEY — using Application Default Credentials");
  }
}

export function getFirestore(): Firestore {
  return getFirestoreSDK(getApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export const firestoreCollections = {
  boards:   envVars.BOARDS_COLLECTION,
  presence: "board_presence",
} as const;
