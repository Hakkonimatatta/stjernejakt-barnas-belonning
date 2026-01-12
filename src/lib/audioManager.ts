// Audio Manager for iOS compatibility
// iOS Safari requires user interaction before AudioContext can be used and often starts suspended.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;

let audioContext: AudioContext | null = null;

const ensureAudioContext = async (): Promise<AudioContext | null> => {
  if (!AudioCtx) return null;

  if (!audioContext) {
    try {
      audioContext = new AudioCtx();
    } catch (e) {
      console.warn("AudioContext initialization failed:", e);
      return null;
    }
  }

  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
      // Add small delay after resuming to ensure ready state
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      console.warn("Failed to resume AudioContext:", e);
      return null;
    }
  }

  return audioContext;
};

const withAudioContext = async (fn: (ctx: AudioContext) => void) => {
  const ctx = await ensureAudioContext();
  if (!ctx) return;
  fn(ctx);
};

export const initializeAudioContext = () => {
  // Fire and forget; we still await resume when playing
  void ensureAudioContext();
};

export const playTone = async (frequency: number, duration: number = 0.2, volume: number = 0.3) => {
  await withAudioContext((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);

    // Smoother attack/release to avoid clicks
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.linearRampToValueAtTime(volume * 0.95, now + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  });
};

export const playWelcomeSequence = async () => {
  await withAudioContext((ctx) => {
    const now = ctx.currentTime;
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      // Smoother envelope
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
      gain.gain.linearRampToValueAtTime(0.19, now + start + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    // Welcome melody: C5 - E5 - G5
    playNote(523.25, 0, 0.2);      // C5
    playNote(659.25, 0.2, 0.2);    // E5
    playNote(783.99, 0.4, 0.4);    // G5
  });
};

export const playSuccessSequence = async () => {
  await withAudioContext((ctx) => {
    const now = ctx.currentTime;
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      // Smoother envelope
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
      gain.gain.linearRampToValueAtTime(0.19, now + start + duration - 0.03);
      gain.gain.linearRampToValueAtTime(0, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    // Success: C5 - C5 - G5
    playNote(523.25, 0, 0.15);      // C5
    playNote(523.25, 0.15, 0.15);   // C5
    playNote(783.99, 0.3, 0.3);     // G5
  });
};
