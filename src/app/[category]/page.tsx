'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { getCategoryById } from '@/data/cards';
import { getTheme } from '@/data/themes';
import { shuffleArray } from '@/utils/shuffle';
import { preloadVoices } from '@/utils/tts';
import WordCard from '@/components/WordCard';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = typeof params.category === 'string' ? params.category : '';

  const category = getCategoryById(categoryId);
  const theme = getTheme(categoryId);

  const shuffledCards = useMemo(() => {
    if (!category) return [];
    return shuffleArray(category.cards);
  }, [category]);

  useEffect(() => {
    preloadVoices();
  }, []);

  if (!category) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100dvh', background: '#FFF9F0' }}
      >
        <div className="text-center px-8">
          <p className="text-2xl font-black mb-6" style={{ color: '#8B5E3C' }}>
            카테고리를 찾을 수 없어요 😅
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-8 py-4 rounded-2xl text-lg font-black text-white touch-manipulation"
            style={{ background: '#FF8B6B', boxShadow: '0 5px 0 #C04030, 0 8px 20px rgba(192,64,48,0.25)' }}
          >
            홈으로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', background: theme.gradient }}
    >
      <div className="flex-1 min-h-0 flex flex-col max-w-2xl mx-auto w-full">
        <WordCard
          cards={shuffledCards}
          category={category}
          onHome={() => router.push('/')}
        />
      </div>
    </div>
  );
}
