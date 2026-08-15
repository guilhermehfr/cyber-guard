export type SoundName = "click" | "correct" | "wrong" | "complete";

const SOUND_PATHS: Record<SoundName, string> = {
  click: "/sounds/click.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  complete: "/sounds/complete.mp3",
};

class SoundPlayer {
  private muted = false;
  private elements: Partial<Record<SoundName, HTMLAudioElement>> = {};

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  play(name: SoundName): void {
    if (this.muted || typeof window === "undefined") {
      return;
    }

    let element = this.elements[name];
    if (!element) {
      element = new Audio(SOUND_PATHS[name]);
      element.preload = "auto";
      this.elements[name] = element;
    }

    element.currentTime = 0;
    void element.play().catch(() => {});
  }
}

export const soundPlayer = new SoundPlayer();
