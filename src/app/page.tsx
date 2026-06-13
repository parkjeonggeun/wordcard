import CategoryCard from '@/components/CategoryCard';
import { categories } from '@/data/cards';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50 flex flex-col items-center justify-center px-6 py-8 pt-safe pb-safe">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1
            className="font-black text-gray-800 leading-tight"
            style={{ fontSize: 'clamp(34px, 7.5vw, 60px)' }}
          >
            낱말 카드 🃏
          </h1>
          <p className="text-gray-500 text-lg mt-2">카드를 골라봐요!</p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </main>
  );
}
