import type { Product } from '../data/products';
import AnimeBrowser from '../components/AnimeBrowser';
import SectionHeading from '../components/SectionHeading';

interface JapanNewArrivalsPageProps {
  products: Product[];
  /** Series name => cover picture. */
  covers: Record<string, string>;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

/** Full Japan New Arrivals page, opened from the homepage's "View all": series > character > figures. */
export default function JapanNewArrivalsPage({ products, covers, onView, onAddToCart }: JapanNewArrivalsPageProps) {
  const featured = products.filter((p) => p.isFeatured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeading kicker="Fresh From Japan" title="Japan New Arrivals" accent="#FF2D78" />
      <AnimeBrowser
        products={featured}
        onView={onView}
        onAddToCart={onAddToCart}
        rootLabel="All Japan New Arrivals"
        covers={covers}
      />
    </div>
  );
}
