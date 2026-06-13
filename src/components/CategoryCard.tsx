'use client';

import Link from 'next/link';
import { memo } from 'react';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/${category.id}`} className="block" aria-label={`${category.nameKo} 카드 시작`}>
      <div
        className={`
          ${category.bgColor} ${category.borderColor}
          border-4 rounded-3xl shadow-lg
          flex flex-col items-center justify-center gap-3
          p-6 aspect-square
          active:scale-90 transition-transform duration-75
          cursor-pointer select-none touch-manipulation
        `}
      >
        <span
          style={{ fontSize: 'clamp(52px, 12vw, 100px)', lineHeight: 1 }}
          role="img"
          aria-label={category.nameKo}
        >
          {category.emoji}
        </span>
        <div className="text-center">
          <p className={`font-black ${category.textColor}`} style={{ fontSize: 'clamp(20px, 4.5vw, 36px)' }}>
            {category.nameKo}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">{category.cards.length}개</p>
        </div>
      </div>
    </Link>
  );
}

export default memo(CategoryCard);
