export type TTSLang = 'ko-KR' | 'en-US';

// Voice cache — invalidated on voiceschanged
const voiceCache = new Map<TTSLang, SpeechSynthesisVoice | null>();

let voicesPreloaded = false;

export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || voicesPreloaded) return;
  voicesPreloaded = true;

  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voiceCache.clear();
    window.speechSynthesis.getVoices();
  }, { once: true });
}

// iOS/macOS에서 품질 좋고 밝은 영어 음성 우선순위
const PREFERRED_EN_VOICES = [
  'Samantha',   // iOS 기본 여성 영어 음성 — 가장 자연스럽고 밝음
  'Karen',      // iOS 호주 영어
  'Moira',      // iOS 아일랜드 영어
  'Tessa',      // iOS 남아공 영어
  'Fiona',      // iOS 스코틀랜드 영어
  'Victoria',   // macOS
  'Allison',    // macOS
  'Ava',        // macOS
];

function getBestVoice(lang: TTSLang): SpeechSynthesisVoice | null {
  if (voiceCache.has(lang)) return voiceCache.get(lang)!;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  let result: SpeechSynthesisVoice | undefined;

  if (lang === 'en-US') {
    // 1. 선호 음성 목록에서 compact가 아닌 것 우선
    for (const name of PREFERRED_EN_VOICES) {
      result = voices.find(
        (v) => v.name.includes(name) && !v.name.toLowerCase().includes('compact')
      );
      if (result) break;
    }
    // 2. 선호 목록 중 compact 포함 fallback
    if (!result) {
      for (const name of PREFERRED_EN_VOICES) {
        result = voices.find((v) => v.name.includes(name));
        if (result) break;
      }
    }
  }

  // 공통 fallback: 언어 코드 매칭
  result ??=
    voices.find((v) => v.lang === lang && !v.name.toLowerCase().includes('compact')) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ??
    undefined;

  voiceCache.set(lang, result ?? null);
  return result ?? null;
}

// 언어별 발화 파라미터
const VOICE_PARAMS: Record<TTSLang, { rate: number; pitch: number; volume: number }> = {
  'ko-KR': { rate: 0.85, pitch: 1.1,  volume: 1.0 },
  // 영어: pitch를 높여 밝고 명랑한 소리로, rate 살짝 올려 또렷하게
  'en-US': { rate: 0.9,  pitch: 1.35, volume: 1.0 },
};

function makeUtterance(text: string, lang: TTSLang): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  const { rate, pitch, volume } = VOICE_PARAMS[lang];
  u.lang   = lang;
  u.rate   = rate;
  u.pitch  = pitch;
  u.volume = volume;
  const voice = getBestVoice(lang);
  if (voice) u.voice = voice;
  return u;
}

export function speak(text: string, lang: TTSLang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = makeUtterance(text, lang);
  try {
    window.speechSynthesis.speak(u);
  } catch {
    setTimeout(() => window.speechSynthesis.speak(makeUtterance(text, lang)), 80);
  }
}

// Korean only — used by useTTS when English is handled separately (ElevenLabs)
export function speakKoreanOnly(koText: string, initialDelayMs = 600): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {};

  window.speechSynthesis.cancel();
  let cancelled = false;

  const timer = setTimeout(() => {
    if (cancelled) return;
    window.speechSynthesis.speak(makeUtterance(koText, 'ko-KR'));
  }, initialDelayMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
    window.speechSynthesis.cancel();
  };
}

// Returns a cancel function that stops both timers and the utterance.
export function speakSequence(
  koText: string,
  enText: string,
  initialDelayMs = 600
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {};

  window.speechSynthesis.cancel();

  let cancelled = false;
  let innerTimer: ReturnType<typeof setTimeout> | null = null;

  const outerTimer = setTimeout(() => {
    if (cancelled) return;
    const ko = makeUtterance(koText, 'ko-KR');
    ko.onend = () => {
      if (cancelled) return;
      innerTimer = setTimeout(() => {
        if (!cancelled) window.speechSynthesis.speak(makeUtterance(enText, 'en-US'));
      }, 400);
    };
    window.speechSynthesis.speak(ko);
  }, initialDelayMs);

  return () => {
    cancelled = true;
    clearTimeout(outerTimer);
    if (innerTimer !== null) clearTimeout(innerTimer);
    window.speechSynthesis.cancel();
  };
}

export function cancelTTS(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speakWithOnEnd(text: string, lang: TTSLang, onEnd: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const u = makeUtterance(text, lang);
  u.onend = onEnd;
  u.onerror = onEnd;
  try {
    window.speechSynthesis.speak(u);
  } catch {
    setTimeout(() => {
      const u2 = makeUtterance(text, lang);
      u2.onend = onEnd;
      u2.onerror = onEnd;
      window.speechSynthesis.speak(u2);
    }, 80);
  }
}
