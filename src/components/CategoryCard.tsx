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
  const delay = `${index * 0.08}s`;

  return (
    <Link href={`/${category.id}`} className="block" aria-label={`${category.nameKo} 카드 시작`}>
      <div
        className="card-entrance flex flex-col items-center justify-center gap-4 py-8 px-3 rounded-[28px] aspect-[3/4] transition-transform duration-75 active:scale-95 select-none touch-manipulation cursor-pointer"
        style={{
          background: theme.cardBg,
          boxShadow: `0 8px 0 ${theme.shadow}, 0 12px 28px rgba(0,0,0,0.10)`,
          animationDelay: delay,
          opacity: 0,
        }}
      >
        {/* Emoji in white circle */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 'clamp(72px, 18vw, 110px)',
            height: 'clamp(72px, 18vw, 110px)',
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(40px, 10vw, 66px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
            role="img"
            aria-label={category.nameKo}
          >
            {category.emoji}
          </span>
        </div>

        {/* Labels */}
        <div className="text-center">
          <p
            className="font-black leading-none"
            style={{ fontSize: 'clamp(18px, 5vw, 34px)', color: theme.dark }}
          >
            {category.nameKo}
          </p>
          <p
            className="font-bold mt-1"
            style={{ fontSize: 'clamp(12px, 2.5vw, 16px)', color: theme.accent }}
          >
            {category.cards.length}개
          </p>
        </div>
      </div>
    </Link>
  );
}

export default memo(CategoryCard);
