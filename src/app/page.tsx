import CategoryCard from '@/components/CategoryCard';
import { categories } from '@/data/cards';

export default function Home() {
  return (
    <main
      className="h-dvh flex flex-col items-center px-4 py-4 pt-safe pb-safe overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFF9F0 0%, #FFF4E6 50%, #FFEEDD 100%)' }}
    >
      <div className="w-full max-w-2xl flex flex-col h-full">
        {/* App header */}
        <div className="text-center mb-3 flex-shrink-0">
          <div
            className="text-5xl mb-1 select-none"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))', lineHeight: 1 }}
            aria-hidden="true"
          >
            🌈
          </div>
          <h1
            className="font-black leading-none"
            style={{ fontSize: 'clamp(28px, 7vw, 52px)', color: '#5A3410' }}
          >
            낱말 카드
          </h1>
          <p
            className="font-bold mt-1"
            style={{ fontSize: 'clamp(13px, 3vw, 18px)', color: '#C87040' }}
          >
            카드를 골라봐요! 🎯
          </p>
        </div>

        {/* Category grid — fills remaining height, no scroll */}
        <div
          className="flex-1 min-h-0 grid grid-cols-3 gap-3"
          style={{ gridAutoRows: '1fr' }}
        >
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
