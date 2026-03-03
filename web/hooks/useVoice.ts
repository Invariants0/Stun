"use client";

import { useCallback, useMemo, useState } from "react";

type VoiceState = {
  listening: boolean;
  toggleListening: () => void;
};

export function useVoice(): VoiceState {
  const [listening, setListening] = useState(false);

  const toggleListening = useCallback(() => {
    setListening((value) => !value);
  }, []);

  return useMemo(
    () => ({
      listening,
      toggleListening,
    }),
    [listening, toggleListening],
  );
}
