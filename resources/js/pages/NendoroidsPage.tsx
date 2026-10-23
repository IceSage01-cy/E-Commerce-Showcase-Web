import type { Product } from '../data/products';
import AnimeBrowser from '../components/AnimeBrowser';
import SectionHeading from '../components/SectionHeading';

interface NendoroidsPageProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

/** Full Nendoroids page, opened from the homepage section's "View all": series > character > figures, like the anime pages. */
export default function NendoroidsPage({ products, onView, onAddToCart }: NendoroidsPageProps) {
  const nendoroids = products.filter((p) => p.isNendoroid);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeading kicker="Good Smile" title="Nendoroids" accent="#FF2D78" />
      <AnimeBrowser
        products={nendoroids}
        onView={onView}
        onAddToCart={onAddToCart}
        rootLabel="All Nendoroids"
      />
    </div>
  );
}
