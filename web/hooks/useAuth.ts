"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  rehydrateSession,
  signOut,
  initTokenRefresh,
  type AuthUser,
} from "@/lib/auth";

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounts
    
    // Start token auto-refresh (keeps httpOnly cookie in sync with Firebase)
    const unsubRefresh = initTokenRefresh();

    async function initAuth() {
      try {
        // Fast path: return cached profile from localStorage immediately
        const cached = getStoredUser();
        if (cached && mounted) {
          setUser(cached);
          setLoading(false);
          return;
        }

        // Slow path: page was refreshed — restore from Firebase SDK / BFF
        const rehydrated = await rehydrateSession();
        if (mounted) {
          setUser(rehydrated);
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
      unsubRefresh();
    };
  }, []); // Empty dependency array - this should only run once

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push("/signin");
  };

  return { user, loading, logout };
}
