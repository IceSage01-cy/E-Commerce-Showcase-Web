import { useMemo } from 'react';
import type { Product } from '../data/products';
import HeroSlider from '../components/HeroSlider';
import CategoryMarquee from '../components/CategoryMarquee';
import type { StripItem } from '../components/CategoryMarquee';
import FeaturedProducts from '../components/FeaturedProducts';
import ChixFiguresSection from '../components/ChixFiguresSection';
import NewArrivals from '../components/NewArrivals';
import NendoroidSection from '../components/NendoroidSection';

interface HomePageProps {
  products: Product[];
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
  onAddToCart: (id: string) => void;
}

const STRIP_ACCENTS = ['#FF2D78', '#A78BFA', '#F59E0B', '#22C55E', '#38BDF8'];

/** One strip card per anime series, biggest series first; each opens that anime's page. */
function animeStrip(products: Product[]): StripItem[] {
  const bySeries = new Map<string, { count: number; image: string | null }>();
  for (const p of products) {
    if (!p.series) continue;
    const entry = bySeries.get(p.series) ?? { count: 0, image: p.images[0] ?? null };
    entry.count += 1;
    bySeries.set(p.series, entry);
  }
  return [...bySeries.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .map(([series, entry], i) => ({
      key: series,
      label: series,
      image: entry.image,
      accent: STRIP_ACCENTS[i % STRIP_ACCENTS.length],
    }));
}

export default function HomePage({ products, onView, onNavigate, onAddToCart }: HomePageProps) {
  const strip = useMemo(() => animeStrip(products), [products]);

  return (
    <div>
      <HeroSlider onNavigate={onNavigate} />
      <CategoryMarquee items={strip} onSelect={onNavigate} />
      <FeaturedProducts products={products} onView={onView} onAddToCart={onAddToCart} />
      <ChixFiguresSection products={products} onView={onView} onNavigate={onNavigate} />
      <NewArrivals products={products} onView={onView} onAddToCart={onAddToCart} />
      <NendoroidSection products={products} onView={onView} onAddToCart={onAddToCart} onNavigate={onNavigate} />
    </div>
  );
}
