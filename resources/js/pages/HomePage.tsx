import type { Product, CategoryInfo } from '../data/products';
import HeroSlider from '../components/HeroSlider';
import FeaturedProducts from '../components/FeaturedProducts';
import ChixFiguresSection from '../components/ChixFiguresSection';
import NewArrivals from '../components/NewArrivals';
import CategoriesSection from '../components/CategoriesSection';

interface HomePageProps {
  products: Product[];
  categories: CategoryInfo[];
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
  onAddToCart: (id: string) => void;
}

export default function HomePage({ products, categories, onView, onNavigate, onAddToCart }: HomePageProps) {
  return (
    <div>
      <HeroSlider onNavigate={onNavigate} />
      <FeaturedProducts products={products} onView={onView} onAddToCart={onAddToCart} />
      <ChixFiguresSection products={products} onView={onView} onNavigate={onNavigate} />
      <NewArrivals products={products} onView={onView} onAddToCart={onAddToCart} />
      <CategoriesSection categories={categories} onNavigate={onNavigate} />
    </div>
  );
}
