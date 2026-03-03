"use client";

import { useVoice } from "@/hooks/useVoice";

export default function VoiceOrb() {
  const { listening, toggleListening } = useVoice();

  return (
    <button
      type="button"
      onClick={toggleListening}
      style={{
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 999,
        border: "none",
        color: "#fff",
        background: listening ? "#dc2626" : "#2563eb",
        cursor: "pointer",
      }}
      aria-label="Toggle voice"
    >
      {listening ? "REC" : "MIC"}
    </button>
  );
}
