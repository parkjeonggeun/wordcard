'use client';

import { useCallback, useRef } from 'react';
import { speak as webSpeak, speakKoreanOnly, cancelTTS } from '@/utils/tts';
import { speakEnglish, stopEnglishAudio } from '@/utils/elevenlabs';

export function useTTS() {
  const cancelSeqRef = useRef<(() => void) | null>(null);

  const speak = useCallback((text: string, lang: 'ko-KR' | 'en-US') => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;

    if (lang === 'en-US') {
      stopEnglishAudio();
      cancelTTS();
      // ElevenLabs — silently falls back to Web Speech API on error
      speakEnglish(text).catch(() => webSpeak(text, 'en-US'));
    } else {
      webSpeak(text, lang);
    }
  }, []);

  const speakSequence = useCallback((koText: string, enText: string, initialDelayMs = 600) => {
    cancelSeqRef.current?.();

    let cancelled = false;
    let enTimer: ReturnType<typeof setTimeout> | null = null;

    // Step 1: Korean via Web Speech API
    const cancelKo = speakKoreanOnly(koText, initialDelayMs);

    // Step 2: English via ElevenLabs after Korean finishes
    // Estimate Korean duration: initialDelay + ~220ms per character
    const koEstimatedMs = initialDelayMs + Math.max(900, koText.length * 220);
    enTimer = setTimeout(() => {
      if (cancelled) return;
      stopEnglishAudio();
      speakEnglish(enText).catch(() => webSpeak(enText, 'en-US'));
    }, koEstimatedMs);

    cancelSeqRef.current = () => {
      cancelled = true;
      cancelKo();
      if (enTimer !== null) clearTimeout(enTimer);
      stopEnglishAudio();
      cancelTTS();
    };
  }, []);

  const cancel = useCallback(() => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;
    stopEnglishAudio();
    cancelTTS();
  }, []);

  return { speak, speakSequence, cancel };
}
