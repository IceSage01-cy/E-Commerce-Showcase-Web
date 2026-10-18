import type { CategoryInfo, Collection } from '../data/products';

interface CategoriesSectionProps {
  categories: CategoryInfo[];
  onNavigate: (cat: string) => void;
}

/** Shown until /api/categories answers (or if it ever fails), so the section never goes blank. */
const FALLBACK: CategoryInfo[] = [
  { id: 'f1', slug: 'anime-figures', label: 'Anime Figures', sublabel: 'Characters from your favorite series', description: '', accent: '#FF2D78', image: null, sortOrder: 1 },
  { id: 'f2', slug: 'scale-figures', label: 'Scale Figures', sublabel: '1/7 · 1/6 · 1/8 and more', description: '', accent: '#A78BFA', image: null, sortOrder: 2 },
  { id: 'f3', slug: 'rare-exclusive', label: 'Rare / Exclusive Items', sublabel: 'Limited runs & hard-to-find pieces', description: '', accent: '#F59E0B', image: null, sortOrder: 3 },
  { id: 'f4', slug: 'chix-figures', label: 'CHIX Figures', sublabel: 'Our CHIX line', description: '', accent: '#22C55E', image: null, sortOrder: 4 },
];

const hexToRgba = (hex: string, alpha: number) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return `rgba(255,45,120,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
};

function Arrow({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color }}>
      <path d="M4 9H14M10 5L14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One category card: the admin-uploaded picture is the card's background. */
function CategoryCard({ cat, onClick, wide }: { cat: CategoryInfo; onClick: () => void; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
        width: '100%',
        minHeight: wide ? 150 : 220,
        borderRadius: '0.875rem',
        border: `1px solid ${hexToRgba(cat.accent, 0.3)}`,
        backgroundColor: '#141418',
        // No picture yet: a soft accent gradient instead of an empty box.
        backgroundImage: cat.image ? undefined : `linear-gradient(135deg, ${hexToRgba(cat.accent, 0.22)}, #141418 70%)`,
      }}
      className="group transition-all hover:border-opacity-70"
      aria-label={`Browse ${cat.label}`}
    >
      {cat.image && (
        <img
          src={cat.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ filter: 'brightness(0.62) saturate(1.1)' }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.35) 55%, rgba(10,10,11,0.1) 100%)' }}
      />

      <div
        className="relative flex flex-col justify-end h-full p-4"
        style={{ minHeight: wide ? 150 : 220 }}
      >
        <span
          style={{
            alignSelf: 'flex-start',
            backgroundColor: hexToRgba(cat.accent, 0.16),
            color: cat.accent,
            border: `1px solid ${hexToRgba(cat.accent, 0.35)}`,
            fontFamily: 'Outfit, sans-serif',
          }}
          className="px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider mb-2 backdrop-blur-sm"
        >
          Browse
        </span>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-lg font-800 leading-tight">
              {cat.label}
            </h3>
            {cat.sublabel && (
              <p style={{ color: '#B0B0BC', fontFamily: 'Inter, sans-serif' }} className="text-xs font-500 mt-0.5">
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

export default function CategoriesSection({ categories, onNavigate }: CategoriesSectionProps) {
  const list = (categories.length ? categories : FALLBACK)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const isChix = (slug: Collection) => slug === 'chix-figures';
  const main = list.filter((c) => !isChix(c.slug));
  const chix = list.find((c) => isChix(c.slug));

  return (
    <section className="py-12 px-4" style={{ borderTop: '1px solid #1A1A20' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p
            style={{ color: '#80808C', fontFamily: 'Outfit, sans-serif', fontSize: 11 }}
            className="font-700 uppercase tracking-widest mb-1"
          >
            Browse By
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl sm:text-3xl font-800">
            Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {main.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} onClick={() => onNavigate(cat.slug)} />
          ))}
        </div>

        {/* CHIX Figures sits on its own row at the bottom */}
        {chix && (
          <div className="mt-4">
            <CategoryCard cat={chix} wide onClick={() => onNavigate(chix.slug)} />
          </div>
        )}
      </div>
    </section>
  );
}
