import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';

interface FeaturedProductsProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function FeaturedProducts({ products = [], onView, onAddToCart }: FeaturedProductsProps) {
  const featured = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          index="01"
          kicker="Fresh From Japan"
          title="Japan New Arrivals"
          accent="#FF2D78"
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
