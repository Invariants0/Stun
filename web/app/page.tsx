"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EnterPage from "@/components/EnterPage";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect automatically if already signed in (must be in useEffect, not during render)
  useEffect(() => {
    if (!loading && user) {
      router.replace("/boards");
    }
  }, [loading, user, router]);

  const handleEnter = () => {
    router.push("/boards");
  };

  return <EnterPage onEnter={handleEnter} />;
}
