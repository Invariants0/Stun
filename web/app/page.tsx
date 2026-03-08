"use client";

import { useRouter } from "next/navigation";
import EnterPage from "@/components/EnterPage";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // redirect automatically if already signed in
  if (!loading && user) {
    router.replace("/boards");
  }

  const handleEnter = () => {
    router.push("/boards");
  };

  return <EnterPage onEnter={handleEnter} />;
}
