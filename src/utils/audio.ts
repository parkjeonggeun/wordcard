let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function playSuccessSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (required after user gesture on iOS)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => null);
  }

  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.connect(gain);
    gain.connect(ctx!.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    const start = ctx!.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}
