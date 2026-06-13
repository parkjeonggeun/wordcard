'use client';

import { useEffect, useRef, memo } from 'react';
import { playSuccessSound } from '@/utils/audio';

const MESSAGES = ['잘했어! 🎉', '최고야! ⭐', '멋져! 🌟', '대단해! 👏', '와우! 🎊'];

const CONFETTI_COLORS = [
  '#FF6B9D', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF6B6B', '#C77DFF', '#FF9F1C', '#2EC4B6',
  '#FF8C42', '#A8DADC', '#E63946', '#F1FAEE',
];

const PARTICLE_COUNT = 48;

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: 'circle' | 'rect' | 'star';
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
    duration: 1.6 + Math.random() * 1.4,
    size: 7 + Math.floor(Math.random() * 11),
    shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
  }));
}

interface CelebrationOverlayProps {
  message: string;
  onDone: () => void;
}

function CelebrationOverlay({ message, onDone }: CelebrationOverlayProps) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const particles = useRef<Particle[]>(generateParticles());

  useEffect(() => {
    playSuccessSound();
    const timer = setTimeout(() => onDoneRef.current(), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => onDoneRef.current();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(255, 220, 80, 0.35)', backdropFilter: 'blur(10px)' }}
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') handleClose(); }}
      role="dialog"
      aria-label="정답 축하"
      aria-modal="true"
      tabIndex={0}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.current.map((p) => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: `${p.left}%`,
              width: p.shape === 'star' ? p.size * 1.2 : p.size,
              height: p.shape === 'circle' ? p.size : p.shape === 'rect' ? p.size * 0.55 : p.size * 1.2,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '3px' : '2px',
              clipPath: p.shape === 'star'
                ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                : 'none',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Message card */}
      <div
        className="relative px-10 py-10 flex flex-col items-center gap-4 max-w-xs mx-4 celebrate-card rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #FFFAE0, #FFE566)',
          boxShadow: '0 12px 0 #C8A010, 0 16px 48px rgba(200,160,16,0.40)',
        }}
      >
        <div className="text-8xl star-spin select-none" aria-hidden="true">⭐</div>
        <p
          className="font-black text-center leading-tight select-none"
          style={{ fontSize: 'clamp(30px, 8vw, 50px)', color: '#4A3000' }}
        >
          {message}
        </p>
        <p className="font-bold text-sm select-none" style={{ color: '#8A6000' }}>
          탭하면 계속 ✨
        </p>
      </div>
    </div>
  );
}

export function getRandomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export default memo(CelebrationOverlay);
