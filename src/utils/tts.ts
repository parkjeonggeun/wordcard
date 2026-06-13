export type TTSLang = 'ko-KR' | 'en-US';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, lang: TTSLang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  currentUtterance = null;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  currentUtterance = utterance;

  // iOS Safari requires a short delay after cancel()
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

export function speakSequence(koText: string, enText: string, initialDelayMs = 600): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const ko = new SpeechSynthesisUtterance(koText);
  ko.lang = 'ko-KR';
  ko.rate = 0.85;
  ko.pitch = 1.1;

  const en = new SpeechSynthesisUtterance(enText);
  en.lang = 'en-US';
  en.rate = 0.85;
  en.pitch = 1.1;

  ko.onend = () => setTimeout(() => window.speechSynthesis.speak(en), 300);

  setTimeout(() => {
    window.speechSynthesis.speak(ko);
  }, initialDelayMs);
}

export function cancelTTS(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
