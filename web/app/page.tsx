"use client";

import { useRouter } from "next/navigation";
import EnterPage from "@/components/EnterPage";

export default function HomePage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/board/demo-board");
  };

  return <EnterPage onEnter={handleEnter} />;
}
