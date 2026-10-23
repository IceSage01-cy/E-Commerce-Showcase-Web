import { useMemo, useState } from 'react';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import { usePaged, ShowMoreButton } from './ShowMore';

/** An optional first level that splits a collection, e.g. Prize / Scale for CHIX or by scale for Scale Figures. */
export interface BrowseSplit {
  key: 'figureType' | 'scale';
  labelOf: (value: string) => string;
}

interface AnimeBrowserProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  split?: BrowseSplit;
  /** Breadcrumb text for the top level, e.g. "All Anime". */
  rootLabel?: string;
  /** Start inside this anime (the anime page): the series step is skipped and the top crumb goes back to its characters. */
  fixedSeries?: string;
  /** Series name => cover picture. A series with a cover shows it on its tile instead of a figure's photo. */
  covers?: Record<string, string>;
}

interface GroupTile {
  value: string;
  label: string;
  image: string;
  count: number;
}

function groupBy(products: Product[], key: keyof Product, labelOf: (value: string) => string = (v) => v): GroupTile[] {
  const map = new Map<string, GroupTile>();
  for (const p of products) {
    const value = String(p[key] ?? '').trim();
    if (!value) continue;
    const existing = map.get(value);
    if (existing) existing.count += 1;
    else map.set(value, { value, label: labelOf(value), image: p.images[0], count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Drill-down browser: [split] > series (anime) > character > figures.
 * The split level is only shown when a `split` is given (CHIX and Scale Figures).
 */
export default function AnimeBrowser({ products, onView, onAddToCart, split, rootLabel = 'All Anime', fixedSeries, covers }: AnimeBrowserProps) {
  const [splitValue, setSplitValue] = useState<string | null>(null);
  const [series, setSeries] = useState<string | null>(fixedSeries ?? null);
  const [character, setCharacter] = useState<string | null>(null);

  const splitTiles = useMemo(
    () => (split ? groupBy(products, split.key, split.labelOf) : []),
    [products, split]
  );

  // Everything below the split level only sees the products of the chosen split value.
  const scoped = useMemo(
    () => (split && splitValue ? products.filter((p) => String(p[split.key] ?? '') === splitValue) : products),
    [products, split, splitValue]
  );

  const seriesTiles = useMemo(() => groupBy(scoped, 'series'), [scoped]);

  const seriesProducts = useMemo(
    () => (series ? scoped.filter((p) => p.series === series) : []),
    [scoped, series]
  );
  const characterTiles = useMemo(() => groupBy(seriesProducts, 'character'), [seriesProducts]);

  const figures = useMemo(
    () => (series && character ? seriesProducts.filter((p) => p.character === character) : []),
    [seriesProducts, series, character]
  );
  const pagedFigures = usePaged(figures);

  const splitLabel = split && splitValue ? split.labelOf(splitValue) : null;

  function Breadcrumbs() {
    const crumbStyle = (active: boolean) => ({ color: active ? '#F0F0F4' : '#80808C', fontWeight: active ? 600 : 400 });
    return (
      <div
        className="flex items-center flex-wrap gap-1.5 mb-5"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}
      >
        <button
          onClick={() => { setSplitValue(null); setSeries(fixedSeries ?? null); setCharacter(null); }}
          style={crumbStyle(!splitValue && !series)}
          className="hover:text-white transition-colors"
        >
          {rootLabel}
        </button>
        {splitLabel && (
          <>
            <span style={{ color: '#30303C' }}>/</span>
            <button
              onClick={() => { setSeries(null); setCharacter(null); }}
              style={crumbStyle(!series)}
              className="hover:text-white transition-colors"
            >
              {splitLabel}
            </button>
          </>
        )}
        {series && !fixedSeries && (
          <>
            <span style={{ color: '#30303C' }}>/</span>
            <button
              onClick={() => setCharacter(null)}
              style={crumbStyle(!character)}
              className="hover:text-white transition-colors"
            >
              {series}
            </button>
          </>
        )}
        {character && (
          <>
            <span style={{ color: '#30303C' }}>/</span>
            <span style={{ color: '#F0F0F4', fontWeight: 600 }}>{character}</span>
          </>
        )}
      </div>
    );
  }

  function Tile({ tile, sublabel, onClick }: { tile: GroupTile; sublabel: string; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="relative overflow-hidden rounded-2xl text-left group"
        style={{ aspectRatio: '4 / 3', border: '1px solid #222228', backgroundColor: '#141418' }}
      >
        <img
          src={tile.image}
          alt={tile.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', fontSize: 15 }} className="font-semibold line-clamp-1">
            {tile.label}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#C8C8D0', fontSize: 11 }}>
            {tile.count} {sublabel}
          </p>
        </div>
      </button>
    );
  }

  const emptyText = (msg: string) => (
    <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-sm py-8 text-center">
      {msg}
    </p>
  );

  // Last step — figures for a specific character
  if (series && character) {
    return (
      <div>
        <Breadcrumbs />
        {figures.length === 0 ? (
          emptyText('No figures found for this character yet.')
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {pagedFigures.shown.map((p) => (
                <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
              ))}
            </div>
            <ShowMoreButton remaining={pagedFigures.remaining} onClick={pagedFigures.more} />
          </>
        )}
      </div>
    );
  }

  // Characters within a chosen anime
  if (series) {
    return (
      <div>
        <Breadcrumbs />
        {characterTiles.length === 0 ? (
          emptyText('No characters found for this anime yet.')
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {characterTiles.map((t) => (
              <Tile
                key={t.value}
                tile={t}
                sublabel={t.count === 1 ? 'figure' : 'figures'}
                onClick={() => setCharacter(t.value)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Split level (Prize / Scale, or by scale), when there is one and nothing is chosen yet
  if (split && !splitValue) {
    return (
      <div>
        <Breadcrumbs />
        {splitTiles.length === 0 ? (
          emptyText('No products yet.')
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {splitTiles.map((t) => (
              <Tile
                key={t.value}
                tile={t}
                sublabel={t.count === 1 ? 'figure' : 'figures'}
                onClick={() => setSplitValue(t.value)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Anime / series tiles
  return (
    <div>
      <Breadcrumbs />
      {seriesTiles.length === 0 ? (
        emptyText('No products yet.')
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {seriesTiles.map((t) => (
            <Tile
              key={t.value}
              tile={{ ...t, image: covers?.[t.value] ?? t.image }}
              sublabel={t.count === 1 ? 'figure' : 'figures'}
              onClick={() => setSeries(t.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
