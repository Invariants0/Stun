/**
 * lib/auth.ts — Client-side auth helpers
 *
 * Token storage strategy (production-safe):
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  httpOnly cookie "authToken"  (set by /api/auth/set-token)         │
 *  │  • Immune to XSS — JS cannot read it                               │
 *  │  • Read by Next.js middleware for SSR route protection             │
 *  │  • Read by /api/auth/rehydrate to restore session after refresh    │
 *  ├─────────────────────────────────────────────────────────────────────┤
 *  │  Module-level memory variable _tokenMemory                         │
 *  │  • Used for client-side fetch() calls to the backend               │
 *  │  • Lost on page refresh (intentional — rehydrated via cookie)      │
 *  ├─────────────────────────────────────────────────────────────────────┤
 *  │  localStorage "authUser"  (user profile only, NOT the token)       │
 *  │  • Non-sensitive: displayName, email, photoURL                     │
 *  │  • Avoids an extra network round-trip for the profile on reload    │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 * The backend is on a different origin, so it cannot set httpOnly cookies on
 * the frontend domain.  The Next.js API route /api/auth/set-token is the BFF
 * (Backend-for-Frontend) shim that makes httpOnly cookies possible.
 */

import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

function inferDisplayName(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  const local = email.split("@")[0]?.trim();
  if (!local) return undefined;
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

// ─── In-memory token store ───────────────────────────────────────────────────
// Accessible to client-side API calls; NOT readable by XSS scripts (unlike
// localStorage / non-httpOnly cookies).  Lost on page refresh — the
// /api/auth/rehydrate route restores the session via the httpOnly cookie.

let _tokenMemory: string | null = null;
let _lastPostedToken: string | null = null;

export async function ensureAuthToken(): Promise<string | null> {
  if (_tokenMemory) return _tokenMemory;
  const current = auth.currentUser;
  if (!current) return null;
  try {
    const idToken = await current.getIdToken(false);
    _tokenMemory = idToken;
    return idToken;
  } catch {
    return null;
  }
}

export async function ensureAuthTokenWithRehydrate(): Promise<string | null> {
  const existing = await ensureAuthToken();
  if (existing) return existing;
  try {
    await rehydrateSession();
  } catch {
    // ignore
  }
  return getStoredToken();
}

// ─── Google OAuth URL ────────────────────────────────────────────────────────

export async function getGoogleAuthUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/url`);
  if (!res.ok) throw new Error("Failed to fetch auth URL");
  const data = await res.json();
  return data.authUrl as string;
}

// ─── Code → Token exchange ───────────────────────────────────────────────────

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? "Token exchange failed");
  }
  const data = await res.json();
  const customToken: string = data.customToken;
  const serverUser: AuthUser = data.user;

  // Step 2 — Firebase client SDK exchanges custom token for a Firebase ID token
  // The ID token is auto-refreshed by the SDK and verified by requireAuth.
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithCustomToken(auth, customToken);
  const firebaseIdToken = await credential.user.getIdToken();

  return {
    token: firebaseIdToken,
    user: {
      uid: credential.user.uid,
      email: credential.user.email ?? serverUser.email ?? "",
      displayName:
        credential.user.displayName ??
        serverUser.displayName ??
        inferDisplayName(credential.user.email ?? serverUser.email),
      photoURL: credential.user.photoURL ?? serverUser.photoURL,
    },
  };
}

export async function storeToken(token: string): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Keep in memory for client-side API calls this session
  _tokenMemory = token;

  // 2. Ask the Next.js BFF to set an httpOnly cookie (XSS-safe middleware auth)
  await fetch("/api/auth/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export function getStoredToken(): string | null {
  return _tokenMemory;
}

// ─── Rehydrate session after page refresh ────────────────────────────────────
// Returns the user profile if the httpOnly cookie is still valid; null if the
// session has expired (middleware will then redirect to /signin).

// ─── Auto-refresh: keep httpOnly cookie in sync with Firebase token rotation ─
// Call once on app mount via useAuth. Returns unsubscribe fn.

let _refreshInProgress = false; // Prevent recursive refresh loops
let _debounceTimer: NodeJS.Timeout | null = null;
let _refreshUnsubscriber: (() => void) | null = null; // Module-level: prevent duplicate listeners

export function initTokenRefresh(): () => void {
  // Only initialize once per app, not per component
  if (_refreshUnsubscriber) {
    return _refreshUnsubscriber;
  }

  const unsub = onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    // Prevent infinite loops
    if (_refreshInProgress) return;
    
    // Clear any existing debounce timer
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
      _debounceTimer = null;
    }
    
    // Debounce rapid token changes (Firebase can fire this multiple times quickly)
    _debounceTimer = setTimeout(async () => {
      if (_refreshInProgress) return;
      
      try {
        _refreshInProgress = true;
        
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken(false); // Don't force refresh
          _tokenMemory = idToken;
          if (_lastPostedToken !== idToken) {
            _lastPostedToken = idToken;
            await fetch("/api/auth/set-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: idToken }),
            }).catch((err) => {
              console.warn("Failed to set auth cookie:", err);
            });
          }
        }
      } finally {
        _refreshInProgress = false;
      }
    }, 500); // 500ms debounce
  });

  _refreshUnsubscriber = unsub;
  return unsub;
}

export async function rehydrateSession(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;
  
  // Prevent recursive calls during initialization
  if (_refreshInProgress) {
    // Return cached user if available
    return getStoredUser();
  }

  try {
    _refreshInProgress = true;
    
    // Firebase SDK persists auth in localStorage — restore from it first
    const firebaseUser = await new Promise<FirebaseUser | null>((resolve) => {
      const unsub = auth.onAuthStateChanged((u) => { unsub(); resolve(u); });
    });

    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(false); // Don't force refresh
      _tokenMemory = idToken;
      
      // Only post if token has changed (prevent duplicate posts)
      if (_lastPostedToken !== idToken) {
        _lastPostedToken = idToken;
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        }).catch((err) => {
          console.warn("Failed to set auth cookie:", err);
        });
      }
      
      const cached = getStoredUser();
      const email = firebaseUser.email ?? cached?.email ?? "";
      const displayName =
        firebaseUser.displayName ??
        cached?.displayName ??
        inferDisplayName(email);
      const photoURL = firebaseUser.photoURL ?? cached?.photoURL ?? undefined;
      const user: AuthUser = {
        uid: firebaseUser.uid,
        email,
        displayName,
        photoURL,
      };
      storeUser(user);
      return user;
    }

    // Fallback: BFF reads httpOnly cookie
    const res = await fetch("/api/auth/rehydrate");
    if (!res.ok) {
      clearStoredUser();
      return null;
    }
    const data = await res.json();
    const user = data.user as AuthUser;
    if (data.token && typeof data.token === "string") {
      _tokenMemory = data.token;
      _lastPostedToken = data.token; // Track what we've posted
    }
    storeUser(user);
    return user;
  } finally {
    _refreshInProgress = false;
  }
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth).catch(() => {});
  await fetch(`${API_BASE}/auth/signout`, { method: "POST" }).catch(() => {});
  _tokenMemory = null;
  await fetch("/api/auth/set-token", { method: "DELETE" }).catch(() => {});
  clearStoredUser();
}

// ─── User profile helpers (localStorage — NOT the token) ────────────────────

export function storeUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("authUser", JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authUser");
}
