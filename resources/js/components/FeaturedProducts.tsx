import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';

interface FeaturedProductsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  onNavigate: (page: string) => void;
}

export default function FeaturedProducts({ products = [], onView, onAddToCart, onNavigate }: FeaturedProductsProps) {
  const featured = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          kicker="Fresh From Japan"
          title="Japan New Arrivals"
          accent="#FF2D78"
          action={
            <button
              onClick={() => onNavigate('japan-new-arrivals')}
              style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-[#FF2D78] transition-colors"
            >
              View all
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        />

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
