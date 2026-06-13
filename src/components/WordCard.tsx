'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import type { CardItem, Category } from '@/types';
import PlaceholderImage from './PlaceholderImage';
import CelebrationOverlay, { getRandomMessage } from './CelebrationOverlay';
import ProgressBar from './ProgressBar';
import IconButton from './IconButton';
import { useTTS } from '@/hooks/useTTS';

interface WordCardProps {
  cards: CardItem[];
  category: Category;
  onHome: () => void;
}

function WordCard({ cards, category, onHome }: WordCardProps) {
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const celebratingRef = useRef(false); // BUG-08: immediate guard against fast taps
  const { speak, speakSequence, cancel } = useTTS();

  const card = cards[index];
  const total = cards.length;
  const nextCard = cards[(index + 1) % total];

  const goNext = useCallback(() => {
    cancel();
    setIndex((i) => (i + 1) % total);
  }, [cancel, total]);

  const goPrev = useCallback(() => {
    cancel();
    setIndex((i) => (i - 1 + total) % total);
  }, [cancel, total]);

  const handleCorrect = useCallback(() => {
    if (celebratingRef.current) return; // BUG-08: useRef guard for fast taps
    celebratingRef.current = true;
    setCelebrationMsg(getRandomMessage());
    setCelebrating(true);
    speakSequence(card.nameKo, card.nameEn, 600);
  }, [card, speakSequence]);

  const handleCelebrationDone = useCallback(() => {
    celebratingRef.current = false;
    setCelebrating(false);
  }, []);

  // Cancel TTS (including pending timers) when card changes (BUG-10)
  useEffect(() => {
    return () => { cancel(); };
  }, [index, cancel]);

  // Preload next card image via <link rel="preload"> (BUG-05)
  useEffect(() => {
    if (!nextCard) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = nextCard.imagePath;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [nextCard]);

  return (
    <div className="flex flex-col h-full min-h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header — BUG-14: calc() merges safe-area + fixed padding */}
      <div
        className="flex items-center justify-between px-4 pb-2 shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <IconButton
          onClick={onHome}
          label="홈으로"
          icon="🏠"
          className="w-14 bg-gray-100 active:bg-gray-200"
        />
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-gray-700">{category.nameKo}</span>
          <span className="text-gray-400 text-sm font-semibold">{index + 1} / {total}</span>
        </div>
        <div className="w-14" aria-hidden="true" />
      </div>

      {/* Progress */}
      <div className="px-4 shrink-0">
        <ProgressBar current={index + 1} total={total} fillClass={category.bgColor} />
      </div>

      {/* Image area */}
      <div className="flex-1 min-h-0 px-4 py-3">
        <div className={`w-full h-full rounded-3xl overflow-hidden border-4 ${category.borderColor} shadow-lg ${category.bgColor}`}>
          <PlaceholderImage
            src={card.imagePath}
            alt={card.nameKo}
            emoji={card.emoji}
            bgColor={category.bgColor}
            priority={true}
          />
        </div>
      </div>

      {/* Word label */}
      <div className="text-center px-4 shrink-0 pb-1">
        <p className="font-black text-gray-800" style={{ fontSize: 'clamp(28px, 6vw, 52px)' }}>
          {card.nameKo}
        </p>
        <p className="text-gray-400 font-semibold text-lg">{card.nameEn}</p>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 shrink-0 grid grid-cols-5 gap-2">
        <IconButton onClick={goPrev}  label="이전 카드"  icon="◀"   className="col-span-1 bg-gray-100" />
        <IconButton onClick={() => speak(card.nameKo, 'ko-KR')} label="한국어 듣기" icon="🔊" subLabel="한국어" className="col-span-1 bg-sky-100 border-2 border-sky-300 text-sky-700" />
        <IconButton onClick={handleCorrect} label="정답" icon="⭐" subLabel="정답!" className="col-span-1 bg-yellow-300 border-2 border-yellow-400 text-yellow-800 shadow-md" />
        <IconButton onClick={() => speak(card.nameEn, 'en-US')} label="영어 듣기" icon="🔊" subLabel="English" className="col-span-1 bg-purple-100 border-2 border-purple-300 text-purple-700" />
        <IconButton onClick={goNext}  label="다음 카드"  icon="▶"   className="col-span-1 bg-gray-100" />
      </div>

      {celebrating && (
        <CelebrationOverlay message={celebrationMsg} onDone={handleCelebrationDone} />
      )}
    </div>
  );
}

export default memo(WordCard);
