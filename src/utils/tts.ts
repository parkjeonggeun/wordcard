export type TTSLang = 'ko-KR' | 'en-US';

// Eagerly trigger voice list load (iOS Safari loads voices lazily)
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices();
  }, { once: true });
}

function getBestVoice(lang: TTSLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Exact lang match, prefer non-compact (higher quality)
  const exactHQ = voices.find(
    (v) => v.lang === lang && !v.name.toLowerCase().includes('compact')
  );
  if (exactHQ) return exactHQ;

  // 2. Any exact lang match
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  // 3. Language prefix match (e.g. en-GB for en-US)
  const prefix = lang.split('-')[0];
  return voices.find((v) => v.lang.startsWith(prefix)) ?? null;
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
  // iOS Safari needs ~80 ms after cancel() before next speak()
  setTimeout(() => {
    window.speechSynthesis.speak(makeUtterance(text, lang));
  }, 80);
}

export function speakSequence(koText: string, enText: string, initialDelayMs = 600): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  setTimeout(() => {
    const ko = makeUtterance(koText, 'ko-KR');
    ko.onend = () => {
      setTimeout(() => {
        window.speechSynthesis.speak(makeUtterance(enText, 'en-US'));
      }, 400);
    };
    window.speechSynthesis.speak(ko);
  }, initialDelayMs);
}

export function cancelTTS(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
