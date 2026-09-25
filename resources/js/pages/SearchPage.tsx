import { useState, useMemo } from 'react';
import type { Product, Category } from '../data/products';
import ProductCard from '../components/ProductCard';
import AnimeBrowser from '../components/AnimeBrowser';

interface SearchPageProps {
  initialQuery: string;
  initialCategory?: string;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  onSearch: (q: string) => void;
  products: Product[];
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';
type AvailabilityFilter = 'all' | 'in-stock' | 'pre-order';

export default function SearchPage({ initialQuery, initialCategory, onView, onAddToCart, onSearch, products }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [filterBy, setFilterBy] = useState<'name' | 'character' | 'anime'>('name');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>(
    (initialCategory as Category) ?? 'all'
  );

  const results = useMemo(() => {
    let list = [...products];

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Availability filter
    if (availability === 'in-stock') {
      list = list.filter((p) => p.category === 'on-hand' && p.stock > 0);
    } else if (availability === 'pre-order') {
      list = list.filter((p) => p.category === 'pre-order');
    }

    // Text search. In "By Anime" mode with no typed query, we skip this
    // entirely and hand the (category/availability-filtered) list to the
    // AnimeBrowser drill-down instead — see the render section below.
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => {
        if (filterBy === 'name') return p.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q);
        if (filterBy === 'character') return p.character.toLowerCase().includes(q);
        // Typed a query while in "By Anime" mode — search everything.
        return (
          p.name.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.character.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    if (sortBy === 'price-asc') list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

    return list;
  }, [query, sortBy, availability, filterBy, categoryFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

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
          <form onSubmit={handleSearch} className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ color: '#50505C' }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search figures, series, characters…"
                style={{
                  backgroundColor: '#141418',
                  border: '1px solid #222228',
                  color: '#F0F0F4',
                  fontFamily: 'Inter, sans-serif',
                }}
                className="w-full h-11 pl-10 pr-4 rounded-full text-sm outline-none focus:border-[#FF2D78] transition-colors placeholder:text-[#50505C]"
              />
            </div>
            <button
              type="submit"
              style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
              className="px-6 rounded-full text-white text-sm font-600 hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter by field */}
            <div className="flex gap-1">
              <Pill label="By Name" active={filterBy === 'name'} onClick={() => setFilterBy('name')} />
              <Pill label="By Character" active={filterBy === 'character'} onClick={() => setFilterBy('character')} />
              <Pill label="By Anime" active={filterBy === 'anime'} onClick={() => setFilterBy('anime')} />
            </div>

            <div style={{ backgroundColor: '#222228', width: 1, height: 20 }} className="mx-1 hidden sm:block" />

            {/* Category */}
            <div className="flex gap-1 flex-wrap">
              {(['all', 'on-hand', 'pre-order'] as const).map((c) => (
                <Pill
                  key={c}
                  label={c === 'all' ? 'All' : c === 'on-hand' ? 'On Hand' : 'Pre-Order'}
                  active={categoryFilter === c}
                  onClick={() => setCategoryFilter(c)}
                />
              ))}
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
        {!(filterBy === 'anime' && !query.trim()) && (
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-sm">
              {results.length === 0
                ? 'No results found'
                : `${results.length} result${results.length !== 1 ? 's' : ''}${query.trim() ? ` for "${query}"` : ''}`}
            </p>
          </div>
        )}

        {filterBy === 'anime' && !query.trim() ? (
          <AnimeBrowser
            key={`${categoryFilter}-${availability}`}
            products={results}
            onView={onView}
            onAddToCart={onAddToCart}
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
              onClick={() => { setQuery(''); setCategoryFilter('all'); }}
              style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
              className="mt-2 px-6 py-2.5 rounded-full text-white text-sm font-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
