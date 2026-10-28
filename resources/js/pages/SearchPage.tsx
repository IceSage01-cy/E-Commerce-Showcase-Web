import { useState, useMemo } from 'react';
import type { Product, Category, CategoryInfo, FigureType } from '../data/products';
import { FALLBACK_CATEGORIES, SCALE_SLUG } from '../data/products';
import ProductCard from '../components/ProductCard';
import { usePaged, ShowMoreButton } from '../components/ShowMore';
import AnimeBrowser, { type BrowseSplit } from '../components/AnimeBrowser';

// Scale Figures are split by scale (1/6, 1/7, ...) before the anime drill-down.
const SCALE_SPLIT: BrowseSplit = { key: 'scale', labelOf: (value) => value };

interface SearchPageProps {
  initialQuery: string;
  initialCategory?: string;
  /** Main category (Anime Figures, Scale Figures, ...) to start filtered on. */
  initialCollection?: string;
  categories?: CategoryInfo[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  products: Product[];
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

export default function SearchPage({ initialQuery, initialCategory, initialCollection, categories = FALLBACK_CATEGORIES, onView, onAddToCart, products }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>(
    (initialCategory as Category) || 'all'
  );

  // (declared below, after `results`)
  const [collectionFilter, setCollectionFilter] = useState<string>(initialCollection || 'all');
  // Prize / Scale split for CHIX Figures.
  const [figureTypeFilter, setFigureTypeFilter] = useState<FigureType | 'all'>('all');

  const results = useMemo(() => {
    let list = [...products];

    // Main category filter
    if (collectionFilter !== 'all') {
      list = list.filter((p) => p.collection === collectionFilter);
    }

    // Category filter (on-hand items must also be in stock to count as available)
    if (categoryFilter !== 'all') {
      list = list.filter((p) =>
        p.category === categoryFilter &&
        (categoryFilter !== 'on-hand' || p.inStock)
      );
    }

    // Prize / Scale filter (CHIX Figures only)
    // Prize = CHIX prize figures. Scale = CHIX scale figures and the Scale Figures collection.
    if (figureTypeFilter === 'prize') {
      list = list.filter((p) => p.figureType === 'prize');
    } else if (figureTypeFilter === 'scale') {
      list = list.filter((p) => p.figureType === 'scale' || p.collection === SCALE_SLUG);
    }

    // Text search. With no typed query the list goes to the AnimeBrowser drill-down instead (see below).
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.character.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-asc') list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

    return list;
  }, [query, sortBy, categoryFilter, collectionFilter, figureTypeFilter, products]);
  const paged = usePaged(results);

  const pillBase = {
    borderRadius: 9999,
    fontFamily: 'Outfit, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: '4px 14px',
    border: '1px solid',
  };

  function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        style={{
          ...pillBase,
          backgroundColor: active ? '#FF2D78' : '#141418',
          color: active ? '#FFFFFF' : '#80808C',
          borderColor: active ? '#FF2D78' : '#222228',
          boxShadow: active ? '0 2px 12px rgba(255,45,120,0.25)' : 'none',
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Search header */}
      <div
        style={{ backgroundColor: '#0D0D10', borderBottom: '1px solid #1A1A20' }}
        className="px-4 py-6"
      >
        <div className="max-w-7xl mx-auto">
          {collectionFilter !== 'all' && (
            <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 0.95 }} className="text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4">
              {categories.find((c) => c.slug === collectionFilter)?.label ?? 'Shop'}
            </h1>
          )}

          {/* Filters row: availability and figure type, plus sort */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1 flex-wrap">
              <Pill
                label="All"
                active={categoryFilter === 'all' && figureTypeFilter === 'all'}
                onClick={() => { setCategoryFilter('all'); setFigureTypeFilter('all'); }}
              />
              <Pill label="On Hand" active={categoryFilter === 'on-hand'} onClick={() => setCategoryFilter('on-hand')} />
              <Pill label="Pre-Order" active={categoryFilter === 'pre-order'} onClick={() => setCategoryFilter('pre-order')} />
              {collectionFilter !== SCALE_SLUG && (
                <>
                  <Pill label="Prize" active={figureTypeFilter === 'prize'} onClick={() => setFigureTypeFilter('prize')} />
                  <Pill label="Scale" active={figureTypeFilter === 'scale'} onClick={() => setFigureTypeFilter('scale')} />
                </>
              )}
            </div>

            <div style={{ backgroundColor: '#222228', width: 1, height: 20 }} className="mx-1 hidden sm:block" />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                backgroundColor: '#141418',
                border: '1px solid #222228',
                color: '#80808C',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                borderRadius: 9999,
                padding: '4px 12px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!!query.trim() && (
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-sm">
              {results.length === 0
                ? 'No results found'
                : `${results.length} result${results.length !== 1 ? 's' : ''}${query.trim() ? ` for "${query}"` : ''}`}
            </p>
          </div>
        )}

        {!query.trim() ? (
          <AnimeBrowser
            key={`${collectionFilter}-${categoryFilter}-${figureTypeFilter}`}
            products={results}
            onView={onView}
            onAddToCart={onAddToCart}
            split={collectionFilter === 'scale-figures' ? SCALE_SPLIT : undefined}
            rootLabel={`All ${categories.find((c) => c.slug === collectionFilter)?.label ?? 'Figures'}`}
          />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div style={{ color: '#222228' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2" />
                <path d="M33 33L43 43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 22H27M22 17V27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ color: '#50505C', fontFamily: 'Outfit, sans-serif' }} className="text-base font-600">No figures found</p>
            <p style={{ color: '#30303C', fontFamily: 'Inter, sans-serif' }} className="text-sm text-center max-w-xs">
              Try a different search term, or browse all categories below.
            </p>
            <button
              onClick={() => { setQuery(''); setCategoryFilter('all'); setCollectionFilter('all'); setFigureTypeFilter('all'); }}
              style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
              className="mt-2 px-6 py-2.5 rounded-full text-white text-sm font-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {paged.shown.map((p) => (
                <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
              ))}
            </div>
            <ShowMoreButton remaining={paged.remaining} onClick={paged.more} />
          </>
        )}
      </div>
    </div>
  );
}
