import { useRef } from 'react';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';

interface NewArrivalsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function NewArrivals({ products = [], onView, onAddToCart }: NewArrivalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pinas On Hand: the products we hold locally, newest first.
  const sorted = products
    .filter((p) => p.category === 'on-hand')
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 8);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          kicker="Local stock"
          title="Pinas On Hand"
          accent="#22C55E"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#A0A0AC' }}
                className="w-11 h-11 flex items-center justify-center hover:bg-[#22C55E] hover:text-[#04140A] hover:border-[#22C55E] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#A0A0AC' }}
                className="w-11 h-11 flex items-center justify-center hover:bg-[#22C55E] hover:text-[#04140A] hover:border-[#22C55E] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          }
        />

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sorted.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 scroll-snap-item"
              style={{ width: 'min(220px, calc(50vw - 24px))' }}
            >
              <ProductCard product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
