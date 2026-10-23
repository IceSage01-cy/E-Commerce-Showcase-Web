import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';

interface NendoroidSectionProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  onNavigate: (page: string) => void;
}

const SHOWN_ON_HOME = 4;

/** Homepage Nendoroids section: a few Nendoroids, with "View all" to the full Nendoroids page. */
export default function NendoroidSection({ products, onView, onAddToCart, onNavigate }: NendoroidSectionProps) {
  const list = products.filter((p) => p.isNendoroid);
  if (list.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          kicker="Good Smile"
          title="Nendoroids"
          accent="#FF2D78"
          action={
            <button
              onClick={() => onNavigate('nendoroids')}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {list.slice(0, SHOWN_ON_HOME).map((p) => (
            <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
