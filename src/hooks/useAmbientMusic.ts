'use client';

import { useEffect, useRef, useCallback } from 'react';

// Pentatonic scale notes (Hz) — C4 based, gentle and pleasant
const NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

// Simple melody pattern indices into NOTES
const MELODY = [0, 2, 4, 5, 4, 2, 0, 1, 2, 4, 7, 5, 4, 2, 3, 1];

export function useAmbientMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const melodyIdxRef = useRef(0);
  const isPlayingRef = useRef(false);

  const playNote = useCallback((freq: number, when: number, duration: number) => {
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.connect(env);
    env.connect(masterGain);

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Soft attack + decay envelope
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(0.4, when + 0.08);
    env.gain.exponentialRampToValueAtTime(0.001, when + duration);

    osc.start(when);
    osc.stop(when + duration + 0.05);
  }, []);

  const scheduleNext = useCallback(() => {
    if (!isPlayingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const noteIdx = MELODY[melodyIdxRef.current % MELODY.length];
    const freq = NOTES[noteIdx];
    const now = ctx.currentTime;

    // Alternate between melody note and a soft bass note an octave down
    playNote(freq, now, 1.2);
    if (melodyIdxRef.current % 4 === 0) {
      playNote(NOTES[0] / 2, now, 2.0); // bass drone
    }

    melodyIdxRef.current++;

    // Each note lasts ~1.5s with slight variation
    const nextDelay = 1400 + Math.random() * 300;
    timerRef.current = setTimeout(scheduleNext, nextDelay);
  }, [playNote]);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.18; // quiet background level
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      ctx.resume().then(() => {
        isPlayingRef.current = true;
        scheduleNext();
      });
    } catch {
      // Audio not available — fail silently
    }
  }, [scheduleNext]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      gainRef.current?.gain.setValueAtTime(gainRef.current.gain.value, ctxRef.current?.currentTime ?? 0);
      gainRef.current?.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.5);
      setTimeout(() => {
        ctxRef.current?.close().catch(() => {});
        ctxRef.current = null;
        gainRef.current = null;
      }, 600);
    } catch {
      ctxRef.current = null;
      gainRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return { start, stop };
}
