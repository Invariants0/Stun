"use client";

import { useVoice } from "@/hooks/useVoice";
import { useState } from "react";

// simple SVGs for mic and recording
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
    <path d="M19 11v-2a7 7 0 0 0-14 0v2" />
    <path d="M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RecIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export default function VoiceOrb() {
  const { listening, toggleListening, transcript } = useVoice();
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const unsupported = !SpeechRecognition;
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={toggleListening}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "none",
        color: "#fff",
        background: listening ? "#dc2626" : "#2563eb",
        cursor: "pointer",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: listening
          ? "0 0 0 4px rgba(220,38,38,0.5)"
          : "0 0 0 2px rgba(37,99,235,0.5)",
        transition: "box-shadow 0.2s ease",
        animation: listening ? "pulse 1s infinite" : undefined,
      }}
      aria-label="Toggle voice"
    >
      {listening ? <RecIcon /> : <MicIcon />}
      {hover && transcript && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            right: 0,
            maxWidth: 200,
            padding: 8,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: "0.75rem",
            borderRadius: 4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            zIndex: 1001,
          }}
        >
          {transcript}
        </div>
      )}
      {unsupported && hover && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            right: 0,
            maxWidth: 200,
            padding: 8,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: "0.75rem",
            borderRadius: 4,
            whiteSpace: "normal",
            zIndex: 1001,
          }}
        >
          Speech API unsupported
        </div>
      )}
    </button>
  );
}
