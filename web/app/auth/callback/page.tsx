"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForToken, storeUser, storeToken } from "@/lib/auth";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-invocation — OAuth codes are single-use.
    if (handledRef.current) return;
    handledRef.current = true;

    const handle = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error || !code) {
        router.replace("/signin");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const { token, user } = await exchangeCodeForToken(code, redirectUri);

        await storeToken(token);
        storeUser(user);
        router.replace("/");
      } catch (err) {
        console.error("[auth] callback error:", err);
        router.replace("/signin");
      }
    };

    handle();
  }, [searchParams, router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.text}>⏳ Signing you in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={styles.container} />}>
      <CallbackInner />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0fe 0%, #f3f4f6 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  text: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
  },
};
