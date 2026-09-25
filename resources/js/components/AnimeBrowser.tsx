import { useMemo, useState } from 'react';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface AnimeBrowserProps {
  products: Product[];
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
}

interface GroupTile {
  label: string;
  image: string;
  count: number;
}

function groupBy(products: Product[], key: 'series' | 'character'): GroupTile[] {
  const map = new Map<string, GroupTile>();
  for (const p of products) {
    const label = (p[key] || '').trim();
    if (!label) continue;
    const existing = map.get(label);
    if (existing) existing.count += 1;
    else map.set(label, { label, image: p.images[0], count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export default function AnimeBrowser({ products, onView, onAddToCart }: AnimeBrowserProps) {
  const [series, setSeries] = useState<string | null>(null);
  const [character, setCharacter] = useState<string | null>(null);

  const seriesTiles = useMemo(() => groupBy(products, 'series'), [products]);

  const seriesProducts = useMemo(
    () => (series ? products.filter((p) => p.series === series) : []),
    [products, series]
  );
  const characterTiles = useMemo(() => groupBy(seriesProducts, 'character'), [seriesProducts]);

  const figures = useMemo(
    () => (series && character ? seriesProducts.filter((p) => p.character === character) : []),
    [seriesProducts, series, character]
  );

  function Breadcrumbs() {
    return (
      <div
        className="flex items-center flex-wrap gap-1.5 mb-5"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}
      >
        <button
          onClick={() => { setSeries(null); setCharacter(null); }}
          style={{ color: series ? '#80808C' : '#F0F0F4', fontWeight: series ? 400 : 600 }}
          className="hover:text-white transition-colors"
        >
          All Anime
        </button>
        {series && (
          <>
            <span style={{ color: '#30303C' }}>/</span>
            <button
              onClick={() => setCharacter(null)}
              style={{ color: character ? '#80808C' : '#F0F0F4', fontWeight: character ? 400 : 600 }}
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
          <p style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', fontSize: 15 }} className="font-700 line-clamp-1">
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

  // Step 3 — figures for a specific character
  if (series && character) {
    return (
      <div>
        <Breadcrumbs />
        {figures.length === 0 ? (
          emptyText('No figures found for this character yet.')
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {figures.map((p) => (
              <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 2 — characters within a chosen anime
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
                key={t.label}
                tile={t}
                sublabel={t.count === 1 ? 'figure' : 'figures'}
                onClick={() => setCharacter(t.label)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 1 — top-level anime/series tiles
  return (
    <div>
      <Breadcrumbs />
      {seriesTiles.length === 0 ? (
        emptyText('No products yet.')
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {seriesTiles.map((t) => (
            <Tile
              key={t.label}
              tile={t}
              sublabel={t.count === 1 ? 'figure' : 'figures'}
              onClick={() => setSeries(t.label)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
