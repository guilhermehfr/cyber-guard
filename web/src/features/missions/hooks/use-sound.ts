"use client";

import { useCallback, useState } from "react";

import { type SoundName, soundPlayer } from "../lib/sound";

export interface UseSoundResult {
  play: (name: SoundName) => void;
  muted: boolean;
  toggleMute: () => void;
}

export function useSound(): UseSoundResult {
  const [muted, setMuted] = useState(soundPlayer.isMuted());

  const play = useCallback((name: SoundName) => {
    soundPlayer.play(name);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      soundPlayer.setMuted(!current);
      return !current;
    });
  }, []);

  return { play, muted, toggleMute };
}
