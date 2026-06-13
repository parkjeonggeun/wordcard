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

function getBestVoice(lang: TTSLang): SpeechSynthesisVoice | null {
  if (voiceCache.has(lang)) return voiceCache.get(lang)!;

  const voices = window.speechSynthesis.getVoices();
  const result =
    voices.find((v) => v.lang === lang && !v.name.toLowerCase().includes('compact')) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ??
    null;

  voiceCache.set(lang, result);
  return result;
}

function makeUtterance(text: string, lang: TTSLang): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  u.pitch = 1.05;
  const voice = getBestVoice(lang);
  if (voice) u.voice = voice;
  return u;
}

export function speak(text: string, lang: TTSLang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Try synchronously first (respects iOS gesture context).
  // If it fails silently, the 80ms fallback catches it.
  const u = makeUtterance(text, lang);
  try {
    window.speechSynthesis.speak(u);
  } catch {
    setTimeout(() => window.speechSynthesis.speak(makeUtterance(text, lang)), 80);
  }
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
