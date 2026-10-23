import type { CategoryInfo } from '../data/products';
import { hexToRgba } from '../lib/color';

function Arrow({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color }}>
      <path d="M4 9H14M10 5L14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One category card: the admin-uploaded picture is the card's background; color and style come from Admin -> Categories. */
export function CategoryCard({ cat, onClick, wide }: { cat: CategoryInfo; onClick?: () => void; wide?: boolean }) {
  const bold = cat.style === 'bold';
  const glow = cat.style === 'glow';
  const minH = wide ? 150 : 220;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
        width: '100%',
        minHeight: minH,
        borderRadius: '0.875rem',
        border: `${bold ? 2 : 1}px solid ${hexToRgba(cat.accent, bold ? 0.9 : 0.3)}`,
        boxShadow: glow ? `0 0 22px ${hexToRgba(cat.accent, 0.45)}, inset 0 0 18px ${hexToRgba(cat.accent, 0.12)}` : undefined,
        backgroundColor: '#141418',
        // No picture yet: a soft accent gradient instead of an empty box.
        backgroundImage: cat.image ? undefined : `linear-gradient(135deg, ${hexToRgba(cat.accent, 0.22)}, #141418 70%)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      className="group transition-all"
      aria-label={`Browse ${cat.label}`}
    >
      {cat.image && (
        <img
          src={cat.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ filter: bold ? 'brightness(0.75) saturate(1.3)' : 'brightness(0.62) saturate(1.1)' }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: bold
            ? `linear-gradient(to top, ${hexToRgba(cat.accent, 0.55)} 0%, rgba(10,10,11,0.45) 55%, rgba(10,10,11,0.1) 100%)`
            : 'linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.35) 55%, rgba(10,10,11,0.1) 100%)',
        }}
      />

      <div className="relative flex flex-col justify-end h-full p-4" style={{ minHeight: minH }}>
        <span
          style={{
            alignSelf: 'flex-start',
            backgroundColor: bold ? cat.accent : hexToRgba(cat.accent, 0.16),
            color: bold ? '#0A0A0B' : cat.accent,
            border: `1px solid ${hexToRgba(cat.accent, 0.35)}`,
            fontFamily: 'Outfit, sans-serif',
          }}
          className="px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider mb-2 backdrop-blur-sm"
        >
          Browse
        </span>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: '#F0F0F4',
                textTransform: bold ? 'uppercase' : undefined,
                letterSpacing: bold ? '0.03em' : undefined,
                textShadow: glow ? `0 0 12px ${hexToRgba(cat.accent, 0.8)}` : '0 1px 6px rgba(0,0,0,0.6)',
                fontSize: bold ? '1.4rem' : '1.15rem',
              }}
              className="font-800 leading-tight"
            >
              {cat.label}
            </h3>
            {cat.sublabel && (
              <p style={{ color: '#D0D0DA', fontFamily: 'Inter, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }} className="text-xs font-500 mt-0.5">
                {cat.sublabel}
              </p>
            )}
          </div>
          <span className="flex-shrink-0 transition-opacity opacity-60 group-hover:opacity-100">
            <Arrow color={cat.accent} />
          </span>
        </div>
      </div>
    </button>
  );
}

