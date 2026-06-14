'use client';

import { useEffect, useRef, useCallback } from 'react';

const NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
const MELODY = [0, 2, 4, 5, 4, 2, 0, 1, 2, 4, 7, 5, 4, 2, 3, 1];

export function useAmbientMusic() {
  // Monotonically increasing session counter — any closure that doesn't hold the current value is stale
  const sessionRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const melodyIdxRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNote = useCallback((session: number) => {
    if (sessionRef.current !== session) return;
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const noteIdx = MELODY[melodyIdxRef.current % MELODY.length];
    const freq = NOTES[noteIdx];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.4, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.start(now);
    osc.stop(now + 1.3);

    if (melodyIdxRef.current % 4 === 0) {
      const bass = ctx.createOscillator();
      const bassEnv = ctx.createGain();
      bass.connect(bassEnv);
      bassEnv.connect(masterGain);
      bass.type = 'sine';
      bass.frequency.value = NOTES[0] / 2;
      bassEnv.gain.setValueAtTime(0, now);
      bassEnv.gain.linearRampToValueAtTime(0.2, now + 0.1);
      bassEnv.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      bass.start(now);
      bass.stop(now + 2.1);
    }

    melodyIdxRef.current++;
    const delay = 1400 + Math.random() * 300;
    timerRef.current = setTimeout(() => scheduleNote(session), delay);
  }, []);

  const start = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Invalidate any prior session
    sessionRef.current += 1;
    const session = sessionRef.current;

    // Close any existing context
    clearTimer();
    const oldCtx = ctxRef.current;
    ctxRef.current = null;
    gainRef.current = null;
    if (oldCtx) oldCtx.close().catch(() => {});

    try {
      const ctx = new AudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(ctx.destination);

      ctxRef.current = ctx;
      gainRef.current = masterGain;

      ctx.resume().then(() => {
        // Only proceed if this session is still the active one
        if (sessionRef.current !== session) {
          ctx.close().catch(() => {});
          return;
        }
        scheduleNote(session);
      }).catch(() => {});
    } catch {
      // Audio not available — fail silently
    }
  }, [clearTimer, scheduleNote]);

  const stop = useCallback(() => {
    // Invalidate current session so any pending callbacks no-op
    sessionRef.current += 1;
    clearTimer();

    const ctx = ctxRef.current;
    const gain = gainRef.current;
    ctxRef.current = null;
    gainRef.current = null;

    if (ctx && gain) {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => ctx.close().catch(() => {}), 500);
      } catch {
        ctx.close().catch(() => {});
      }
    }
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      clearTimer();
      ctxRef.current?.close().catch(() => {});
    };
  }, [clearTimer]);

  return { start, stop };
}
