import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { CHIX_SLUG, FIGURE_TYPES, formatPrice, getStockStyle } from '../data/products';

interface ChixFiguresSectionProps {
  products: Product[];
  onView: (id: string) => void;
  onNavigate: (page: string) => void;
}

const MAX_SLIDES = 6;
const AUTOPLAY_MS = 5000;
const ACCENT = '#22C55E';

/** Homepage "CHIX Figures" section (under Japan New Arrivals): a slide preview of the newest CHIX products. */
export default function ChixFiguresSection({ products = [], onView, onNavigate }: ChixFiguresSectionProps) {
  const slides = products
    .filter((p) => p.collection === CHIX_SLUG)
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, MAX_SLIDES);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  // Keep the index valid if the list shrinks (e.g. products re-fetched).
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) return null;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          index="03"
          kicker="Our CHIX Line"
          title="CHIX Figures"
          accent={ACCENT}
          action={
            <button
              onClick={() => onNavigate(CHIX_SLUG)}
              style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }}
              className="hidden sm:flex items-center gap-2 text-sm font-700 uppercase tracking-wider hover:text-[#22C55E] transition-colors"
            >
              View all
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        />

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ backgroundColor: '#141418', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '0.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(34,197,94,0.12)' }}
        >
          {/* Slides */}
          <div style={{ display: 'flex', transform: `translateX(-${index * 100}%)`, transition: 'transform 0.5s ease' }}>
            {slides.map((p, i) => (
              <Slide key={p.id} product={p} active={i === index} onView={onView} />
            ))}
          </div>

          {/* Arrows */}
          {count > 1 && (
            <>
              <ArrowButton side="left" label="Previous slide" onClick={() => go(-1)} />
              <ArrowButton side="right" label="Next slide" onClick={() => go(1)} />
            </>
          )}
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 9999,
                  backgroundColor: i === index ? ACCENT : '#2A2A32',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Slide({ product, active, onView }: { product: Product; active: boolean; onView: (id: string) => void }) {
  const [imgError, setImgError] = useState(false);
  const stock = getStockStyle(product.inStock);
  const typeLabel = FIGURE_TYPES.find((t) => t.value === product.figureType)?.label.replace(' Figures', '');
  const price = product.salePrice ?? product.price;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 w-full flex-shrink-0"
      style={{ minWidth: '100%' }}
      aria-hidden={!active}
    >
      <button
        type="button"
        onClick={() => onView(product.id)}
        tabIndex={active ? 0 : -1}
        style={{ aspectRatio: '4 / 3', backgroundColor: '#1A1A1F', display: 'block', width: '100%' }}
        className="overflow-hidden"
        aria-label={`View ${product.name}`}
      >
        {!imgError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: '#30303C', fontFamily: 'Outfit, sans-serif' }}>
            CHIX
          </div>
        )}
      </button>

      <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {typeLabel && (
            <span
              style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: ACCENT, border: '1px solid rgba(34,197,94,0.25)', fontFamily: 'Outfit, sans-serif' }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider"
            >
              {typeLabel}
            </span>
          )}
          <span
            style={{ backgroundColor: stock.bg, color: stock.text, fontFamily: 'Outfit, sans-serif' }}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider"
          >
            {stock.label}
          </span>
        </div>

        <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-xl sm:text-2xl font-800 leading-tight">
          {product.name}
        </h3>
        <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
          {[product.series, product.scale && product.scale !== 'Non-scale' ? product.scale : null].filter(Boolean).join(' · ')}
        </p>

        <div className="flex items-baseline gap-2">
          <span style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-2xl font-800">{formatPrice(price)}</span>
          {product.salePrice != null && (
            <span style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 14, textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onView(product.id)}
          tabIndex={active ? 0 : -1}
          style={{ background: ACCENT, color: '#04140A', fontFamily: 'Outfit, sans-serif' }}
          className="self-start mt-1 px-6 py-2.5 rounded-full text-sm font-700 hover:opacity-90 transition-opacity"
        >
          View figure
        </button>
      </div>
    </div>
  );
}

function ArrowButton({ side, label, onClick }: { side: 'left' | 'right'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        position: 'absolute',
        top: '50%',
        [side]: 10,
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(10,10,11,0.7)',
        border: '1px solid #222228',
        color: '#F0F0F4',
      }}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:border-[#333340] transition-all backdrop-blur-sm"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d={side === 'left' ? 'M9 11L5 7L9 3' : 'M5 3L9 7L5 11'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
