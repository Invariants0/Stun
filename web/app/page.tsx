"use client";

import { useRouter } from "next/navigation";
import EnterPage from "@/components/EnterPage";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleEnter = () => {
    // If already authenticated, go directly to boards
    if (user) {
      router.push("/boards");
    } else {
      // Otherwise go to signin
      router.push("/signin");
    }
  };

  return <EnterPage onEnter={handleEnter} />;
}
