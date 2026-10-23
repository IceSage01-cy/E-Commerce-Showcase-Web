import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';

interface NewArrivalsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  onNavigate: (page: string) => void;
}

/** Pinas On Hand on the homepage: the newest local stock as a grid, with View all for the full page. */
export default function NewArrivals({ products = [], onView, onAddToCart, onNavigate }: NewArrivalsProps) {
  // Pinas On Hand: the products we hold locally, newest first.
  const sorted = products
    .filter((p) => p.category === 'on-hand')
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 8);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          kicker="Local stock"
          title="Pinas On Hand"
          accent="#22C55E"
          action={
            <button
              onClick={() => onNavigate('new-arrivals')}
              style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-[#22C55E] transition-colors"
            >
              View all
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
