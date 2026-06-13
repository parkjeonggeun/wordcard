import CategoryCard from '@/components/CategoryCard';
import { categories } from '@/data/cards';

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-8 pt-safe pb-safe"
      style={{ background: 'linear-gradient(160deg, #FFF9F0 0%, #FFF4E6 50%, #FFEEDD 100%)' }}
    >
      <div className="w-full max-w-2xl">
        {/* App header */}
        <div className="text-center mb-10">
          <div
            className="text-8xl mb-3 select-none"
            style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))', lineHeight: 1 }}
            aria-hidden="true"
          >
            🌈
          </div>
          <h1
            className="font-black leading-none"
            style={{ fontSize: 'clamp(40px, 10vw, 72px)', color: '#5A3410' }}
          >
            낱말 카드
          </h1>
          <p
            className="font-bold mt-3"
            style={{ fontSize: 'clamp(16px, 4vw, 22px)', color: '#C87040' }}
          >
            카드를 골라봐요! 🎯
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-3 gap-5 sm:gap-7">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
