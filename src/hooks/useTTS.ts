'use client';

import { useCallback, useRef } from 'react';
import {
  speak as ttsSpeak,
  speakSequence as ttsSeqSpeak,
  cancelTTS,
  type TTSLang,
} from '@/utils/tts';

export function useTTS() {
  // Holds the cancel function returned by speakSequence
  const cancelSeqRef = useRef<(() => void) | null>(null);

  const speak = useCallback((text: string, lang: TTSLang) => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;
    ttsSpeak(text, lang);
  }, []);

  const speakSequence = useCallback((koText: string, enText: string, initialDelayMs?: number) => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = ttsSeqSpeak(koText, enText, initialDelayMs);
  }, []);

  const cancel = useCallback(() => {
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;
    cancelTTS();
  }, []);

  return { speak, speakSequence, cancel };
}
