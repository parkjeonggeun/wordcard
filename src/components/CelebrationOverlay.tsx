'use client';

import { useEffect, useRef, memo } from 'react';
import { playSuccessSound } from '@/utils/audio';

const MESSAGES = ['잘했어! 🎉', '최고! ⭐', '멋져! 🌟', '와! 👏'];

const CONFETTI_COLORS = [
  '#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff6b6b', '#c77dff', '#ff9f1c', '#2ec4b6',
];

const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: 'circle' | 'rect';
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.2,
    size: 8 + Math.floor(Math.random() * 10),
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));
}

interface CelebrationOverlayProps {
  message: string;
  onDone: () => void;
}

function CelebrationOverlay({ message, onDone }: CelebrationOverlayProps) {
  const hasRun = useRef(false);
  const particles = useRef<Particle[]>(generateParticles());

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    playSuccessSound();

    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
      onClick={onDone}
      role="dialog"
      aria-label="정답 축하"
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.current.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 confetti-particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.shape === 'circle' ? p.size : p.size * 0.6,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Message card */}
      <div className="relative bg-white rounded-4xl shadow-2xl px-10 py-8 flex flex-col items-center gap-3 max-w-xs mx-4 celebrate-card">
        <div className="text-7xl star-spin">⭐</div>
        <p className="text-4xl font-black text-center text-gray-800 leading-tight">
          {message}
        </p>
        <p className="text-base text-gray-400">탭하면 계속</p>
      </div>
    </div>
  );
}

export function getRandomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export default memo(CelebrationOverlay);
