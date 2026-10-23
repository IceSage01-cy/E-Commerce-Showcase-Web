import type { CSSProperties } from 'react';
import type { CategoryInfo } from '../data/products';
import { hexToRgba } from './CategoriesSection';

interface CategoryMarqueeProps {
  categories: CategoryInfo[];
  onNavigate: (cat: string) => void;
}

const CARD_W = 168;
const CARD_H = 194; // regular hexagon: height = width * 2 / sqrt(3)
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// The strip is two identical halves; moving one half's width gives a seamless loop.
// The keyframes move the track to the right, so the list reads left to right.
const MARQUEE_CSS = `
@keyframes category-marquee {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
.category-marquee-track { animation: category-marquee var(--marquee-duration) linear infinite; }
.category-marquee:hover .category-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .category-marquee-track { animation: none !important; }
}
`;

function HexCard({ cat, onClick, duplicate }: { cat: CategoryInfo; onClick: () => void; duplicate: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={duplicate ? -1 : undefined}
      aria-label={`Browse ${cat.label}`}
      className="group flex-shrink-0"
      style={{ width: CARD_W, height: CARD_H, cursor: 'pointer' }}
    >
      {/* Outer hexagon is the glowing accent border; the inner one holds the picture. */}
      <div
        className="relative w-full h-full transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          clipPath: HEX,
          background: cat.accent,
          filter: `drop-shadow(0 0 12px ${hexToRgba(cat.accent, 0.55)})`,
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            inset: 2,
            clipPath: HEX,
            backgroundColor: '#141418',
            backgroundImage: cat.image ? undefined : `linear-gradient(135deg, ${hexToRgba(cat.accent, 0.35)}, #141418 70%)`,
          }}
        >
          {cat.image && (
            <img
              src={cat.image}
              alt=""
              loading="lazy"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ filter: 'brightness(0.6) saturate(1.2)' }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.25) 60%, ${hexToRgba(cat.accent, 0.3)} 100%)`,
            }}
          />
          <div className="relative h-full flex flex-col items-center justify-center gap-3 px-4 text-center">
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: '#F0F0F4',
                textShadow: `0 0 12px ${hexToRgba(cat.accent, 0.8)}, 0 1px 4px rgba(0,0,0,0.7)`,
                lineHeight: 1.15,
              }}
              className="text-base font-800 uppercase tracking-wide"
            >
              {cat.label}
            </span>
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ border: `1px solid ${hexToRgba(cat.accent, 0.6)}`, color: cat.accent }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M4 9H14M10 5L14 9L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function CategoryMarquee({ categories, onNavigate }: CategoryMarqueeProps) {
  if (categories.length === 0) return null;

  const sorted = categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  // Repeat the list so one half is wider than any screen, then duplicate that half for the seamless loop.
  const half = [0, 1, 2].flatMap((copy) =>
    sorted.map((cat) => ({ key: `${copy}-${cat.slug}`, cat })),
  );
  const duration = Math.max(30, half.length * 8);

  const renderHalf = (hidden: boolean) => (
    // The duplicate half stays clickable (inert would swallow clicks on the visible cards),
    // but it is hidden from screen readers and skipped by the keyboard.
    <div className="flex flex-shrink-0 gap-8 pr-8" aria-hidden={hidden || undefined}>
      {half.map(({ key, cat }) => (
        <HexCard key={`${hidden ? 'b' : 'a'}-${key}`} cat={cat} duplicate={hidden} onClick={() => onNavigate(cat.slug)} />
      ))}
    </div>
  );

  return (
    <section
      className="category-marquee relative w-full overflow-hidden py-8"
      style={{
        borderBottom: '1px solid #1A1A20',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <style>{MARQUEE_CSS}</style>
      {/* Animation lives in the stylesheet so the hover rule can pause it; an inline `animation` would override that. */}
      <div
        className="category-marquee-track flex w-max"
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        {renderHalf(false)}
        {renderHalf(true)}
      </div>
    </section>
  );
}
