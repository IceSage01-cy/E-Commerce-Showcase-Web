import { useRef } from 'react';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface NewArrivalsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function NewArrivals({ products = [], onView, onAddToCart }: NewArrivalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...products]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 8);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section className="py-12 px-4" style={{ borderTop: '1px solid #1A1A20' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p
              style={{ color: '#22C55E', fontFamily: 'Outfit, sans-serif', fontSize: 11 }}
              className="font-700 uppercase tracking-widest mb-1"
            >
              Just Added
            </p>
            <h2
              style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
              className="text-2xl sm:text-3xl font-800"
            >
              New Arrivals
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#80808C' }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:border-[#333340] hover:text-[#F0F0F4] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#80808C' }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:border-[#333340] hover:text-[#F0F0F4] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

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
