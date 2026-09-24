import { useState } from 'react';
import type { Product } from '../data/products';
import { getStockStatus, formatPrice } from '../data/products';

interface ProductCardProps {
  product: Product;
  onView: (id: string) => void;
  onAddToCart?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const categoryLabel = { 'on-hand': 'On Hand', 'pre-order': 'Pre-Order', 'new-release': 'New Release' };
const categoryColor = {
  'on-hand': { text: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  'pre-order': { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  'new-release': { text: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
};
const stockColors = {
  'in-stock': { text: '#22C55E', label: 'In Stock' },
  'low-stock': { text: '#FB923C', label: 'Low Stock' },
  'sold-out': { text: '#606068', label: 'Sold Out' },
};

export default function ProductCard({ product, onView, onAddToCart, size = 'md' }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const stockStatus = getStockStatus(product.stock);
  const catColor = categoryColor[product.category];
  const stockColor = stockColors[stockStatus];

  return (
    <div
      onClick={() => onView(product.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#141418',
        border: hovered ? '1px solid #333340' : '1px solid #222228',
        borderRadius: '0.875rem',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
      }}
      className="flex flex-col overflow-hidden group"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          aspectRatio: '1 / 1',
          backgroundColor: '#1A1A1F',
        }}
      >
        {!imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: '#30303C' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="15" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 28L13 20L19 26L25 20L36 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span
              style={{
                backgroundColor: 'rgba(167,139,250,0.18)',
                color: '#A78BFA',
                border: '1px solid rgba(167,139,250,0.3)',
                fontFamily: 'Outfit, sans-serif',
              }}
              className="px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider"
            >
              Featured
            </span>
          )}
          {product.salePrice && (
            <span
              style={{
                backgroundColor: 'rgba(255,45,120,0.18)',
                color: '#FF2D78',
                border: '1px solid rgba(255,45,120,0.3)',
                fontFamily: 'Outfit, sans-serif',
              }}
              className="px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider"
            >
              Sale
            </span>
          )}
        </div>

        {/* Category badge top-right */}
        <div className="absolute top-2 right-2">
          <span
            style={{
              backgroundColor: catColor.bg,
              color: catColor.text,
              border: `1px solid ${catColor.border}`,
              fontFamily: 'Outfit, sans-serif',
            }}
            className="px-2 py-0.5 rounded-full text-[10px] font-600 uppercase tracking-wider"
          >
            {categoryLabel[product.category]}
          </span>
        </div>

        {/* Quick add overlay */}
        {stockStatus !== 'sold-out' && onAddToCart && (
          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-3 transition-all duration-200"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)' }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
              style={{
                background: '#FF2D78',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 4px 16px rgba(255,45,120,0.4)',
              }}
              className="px-5 py-2 rounded-full text-xs font-600 text-white transition-all hover:opacity-90 active:scale-95"
            >
              {product.category === 'pre-order' ? 'Pre-Order' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <div>
          <p
            style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
            className="font-500 uppercase tracking-wider mb-0.5"
          >
            {product.series}
          </p>
          <h3
            style={{
              color: '#F0F0F4',
              fontFamily: 'Outfit, sans-serif',
              fontSize: size === 'lg' ? 15 : 13,
              lineHeight: 1.3,
            }}
            className="font-600 line-clamp-2"
          >
            {product.name}
          </h3>
        </div>

        {/* Condition + Stock */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            style={{
              backgroundColor: '#1E1E26',
              color: '#80808C',
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
            }}
            className="px-2 py-0.5 rounded-full font-500"
          >
            {product.condition}
          </span>
          <span
            style={{ color: stockColor.text, fontFamily: 'Inter, sans-serif', fontSize: 10 }}
            className="font-500 flex items-center gap-1"
          >
            <span
              style={{ backgroundColor: stockColor.text }}
              className="w-1.5 h-1.5 rounded-full inline-block"
            />
            {stockStatus === 'low-stock' ? `Low Stock (${product.stock} left)` : stockColor.label}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span
            style={{
              color: product.salePrice ? '#FF2D78' : '#F0F0F4',
              fontFamily: 'Outfit, sans-serif',
              fontSize: size === 'lg' ? 17 : 15,
            }}
            className="font-700"
          >
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.salePrice && (
            <span
              style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
              className="line-through font-400"
            >
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.category === 'pre-order' && product.estimatedArrival && (
          <p
            style={{ color: '#F59E0B', fontFamily: 'Inter, sans-serif', fontSize: 10 }}
            className="font-500"
          >
            Est. arrival: {product.estimatedArrival}
          </p>
        )}
      </div>
    </div>
  );
}
