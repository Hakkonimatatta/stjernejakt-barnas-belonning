// Audio Manager for iOS compatibility
// Using simple pleasant tones instead of harsh synthetic sounds

let audioContext: AudioContext | null = null;

const ensureAudioContext = async (): Promise<AudioContext | null> => {
  const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
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
  void ensureAudioContext();
};

// Create a pleasant piano-like tone
const createPianoNote = (ctx: AudioContext, frequency: number, startTime: number, duration: number, volume: number = 0.15) => {
  // Main oscillator (fundamental frequency)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  
  // Harmonic oscillators for richer sound
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();

  // Use sine waves for softer, rounder sound
  osc1.type = "sine";
  osc2.type = "sine";
  osc3.type = "sine";

  // Set frequencies - fundamental and harmonics
  osc1.frequency.setValueAtTime(frequency, startTime);
  osc2.frequency.setValueAtTime(frequency * 2, startTime); // Octave
  osc3.frequency.setValueAtTime(frequency * 3, startTime); // Fifth

  // Piano-like envelope: quick attack, slow decay
  const attackTime = 0.01;
  const decayTime = duration * 0.3;
  const sustainLevel = volume * 0.6;
  const releaseTime = duration * 0.4;

  // Main tone
  gain1.gain.setValueAtTime(0, startTime);
  gain1.gain.linearRampToValueAtTime(volume, startTime + attackTime);
  gain1.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // Harmonic (quieter)
  gain2.gain.setValueAtTime(0, startTime);
  gain2.gain.linearRampToValueAtTime(volume * 0.3, startTime + attackTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

  // Third harmonic (very quiet)
  gain3.gain.setValueAtTime(0, startTime);
  gain3.gain.linearRampToValueAtTime(volume * 0.1, startTime + attackTime);
  gain3.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc3.connect(gain3);
  gain3.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc3.start(startTime);
  
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
  osc3.stop(startTime + duration);
};


export const playTone = async (frequency: number, duration: number = 0.2, volume: number = 0.12) => {
  await withAudioContext((ctx) => {
    createPianoNote(ctx, frequency, ctx.currentTime, duration, volume);
  });
};

export const playWelcomeSequence = async () => {
  await withAudioContext((ctx) => {
    const now = ctx.currentTime;
    
    // Pleasant welcome melody: C5 - E5 - G5 (C major chord)
    createPianoNote(ctx, 523.25, now, 0.3, 0.12);      // C5
    createPianoNote(ctx, 659.25, now + 0.25, 0.3, 0.12); // E5
    createPianoNote(ctx, 783.99, now + 0.5, 0.5, 0.15);  // G5
  });
};

export const playSuccessSequence = async () => {
  await withAudioContext((ctx) => {
    const now = ctx.currentTime;
    
    // Success jingle: C5 - E5 - G5 - C6
    createPianoNote(ctx, 523.25, now, 0.15, 0.1);        // C5
    createPianoNote(ctx, 659.25, now + 0.13, 0.15, 0.1); // E5
    createPianoNote(ctx, 783.99, now + 0.26, 0.15, 0.12); // G5
    createPianoNote(ctx, 1046.50, now + 0.39, 0.4, 0.13); // C6
  });
};
