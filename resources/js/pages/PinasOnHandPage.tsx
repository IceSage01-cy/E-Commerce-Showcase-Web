import type { Product } from '../data/products';
import AnimeBrowser from '../components/AnimeBrowser';
import SectionHeading from '../components/SectionHeading';

interface PinasOnHandPageProps {
  products: Product[];
  /** Series name => cover picture. */
  covers: Record<string, string>;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

/** Pinas On Hand page: the products we hold locally, browsed series > character > figures. */
export default function PinasOnHandPage({ products, covers, onView, onAddToCart }: PinasOnHandPageProps) {
  const onHand = products.filter((p) => p.category === 'on-hand');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeading kicker="Local stock" title="Pinas On Hand" accent="#22C55E" />
      <AnimeBrowser
        products={onHand}
        onView={onView}
        onAddToCart={onAddToCart}
        rootLabel="All Pinas On Hand"
        covers={covers}
      />
    </div>
  );
}
