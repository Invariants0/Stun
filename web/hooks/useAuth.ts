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
    // Start token auto-refresh (keeps httpOnly cookie in sync with Firebase)
    const unsubRefresh = initTokenRefresh();

    async function initAuth() {
      // Fast path: return cached profile from localStorage immediately
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
        return;
      }

      // Slow path: page was refreshed — restore from Firebase SDK / BFF
      const rehydrated = await rehydrateSession();
      setUser(rehydrated);
      setLoading(false);
    }

    initAuth();
    return () => unsubRefresh();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push("/signin");
  };

  return { user, loading, logout };
}
