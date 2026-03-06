"use client";

import { useRouter } from "next/navigation";
import EnterPage from "@/components/EnterPage";

export default function HomePage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/boards");
  };

  return <EnterPage onEnter={handleEnter} />;
}
