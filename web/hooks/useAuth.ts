"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  rehydrateSession,
  signOut,
  initTokenRefresh,
  type AuthUser,
  getStoredToken,
} from "@/lib/auth";

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  tokenReady: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);
  const router = useRouter();

  // Ensure we only register one token refresh listener app-wide.
  // This avoids multiple /api/auth/set-token calls if multiple pages mount useAuth.
  const refreshInitRef = useRef(false);

  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounts
    let unsubRefresh = () => {};
    if (!refreshInitRef.current) {
      refreshInitRef.current = true;
      // Start token auto-refresh (keeps httpOnly cookie in sync with Firebase)
      unsubRefresh = initTokenRefresh();
    }

    async function initAuth() {
      try {
        // Fast path: seed UI from cached profile, but keep loading
        const cached = getStoredUser();
        if (cached && mounted) {
          setUser(cached);
        }
        const cachedToken = getStoredToken();
        if (cachedToken && mounted) {
          setTokenReady(true);
        }

        // Slow path: page was refreshed — restore from Firebase SDK / BFF
        const rehydrated = await rehydrateSession();
        if (mounted) {
          setUser(rehydrated);
          setTokenReady(Boolean(getStoredToken()));
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    initAuth();
    
    return () => {
      mounted = false;
      // Keep the refresh listener alive app-wide.
    };
  }, []); // Empty dependency array - this should only run once

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push("/signin");
  };

  return { user, loading, tokenReady, logout };
}
