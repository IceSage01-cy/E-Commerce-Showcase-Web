import type { CSSProperties } from 'react';
import type { CategoryInfo } from '../data/products';
import { hexToRgba } from './CategoriesSection';

interface CategoryMarqueeProps {
  categories: CategoryInfo[];
  onNavigate: (cat: string) => void;
}

const CARD_W = 172;
const CARD_H = 198; // regular hexagon: height = width * 2 / sqrt(3)
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// The strip is two identical halves; moving one half's width gives a seamless loop.
// The keyframes move the track to the right, so the list reads left to right.
// Hover styles live here (not inline) so they can use :hover and the --accent variable.
const MARQUEE_CSS = `
@keyframes category-marquee {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
.category-marquee-track { animation: category-marquee var(--marquee-duration) linear infinite; }
.category-marquee:hover .category-marquee-track { animation-play-state: paused; }

.hex-card {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hex-card:hover,
.hex-card:focus-visible { transform: translateY(-8px) scale(1.05); }
.hex-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 6px; }
.hex-frame {
  filter: drop-shadow(0 0 10px var(--glow-soft));
  transition: filter 0.35s;
}
.hex-card:hover .hex-frame,
.hex-card:focus-visible .hex-frame { filter: drop-shadow(0 0 24px var(--accent)); }
.hex-image { transition: transform 0.6s; }
.hex-card:hover .hex-image { transform: scale(1.15); }
.hex-tint {
  opacity: 0.25;
  transition: opacity 0.35s;
}
.hex-card:hover .hex-tint { opacity: 0.6; }
.hex-label {
  transition: text-shadow 0.35s, letter-spacing 0.35s;
}
.hex-card:hover .hex-label {
  text-shadow: 0 0 18px var(--accent), 0 1px 4px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.08em;
}
.hex-bar {
  width: 28px;
  transition: width 0.35s;
}
.hex-card:hover .hex-bar { width: 64px; }
.hex-arrow {
  transition: background-color 0.3s, color 0.3s, transform 0.3s;
}
.hex-card:hover .hex-arrow {
  background-color: var(--accent);
  color: #0A0A0B;
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .category-marquee-track { animation: none !important; }
  .hex-card, .hex-card:hover { transform: none; }
  .hex-card:hover .hex-image { transform: none; }
}
`;

function HexCard({ cat, onClick, duplicate }: { cat: CategoryInfo; onClick: () => void; duplicate: boolean }) {
  const vars = {
    '--accent': cat.accent,
    '--glow-soft': hexToRgba(cat.accent, 0.55),
  } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={duplicate ? -1 : undefined}
      aria-label={`Browse ${cat.label}`}
      className="hex-card"
      style={{ ...vars, width: CARD_W, height: CARD_H }}
    >
      {/* Outer hexagon is the glowing accent border; the inner one holds the picture. */}
      <div className="hex-frame relative w-full h-full" style={{ clipPath: HEX, background: cat.accent }}>
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
              className="hex-image absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.6) saturate(1.2)' }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.25) 60%, ${hexToRgba(cat.accent, 0.3)} 100%)`,
            }}
          />
          <div className="hex-tint absolute inset-0" style={{ backgroundColor: cat.accent, mixBlendMode: 'overlay' }} />
          <div className="relative h-full flex flex-col items-center justify-center gap-3 px-4 text-center">
            <span
              className="hex-label"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: '#FFFFFF',
                textShadow: `0 0 12px ${hexToRgba(cat.accent, 0.8)}, 0 1px 4px rgba(0,0,0,0.7)`,
                lineHeight: 1.1,
              }}
            >
              <span className="block text-[1.05rem] font-semibold uppercase tracking-wide">{cat.label}</span>
            </span>
            <span className="hex-bar block h-[3px] rounded-full" style={{ background: cat.accent }} />
            <span
              className="hex-arrow flex items-center justify-center w-8 h-8 rounded-full"
              style={{ border: `1px solid ${hexToRgba(cat.accent, 0.7)}`, color: cat.accent }}
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
      className="category-marquee relative w-full overflow-hidden py-10"
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
