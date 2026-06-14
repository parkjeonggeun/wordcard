'use client';

import { useCallback, useRef, useState } from 'react';
import { speakWithOnEnd, cancelTTS } from '@/utils/tts';
import { speakEnglish, stopEnglishAudio } from '@/utils/elevenlabs';

// Maximum time to wait for English TTS before unlocking buttons
const EN_TIMEOUT_MS = 10_000;

function speakEnglishWithTimeout(text: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, EN_TIMEOUT_MS);
    speakEnglish(text)
      .catch(() => speakWithOnEnd(text, 'en-US', resolve))
      .finally(() => { clearTimeout(timer); resolve(); });
  });
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelSeqRef = useRef<(() => void) | null>(null);

  const setSpeaking = useCallback((val: boolean) => {
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
      speakEnglishWithTimeout(text).finally(done);
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

    const koTimer = setTimeout(() => {
      if (cancelled) return;
      speakWithOnEnd(koText, 'ko-KR', () => {
        if (cancelled) return;
        enTimer = setTimeout(() => {
          if (cancelled) return;
          stopEnglishAudio();
          speakEnglishWithTimeout(enText).finally(done);
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
