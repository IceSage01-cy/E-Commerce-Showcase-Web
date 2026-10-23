import { useMemo } from 'react';
import type { Product } from '../data/products';
import HeroSlider from '../components/HeroSlider';
import CategoryMarquee from '../components/CategoryMarquee';
import type { StripItem } from '../components/CategoryMarquee';
import FeaturedProducts from '../components/FeaturedProducts';
import ChixFiguresSection from '../components/ChixFiguresSection';
import NewArrivals from '../components/NewArrivals';
import NendoroidSection from '../components/NendoroidSection';
import CategoryTiles from '../components/CategoryTiles';
import type { CategoryInfo } from '../data/products';
import { CHIX_SLUG } from '../data/products';

interface HomePageProps {
  products: Product[];
  categories: CategoryInfo[];
  /** Series name => cover picture; a series with a cover uses it on the strip. */
  covers: Record<string, string>;
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
  onAddToCart: (id: string) => void;
}

const STRIP_ACCENTS = ['#FF2D78', '#A78BFA', '#F59E0B', '#22C55E', '#38BDF8'];
/** How many anime the moving strip shows: the ones with the most products. */
const STRIP_LENGTH = 10;

/** One strip card per anime series, the STRIP_LENGTH with the most products; each opens that anime's page. */
function animeStrip(products: Product[], covers: Record<string, string>): StripItem[] {
  const bySeries = new Map<string, { count: number; image: string | null }>();
  for (const p of products) {
    // CHIX has its own product lines, so they are not anime series.
    if (!p.series || p.collection === CHIX_SLUG) continue;
    const entry = bySeries.get(p.series) ?? { count: 0, image: p.images[0] ?? null };
    entry.count += 1;
    bySeries.set(p.series, entry);
  }
  return [...bySeries.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, STRIP_LENGTH)
    .map(([series, entry], i) => ({
      key: series,
      label: series,
      image: covers[series] ?? entry.image,
      accent: STRIP_ACCENTS[i % STRIP_ACCENTS.length],
    }));
}

export default function HomePage({ products, categories, covers, onView, onNavigate, onAddToCart }: HomePageProps) {
  const strip = useMemo(() => animeStrip(products, covers), [products, covers]);

  return (
    <div>
      <HeroSlider onNavigate={onNavigate} />
      <CategoryMarquee items={strip} onSelect={onNavigate} />
      <FeaturedProducts products={products} onView={onView} onAddToCart={onAddToCart} onNavigate={onNavigate} />
      <CategoryTiles categories={categories} onNavigate={onNavigate} />
      <ChixFiguresSection products={products} onView={onView} onNavigate={onNavigate} />
      <NewArrivals products={products} onView={onView} onAddToCart={onAddToCart} />
      <NendoroidSection products={products} onView={onView} onAddToCart={onAddToCart} onNavigate={onNavigate} />
    </div>
  );
}
