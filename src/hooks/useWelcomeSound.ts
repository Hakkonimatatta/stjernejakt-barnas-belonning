import { useCallback } from "react";
import { initializeAudioContext, playWelcomeSequence } from "@/lib/audioManager";

export const useWelcomeSound = () => {
  const playWelcomeSound = useCallback(() => {
    // Initialize AudioContext on first user interaction (required for iOS)
    initializeAudioContext();
    
    // Play the welcome sequence
    void playWelcomeSequence();
  }, []);

  return { playWelcomeSound };
};
