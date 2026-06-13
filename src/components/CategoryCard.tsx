'use client';

import Link from 'next/link';
import { memo } from 'react';
import type { Category } from '@/types';
import { getTheme } from '@/data/themes';

interface CategoryCardProps {
  category: Category;
  index?: number;
}

function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const theme = getTheme(category.id);
  const delay = `${index * 0.06}s`;

  return (
    <Link href={`/${category.id}`} className="block h-full" aria-label={`${category.nameKo} 카드 시작`}>
      <div
        className="card-entrance h-full flex flex-col items-center justify-center gap-2 px-2 rounded-[22px] transition-transform duration-75 active:scale-95 select-none touch-manipulation cursor-pointer"
        style={{
          background: theme.cardBg,
          boxShadow: `0 6px 0 ${theme.shadow}, 0 10px 20px rgba(0,0,0,0.10)`,
          animationDelay: delay,
          opacity: 0,
        }}
      >
        {/* Emoji in white circle */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 'clamp(52px, 12vw, 84px)',
            height: 'clamp(52px, 12vw, 84px)',
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(28px, 7vw, 50px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))',
            }}
            role="img"
            aria-label={category.nameKo}
          >
            {category.emoji}
          </span>
        </div>

        {/* Labels */}
        <div className="text-center px-1">
          <p
            className="font-black leading-tight"
            style={{ fontSize: 'clamp(12px, 3.2vw, 22px)', color: theme.dark }}
          >
            {category.nameKo}
          </p>
          <p
            className="font-bold mt-0.5"
            style={{ fontSize: 'clamp(10px, 2vw, 13px)', color: theme.accent }}
          >
            {category.cards.length}개
          </p>
        </div>
      </div>
    </Link>
  );
}

export default memo(CategoryCard);
