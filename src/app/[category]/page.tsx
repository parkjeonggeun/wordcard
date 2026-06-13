'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { getCategoryById } from '@/data/cards';
import { shuffleArray } from '@/utils/shuffle';
import WordCard from '@/components/WordCard';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = typeof params.category === 'string' ? params.category : '';

  const category = getCategoryById(categoryId);

  const shuffledCards = useMemo(() => {
    if (!category) return [];
    return shuffleArray(category.cards);
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <p className="text-2xl text-gray-500 mb-4">카테고리를 찾을 수 없어요</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-sky-400 text-white rounded-2xl text-lg font-bold touch-manipulation"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full" style={{ height: '100dvh' }}>
        <WordCard
          cards={shuffledCards}
          category={category}
          onHome={() => router.push('/')}
        />
      </div>
    </div>
  );
}
