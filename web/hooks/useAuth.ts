"use client";

import { useEffect, useState } from "react";
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

// Module-level flag to ensure token refresh is only initialized once per app
let tokenRefreshInitialized = false;

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounts

    // Initialize token refresh listener once at app startup (not per component)
    if (!tokenRefreshInitialized) {
      tokenRefreshInitialized = true;
      initTokenRefresh();
    }

    async function initAuth() {
      try {
        // Fast path: seed UI from cached profile
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
    };
  }, []); // Empty dependency array - this should only run once

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push("/signin");
  };

  return { user, loading, tokenReady, logout };
}
