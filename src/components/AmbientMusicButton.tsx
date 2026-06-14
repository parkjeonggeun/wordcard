'use client';

import { useState, useCallback } from 'react';
import { useAmbientMusic } from '@/hooks/useAmbientMusic';

export default function AmbientMusicButton() {
  const [on, setOn] = useState(false);
  const { start, stop } = useAmbientMusic();

  const toggle = useCallback(() => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  }, [on, start, stop]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? '음악 끄기' : '음악 켜기'}
      className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-150 active:scale-90 touch-manipulation select-none"
      style={{
        background: on ? 'rgba(255,180,100,0.25)' : 'rgba(255,255,255,0.60)',
        boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {on ? '🔔' : '🔕'}
    </button>
  );
}
