'use client';

import { useCallback, useRef, useState } from 'react';
import { speakWithOnEnd, cancelTTS } from '@/utils/tts';
import { speakEnglish, stopEnglishAudio } from '@/utils/elevenlabs';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelSeqRef = useRef<(() => void) | null>(null);
  const speakingRef = useRef(false);

  const setSpeaking = useCallback((val: boolean) => {
    speakingRef.current = val;
    setIsSpeaking(val);
  }, []);

  const speak = useCallback((text: string, lang: 'ko-KR' | 'en-US') => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;
    setSpeaking(true);

    const done = () => setSpeaking(false);

    if (lang === 'en-US') {
      stopEnglishAudio();
      cancelTTS();
      speakEnglish(text)
        .catch(() => new Promise<void>((res) => speakWithOnEnd(text, 'en-US', res)))
        .finally(done);
    } else {
      speakWithOnEnd(text, lang, done);
    }
  }, [setSpeaking]);

  const speakSequence = useCallback((koText: string, enText: string, initialDelayMs = 600) => {
    cancelSeqRef.current?.();
    setSpeaking(true);

    let cancelled = false;
    let enTimer: ReturnType<typeof setTimeout> | null = null;

    const done = () => { if (!cancelled) setSpeaking(false); };

    // Korean first with delay
    const koTimer = setTimeout(() => {
      if (cancelled) return;
      speakWithOnEnd(koText, 'ko-KR', () => {
        if (cancelled) return;
        // English after Korean ends
        enTimer = setTimeout(() => {
          if (cancelled) return;
          stopEnglishAudio();
          speakEnglish(enText)
            .catch(() => new Promise<void>((res) => speakWithOnEnd(enText, 'en-US', res)))
            .finally(done);
        }, 400);
      });
    }, initialDelayMs);

    cancelSeqRef.current = () => {
      cancelled = true;
      clearTimeout(koTimer);
      if (enTimer !== null) clearTimeout(enTimer);
      stopEnglishAudio();
      cancelTTS();
      setSpeaking(false);
    };
  }, [setSpeaking]);

  const cancel = useCallback(() => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;
    stopEnglishAudio();
    cancelTTS();
    setSpeaking(false);
  }, [setSpeaking]);

  return { speak, speakSequence, cancel, isSpeaking };
}
