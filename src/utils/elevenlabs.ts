// In-memory cache: word → blob URL (valid for the session lifetime)
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

export async function speakEnglish(text: string): Promise<void> {
  stopCurrent();

  const cacheKey = text.toLowerCase().trim();
  let blobUrl = audioCache.get(cacheKey);

  if (!blobUrl) {
    const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error(`TTS fetch failed: ${res.status}`);
    const blob = await res.blob();
    blobUrl = URL.createObjectURL(blob);
    audioCache.set(cacheKey, blobUrl);
  }

  return new Promise((resolve) => {
    const audio = new Audio(blobUrl);
    currentAudio = audio;
    audio.volume = 1.0;
    audio.onended  = () => { currentAudio = null; resolve(); };
    audio.onerror  = () => { currentAudio = null; resolve(); }; // fail silently
    audio.play().catch(() => resolve());
  });
}

export function stopEnglishAudio() {
  stopCurrent();
}

// Preload all English words at once (call after first user interaction)
export async function preloadEnglishAudio(words: string[]): Promise<void> {
  await Promise.allSettled(
    words.map(async (word) => {
      const key = word.toLowerCase().trim();
      if (audioCache.has(key)) return;
      try {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(word)}`);
        if (!res.ok) return;
        const blob = await res.blob();
        audioCache.set(key, URL.createObjectURL(blob));
      } catch {
        // ignore preload failures
      }
    })
  );
}
