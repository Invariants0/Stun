"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// tiny wrapper around Web Speech API; falls back to toggle only

type VoiceState = {
  listening: boolean;
  transcript: string;
  toggleListening: () => void;
};

export function useVoice(): VoiceState {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript((prev) => prev + final);
      // console.log("interim", interim, "final", final);
    };

    recognizer.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setListening(false);
    };

    if (listening) {
      try {
        recognizer.start();
      } catch (e) {
        // ignore if already started
      }
    } else {
      recognizer.stop();
    }

    return () => {
      recognizer.stop();
    };
  }, [listening]);

  const toggleListening = useCallback(() => {
    setListening((v) => !v);
  }, []);

  return useMemo(
    () => ({
      listening,
      transcript,
      toggleListening,
    }),
    [listening, transcript, toggleListening],
  );
}
