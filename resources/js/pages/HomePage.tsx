import type { Product } from '../data/products';
import HeroSlider from '../components/HeroSlider';
import FeaturedProducts from '../components/FeaturedProducts';
import NewArrivals from '../components/NewArrivals';
import CategoriesSection from '../components/CategoriesSection';

interface HomePageProps {
  products: Product[];
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
  onAddToCart: (id: string) => void;
}

export default function HomePage({ products, onView, onNavigate, onAddToCart }: HomePageProps) {
  return (
    <div>
      <HeroSlider onNavigate={onNavigate} />
      <FeaturedProducts products={products} onView={onView} onAddToCart={onAddToCart} />
      <NewArrivals products={products} onView={onView} onAddToCart={onAddToCart} />
      <CategoriesSection onNavigate={onNavigate} />
    </div>
  );
}
