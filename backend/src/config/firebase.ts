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

  // Always load service account credentials if available
  // (needed for token minting even in emulator mode)
  if (envVars.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      // Strip BOM from entire string (from Secret Manager)
      let cleanKey = envVars.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/^\uFEFF/, "");
      
      // Parse JSON
      const serviceAccount = JSON.parse(cleanKey);
      
      // Clean private_key field: ensure proper PEM formatting
      if (serviceAccount.private_key) {
        // Remove any BOM characters
        let pk = serviceAccount.private_key
          .replace(/^\uFEFF/, "") // BOM at start
          .replace(/\uFEFF$/g, "") // BOM at end
          .trim();
        
        // Normalize newlines (handle literal and actual CRLFs)
        pk = pk.replace(/\\r\\n/g, "\n");
        pk = pk.replace(/\\n/g, "\n");
        pk = pk.replace(/\\r/g, "\n");
        pk = pk.replace(/\r\n/g, "\n");
        pk = pk.replace(/\r/g, "\n");

        // Remove any accidental surrounding quotes
        if (pk.startsWith('"') && pk.endsWith('"')) {
          pk = pk.slice(1, -1);
        }

        // Normalize whitespace, ensure there is exactly one newline between lines
        pk = pk
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join("\n");

        // Ensure PEM header/footer are on their own lines
        pk = pk.replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n");
        pk = pk.replace(/\s*-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----");

        // If there is any trailing garbage after the footer, drop it.
        const begin = pk.indexOf('-----BEGIN PRIVATE KEY-----');
        const end = pk.indexOf('-----END PRIVATE KEY-----');
        if (begin !== -1 && end !== -1) {
          const footerEnd = end + '-----END PRIVATE KEY-----'.length;
          pk = pk.slice(begin, footerEnd).trim() + "\n";
        }
        
        serviceAccount.private_key = pk;
      }
      
      initializeApp({
        credential: cert(serviceAccount),
        projectId: envVars.GCP_PROJECT_ID,
      });
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

  // Log emulator status if enabled
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    logger.info("[firebase] Firestore Emulator: " + process.env.FIRESTORE_EMULATOR_HOST);
    logger.info("[firebase] View data at: http://localhost:4000/firestore");
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
