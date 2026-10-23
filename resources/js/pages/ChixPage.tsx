import { useMemo, useState } from 'react';
import type { Product, CategoryInfo, FigureType } from '../data/products';
import { CHIX_SLUG, FIGURE_TYPES } from '../data/products';
import ProductCard from '../components/ProductCard';
import { usePaged, ShowMoreButton } from '../components/ShowMore';

interface ChixPageProps {
  products: Product[];
  categories: CategoryInfo[];
  onNavigate: (page: string) => void;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const ACCENT = '#22C55E';

/** CHIX "View all": first pick Prize or Scale figures, then see those products. */
export default function ChixPage({ products, categories, onNavigate, onView, onAddToCart }: ChixPageProps) {
  const [type, setType] = useState<FigureType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const chix = useMemo(() => products.filter((p) => p.collection === CHIX_SLUG), [products]);
  const accent = categories.find((c) => c.slug === CHIX_SLUG)?.accent ?? ACCENT;
  const title = categories.find((c) => c.slug === CHIX_SLUG)?.label ?? 'CHIX Figures';

  const results = useMemo(() => {
    const list = chix.filter((p) => p.figureType === type);
    if (sortBy === 'price-asc') list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    return list;
  }, [chix, type, sortBy]);
  const paged = usePaged(results);

  const active = FIGURE_TYPES.find((t) => t.value === type);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
        <button onClick={() => onNavigate('home')} style={{ color: '#80808C' }} className="hover:text-[#F0F0F4] transition-colors">Home</button>
        <span style={{ color: '#30303C' }}>/</span>
        <button
          onClick={() => setType(null)}
          style={{ color: type ? '#80808C' : '#F0F0F4' }}
          className="hover:text-[#F0F0F4] transition-colors"
        >
          {title}
        </button>
        {active && (
          <>
            <span style={{ color: '#30303C' }}>/</span>
            <span style={{ color: '#F0F0F4' }}>{active.label}</span>
          </>
        )}
      </div>

      {!type ? (
        <>
          <div className="mb-8">
            <p style={{ color: accent, fontFamily: 'Outfit, sans-serif', fontSize: 11 }} className="font-700 uppercase tracking-widest mb-1">Our CHIX Line</p>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 0.95 }} className="text-5xl sm:text-6xl font-black uppercase tracking-tight">{title}</h1>
            <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 14 }} className="mt-2">What are you looking for?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIGURE_TYPES.map((t) => {
              const items = chix.filter((p) => p.figureType === t.value);
              return <TypeCard key={t.value} label={t.label} blurb={t.blurb} count={items.length} image={items[0]?.images[0]} accent={accent} onClick={() => setType(t.value)} />;
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p style={{ color: accent, fontFamily: 'Outfit, sans-serif', fontSize: 11 }} className="font-700 uppercase tracking-widest mb-1">{title}</p>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 0.95 }} className="text-5xl sm:text-6xl font-black uppercase tracking-tight">{active?.label}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {FIGURE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    borderRadius: 9999, fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, padding: '4px 14px', border: '1px solid',
                    backgroundColor: type === t.value ? accent : '#141418',
                    color: type === t.value ? '#04140A' : '#80808C',
                    borderColor: type === t.value ? accent : '#222228',
                  }}
                >
                  {t.label}
                </button>
              ))}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort"
                style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 9999, padding: '4px 12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p style={{ color: '#50505C', fontFamily: 'Outfit, sans-serif' }} className="text-base font-600">No {active?.label.toLowerCase()} yet</p>
              <button onClick={() => setType(null)} style={{ background: accent, color: '#04140A', fontFamily: 'Outfit, sans-serif' }} className="px-6 py-2.5 rounded-full text-sm font-700">
                Back to selection
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
        </>
      )}
    </div>
  );
}

function TypeCard({ label, blurb, count, image, accent, onClick }: { label: string; blurb: string; count: number; image?: string; accent: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', textAlign: 'left', minHeight: 220, borderRadius: '1rem',
        backgroundColor: '#141418', border: `1px solid ${hovered ? accent : '#222228'}`, transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease' }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.95) 15%, rgba(10,10,11,0.2) 100%)' }} />
      <div className="relative flex flex-col justify-end h-full p-6" style={{ minHeight: 220 }}>
        <span style={{ color: accent, fontFamily: 'Outfit, sans-serif', fontSize: 11 }} className="font-700 uppercase tracking-widest mb-1">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 0.95 }} className="text-3xl font-black uppercase tracking-tight">{label}</h2>
        <p style={{ color: '#B0B0BC', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1 max-w-sm">{blurb}</p>
        <span style={{ color: accent, fontFamily: 'Outfit, sans-serif', fontSize: 13 }} className="font-700 mt-3">Browse →</span>
      </div>
    </button>
  );
}
