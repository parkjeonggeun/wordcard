'use client';

import { useCallback } from 'react';
import { speak as ttsSpeak, speakSequence as ttsSeqSpeak, cancelTTS, type TTSLang } from '@/utils/tts';

export function useTTS() {
  const speak = useCallback((text: string, lang: TTSLang) => {
    ttsSpeak(text, lang);
  }, []);

  const speakSequence = useCallback((koText: string, enText: string, initialDelayMs?: number) => {
    ttsSeqSpeak(koText, enText, initialDelayMs);
  }, []);

  const cancel = useCallback(() => {
    cancelTTS();
  }, []);

  return { speak, speakSequence, cancel };
}
