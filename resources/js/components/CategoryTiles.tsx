import type { CategoryInfo } from '../data/products';
import { CHIX_SLUG } from '../data/products';
import { hexToRgba } from '../lib/color';

interface CategoryTilesProps {
  categories: CategoryInfo[];
  onNavigate: (page: string) => void;
}

/** Four wide category tiles under Japan New Arrivals: the admin-uploaded picture with the category name over it. */
export default function CategoryTiles({ categories, onNavigate }: CategoryTilesProps) {
  // Every main category gets a tile except CHIX, which has its own section on the homepage.
  // CHIX stays in the navigation.
  const tiles = categories
    .filter((c) => c.slug !== CHIX_SLUG)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (tiles.length === 0) return null;

  return (
    <section className="px-4 pb-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onNavigate(cat.slug)}
            aria-label={`Browse ${cat.label}`}
            className="group relative w-full overflow-hidden rounded-sm text-left"
            style={{
              aspectRatio: '16 / 9',
              border: `1px solid ${hexToRgba(cat.accent, 0.35)}`,
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
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'brightness(0.7) saturate(1.1)' }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.9) 0%, rgba(10,10,11,0.15) 60%, transparent 100%)' }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p
                style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
                className="text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight"
              >
                {cat.label}
              </p>
              {cat.sublabel && (
                <p style={{ color: '#D0D0DA', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">
                  {cat.sublabel}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
