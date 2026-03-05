/**
 * Firebase Admin SDK — single initialisation point.
 *
 * Call initFirebase() once at startup (index.ts).
 * All other modules import getFirestore() / getFirebaseAuth() from here.
 */
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore as getFirestoreSDK, type Firestore } from "firebase-admin/firestore";
import { env } from "./env";

export function initFirebase(): void {
  if (getApps().length > 0) return; // already initialised

  if (env.firebaseServiceAccount) {
    initializeApp({ credential: cert(JSON.parse(env.firebaseServiceAccount)) });
  } else {
    // Cloud Run Workload Identity or local emulator — ADC
    initializeApp({ projectId: env.gcpProjectId });
    console.warn("[firebase] No FIREBASE_SERVICE_ACCOUNT_KEY — using Application Default Credentials");
  }
}

export function getFirestore(): Firestore {
  return getFirestoreSDK(getApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export const firestoreCollections = {
  boards:   env.boardsCollection,
  presence: "board_presence",
} as const;
