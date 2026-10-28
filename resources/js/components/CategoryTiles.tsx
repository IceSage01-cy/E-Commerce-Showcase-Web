import type { CategoryInfo } from '../data/products';
import { CHIX_SLUG } from '../data/products';
import { hexToRgba } from '../lib/color';

interface CategoryTilesProps {
  categories: CategoryInfo[];
  onNavigate: (page: string) => void;
}

/**
 * Wide category tiles under Japan New Arrivals: the admin-uploaded picture with the category name over it.
 * The admin can add and remove categories, so the layout follows the count and never leaves a tile alone in a row:
 * three tiles make one big tile beside two stacked ones, and any other odd count ends with a full-width tile.
 */
export default function CategoryTiles({ categories, onNavigate }: CategoryTilesProps) {
  // Every main category gets a tile except CHIX, which has its own section on the homepage.
  // CHIX stays in the navigation.
  const tiles = categories
    .filter((c) => c.slug !== CHIX_SLUG)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (tiles.length === 0) return null;

  const featured = tiles.length === 3; // big tile on the left, two stacked on the right (from tablet width up)
  const lastAlone = tiles.length % 2 === 1 && !featured; // 1, 5, 7... tiles: the last one spans the full width

  return (
    <section className="px-4 pb-16">
      <div
        className={`max-w-7xl mx-auto grid grid-cols-1 gap-3 ${
          featured ? 'md:grid-cols-2 md:grid-rows-2 md:h-[560px]' : 'sm:grid-cols-2'
        }`}
      >
        {tiles.map((cat, i) => {
          const isBig = featured && i === 0;
          const isWide = lastAlone && i === tiles.length - 1;
          const size = featured
            ? `aspect-[16/9] md:aspect-auto md:h-full ${isBig ? 'md:row-span-2' : ''}`
            : isWide
              ? 'aspect-[16/9] sm:col-span-2 sm:aspect-[21/9]'
              : 'aspect-[16/9]';

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onNavigate(cat.slug)}
              aria-label={`Browse ${cat.label}`}
              className={`group relative w-full overflow-hidden rounded-sm text-left ${size}`}
              style={{
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
                  className={`text-2xl font-bold uppercase tracking-tight leading-tight ${isBig ? 'sm:text-4xl' : 'sm:text-3xl'}`}
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
          );
        })}
      </div>
    </section>
  );
}
