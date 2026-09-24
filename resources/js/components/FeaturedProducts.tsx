import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function FeaturedProducts({ products = [], onView, onAddToCart }: FeaturedProductsProps) {
  const featured = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p
              style={{ color: '#FF2D78', fontFamily: 'Outfit, sans-serif', fontSize: 11 }}
              className="font-700 uppercase tracking-widest mb-1"
            >
              Curated Picks
            </p>
            <h2
              style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
              className="text-2xl sm:text-3xl font-800"
            >
              Featured Collection
            </h2>
          </div>
          <button
            onClick={() => onView('all')}
            style={{ color: '#80808C', fontFamily: 'Inter, sans-serif' }}
            className="text-sm font-500 flex items-center gap-1.5 hover:text-[#F0F0F4] transition-colors"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Grid — first card is large, rest are standard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {featured.slice(0, 2).map((p, i) => (
            <div key={p.id} className={i === 0 ? 'col-span-2 sm:col-span-2 lg:col-span-2' : 'col-span-2 sm:col-span-1 lg:col-span-2'}>
              <ProductCard product={p} onView={onView} onAddToCart={onAddToCart} size="lg" />
            </div>
          ))}
          {featured.slice(2).map((p) => (
            <div key={p.id} className="col-span-1 sm:col-span-1 lg:col-span-1">
              <ProductCard product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
