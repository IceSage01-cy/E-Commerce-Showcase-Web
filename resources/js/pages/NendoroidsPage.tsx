import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';

interface NendoroidsPageProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  onNavigate: (page: string) => void;
}

/** Full Nendoroids page, opened from the homepage section's "View all". Newest first. */
export default function NendoroidsPage({ products, onView, onAddToCart, onNavigate }: NendoroidsPageProps) {
  const list = products
    .filter((p) => p.isNendoroid)
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
        <button onClick={() => onNavigate('home')} style={{ color: '#80808C' }} className="hover:text-[#F0F0F4] transition-colors">Home</button>
        <span style={{ color: '#30303C' }}>/</span>
        <span style={{ color: '#F0F0F4' }}>Nendoroids</span>
      </div>

      <SectionHeading kicker="Good Smile" title="Nendoroids" accent="#FF2D78" />

      {list.length === 0 ? (
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-sm py-12 text-center">
          No Nendoroids yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
