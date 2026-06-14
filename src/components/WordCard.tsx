'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import type { CardItem, Category } from '@/types';
import PlaceholderImage from './PlaceholderImage';
import CelebrationOverlay, { getRandomMessage } from './CelebrationOverlay';
import { useTTS } from '@/hooks/useTTS';
import { getTheme } from '@/data/themes';

interface WordCardProps {
  cards: CardItem[];
  category: Category;
  onHome: () => void;
}

function WordCard({ cards, category, onHome }: WordCardProps) {
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const celebratingRef = useRef(false);
  const { speak, speakSequence, cancel, isSpeaking } = useTTS();
  const theme = getTheme(category.id);

  const card = cards[index];
  const total = cards.length;

  const goNext = useCallback(() => {
    cancel();
    setIndex((i) => (i + 1) % total);
  }, [cancel, total]);

  const goPrev = useCallback(() => {
    cancel();
    setIndex((i) => (i - 1 + total) % total);
  }, [cancel, total]);

  const handleCorrect = useCallback(() => {
    if (celebratingRef.current || isSpeaking) return;
    celebratingRef.current = true;
    setCelebrationMsg(getRandomMessage());
    setCelebrating(true);
    speakSequence(card.nameKo, card.nameEn, 600);
  }, [card, speakSequence, isSpeaking]);

  const handleCelebrationDone = useCallback(() => {
    celebratingRef.current = false;
    setCelebrating(false);
  }, []);

  useEffect(() => {
    return () => { cancel(); };
  }, [index, cancel]);

  // Raw image preload removed — large assets (e.g. multi-MB animal photos) would
  // bypass Next.js optimisation and cause excessive mobile traffic on every card tap.

  return (
    <div className="flex flex-col h-full min-h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pb-3 shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        {/* Home button */}
        <button
          type="button"
          onClick={onHome}
          aria-label="홈으로"
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-transform duration-75 active:scale-90 touch-manipulation select-none"
          style={{
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)',
          }}
        >
          🏠
        </button>

        {/* Category label */}
        <div className="flex flex-col items-center select-none">
          <span className="font-black" style={{ fontSize: 'clamp(18px, 4.5vw, 28px)', color: theme.dark }}>
            {category.emoji} {category.nameKo}
          </span>
        </div>

        {/* Counter badge */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-black select-none"
          style={{
            background: 'rgba(255,255,255,0.75)',
            color: theme.dark,
            fontSize: 'clamp(11px, 2.5vw, 15px)',
          }}
        >
          {index + 1}/{total}
        </div>
      </div>

      {/* Progress dots */}
      <div
        className="px-5 pb-3 shrink-0"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={`${index + 1}번째 카드, 총 ${total}개`}
      >
        <div className="flex gap-1.5 justify-center flex-wrap">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 22 : 9,
                height: 9,
                background: i < index
                  ? theme.progressFill
                  : i === index
                  ? theme.accent
                  : 'rgba(255,255,255,0.55)',
                boxShadow: i <= index ? `0 1px 3px ${theme.shadow}44` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Image card */}
      <div className="flex-1 min-h-0 px-5 pb-3">
        <div
          className="w-full h-full rounded-[28px] overflow-hidden"
          style={{
            background: 'white',
            boxShadow: `0 6px 0 ${theme.shadow}30, 0 12px 32px rgba(0,0,0,0.10)`,
          }}
        >
          <PlaceholderImage
            src={card.imagePath}
            alt={card.nameKo}
            emoji={card.emoji}
            bgColor="bg-white"
            priority={true}
          />
        </div>
      </div>

      {/* Word labels */}
      <div className="text-center px-5 shrink-0 pb-3">
        <p
          className="font-black leading-tight select-none"
          style={{ fontSize: 'clamp(32px, 7.5vw, 60px)', color: '#1A1A2E' }}
        >
          {card.nameKo}
        </p>
        <p
          className="font-semibold select-none"
          style={{ fontSize: 'clamp(15px, 3.5vw, 24px)', color: '#9090A8' }}
        >
          {card.nameEn}
        </p>
      </div>

      {/* Control buttons */}
      <div className="px-4 pb-5 shrink-0 flex items-center justify-center gap-3">

        {/* Previous */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 카드"
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-transform duration-75 active:scale-90 touch-manipulation select-none font-black"
          style={{
            background: 'white',
            color: '#9090A8',
            boxShadow: '0 5px 0 #B8BCC8, 0 8px 20px rgba(0,0,0,0.10)',
          }}
        >
          ◀
        </button>

        {/* Korean TTS */}
        <button
          type="button"
          onClick={() => speak(card.nameKo, 'ko-KR')}
          aria-label="한국어 듣기"
          disabled={isSpeaking}
          className="flex flex-col items-center justify-center h-20 px-5 rounded-2xl font-black transition-all duration-75 touch-manipulation select-none"
          style={{
            background: isSpeaking ? '#F5C5BA' : '#FFE4DC',
            color: theme.dark,
            boxShadow: isSpeaking
              ? 'none'
              : `0 5px 0 ${theme.shadow}AA, 0 8px 20px rgba(200,100,80,0.14)`,
            minWidth: '4.5rem',
            fontSize: 'clamp(11px, 2.5vw, 15px)',
            opacity: isSpeaking ? 0.6 : 1,
            transform: isSpeaking ? 'translateY(3px)' : undefined,
          }}
        >
          <span className="text-2xl mb-1">🔊</span>
          <span>한국어</span>
        </button>

        {/* Correct / Star */}
        <button
          type="button"
          onClick={handleCorrect}
          aria-label="정답"
          disabled={isSpeaking || celebrating}
          className="flex flex-col items-center justify-center h-20 px-6 rounded-2xl font-black transition-all duration-75 touch-manipulation select-none"
          style={{
            background: isSpeaking || celebrating ? '#E8D040' : '#FFE566',
            color: '#6A4800',
            boxShadow: isSpeaking || celebrating
              ? 'none'
              : '0 6px 0 #C8A010, 0 10px 26px rgba(200,160,16,0.28)',
            minWidth: '5rem',
            fontSize: 'clamp(11px, 2.5vw, 15px)',
            opacity: isSpeaking || celebrating ? 0.6 : 1,
            transform: isSpeaking || celebrating ? 'translateY(4px)' : undefined,
          }}
        >
          <span className="text-3xl mb-1">⭐</span>
          <span>정답!</span>
        </button>

        {/* English TTS */}
        <button
          type="button"
          onClick={() => speak(card.nameEn, 'en-US')}
          aria-label="영어 듣기"
          disabled={isSpeaking}
          className="flex flex-col items-center justify-center h-20 px-5 rounded-2xl font-black transition-all duration-75 touch-manipulation select-none"
          style={{
            background: isSpeaking ? '#CEC8F0' : '#E8E0FF',
            color: '#38208A',
            boxShadow: isSpeaking
              ? 'none'
              : '0 5px 0 #9080C8AA, 0 8px 20px rgba(140,120,200,0.14)',
            minWidth: '4.5rem',
            fontSize: 'clamp(11px, 2.5vw, 15px)',
            opacity: isSpeaking ? 0.6 : 1,
            transform: isSpeaking ? 'translateY(3px)' : undefined,
          }}
        >
          <span className="text-2xl mb-1">🔊</span>
          <span>English</span>
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 카드"
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-transform duration-75 active:scale-90 touch-manipulation select-none font-black"
          style={{
            background: 'white',
            color: '#9090A8',
            boxShadow: '0 5px 0 #B8BCC8, 0 8px 20px rgba(0,0,0,0.10)',
          }}
        >
          ▶
        </button>
      </div>

      {celebrating && (
        <CelebrationOverlay message={celebrationMsg} onDone={handleCelebrationDone} />
      )}
    </div>
  );
}

export default memo(WordCard);
