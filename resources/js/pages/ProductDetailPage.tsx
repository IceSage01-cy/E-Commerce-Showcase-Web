import { useState } from 'react';
import type { Product } from '../data/products';
import { getStockStatus, formatPrice } from '../data/products';
import ProductCard from '../components/ProductCard';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
  onView: (id: string) => void;
  onAddToCart: (id: string) => void;
  products: Product[];
}

const stockColors = {
  'in-stock': { text: '#22C55E', bg: 'rgba(34,197,94,0.1)', label: 'In Stock' },
  'low-stock': { text: '#FB923C', bg: 'rgba(251,146,60,0.1)', label: 'Low Stock' },
  'sold-out': { text: '#606068', bg: 'rgba(96,96,104,0.1)', label: 'Sold Out' },
};

const categoryLabel = { 'on-hand': 'On Hand', 'pre-order': 'Pre-Order', 'new-release': 'New Release' };
const categoryColor = {
  'on-hand': { text: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  'pre-order': { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  'new-release': { text: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
};

export default function ProductDetailPage({ productId, onNavigate, onView, onAddToCart, products }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === productId);
  const [activeImage, setActiveImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p style={{ color: '#50505C', fontFamily: 'Outfit, sans-serif' }} className="text-6xl font-800 mb-4">404</p>
          <p style={{ color: '#80808C' }} className="mb-6">Product not found.</p>
          <button
            onClick={() => onNavigate('home')}
            style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
            className="px-6 py-2.5 rounded-full text-white font-600 text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const stockColor = stockColors[stockStatus];
  const catColor = categoryColor[product.category];
  const related = products.filter((p) => p.id !== product.id && (p.series === product.series || p.category === product.category)).slice(0, 4);

  function handleAddToCart() {
    onAddToCart(product!.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs" style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }}>
          <button onClick={() => onNavigate('home')} className="hover:text-[#80808C] transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate(product.category)} className="hover:text-[#80808C] transition-colors capitalize">
            {categoryLabel[product.category]}
          </button>
          <span>/</span>
          <span style={{ color: '#80808C' }} className="truncate max-w-[160px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Left: Image gallery */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
              onClick={() => setZoom(true)}
              style={{
                backgroundColor: '#141418',
                border: '1px solid #222228',
                borderRadius: '1rem',
                cursor: 'zoom-in',
                aspectRatio: '1 / 1',
              }}
              className="relative overflow-hidden"
            >
              <img
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div
                style={{ color: '#80808C', backgroundColor: 'rgba(20,20,24,0.7)', backdropFilter: 'blur(4px)' }}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      border: i === activeImage ? '2px solid #FF2D78' : '2px solid #222228',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      backgroundColor: '#141418',
                    }}
                    className="w-16 h-16 flex-shrink-0 transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col gap-5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  backgroundColor: catColor.bg,
                  color: catColor.text,
                  border: `1px solid ${catColor.border}`,
                  fontFamily: 'Outfit, sans-serif',
                }}
                className="px-3 py-1 rounded-full text-xs font-700 uppercase tracking-wider"
              >
                {categoryLabel[product.category]}
              </span>
              <span
                style={{
                  backgroundColor: stockColor.bg,
                  color: stockColor.text,
                  fontFamily: 'Inter, sans-serif',
                }}
                className="px-3 py-1 rounded-full text-xs font-600 flex items-center gap-1.5"
              >
                <span style={{ backgroundColor: stockColor.text }} className="w-1.5 h-1.5 rounded-full" />
                {stockStatus === 'low-stock' ? `Low Stock — ${product.stock} left` : stockColor.label}
              </span>
              <span
                style={{
                  backgroundColor: '#1E1E26',
                  color: '#80808C',
                  fontFamily: 'Inter, sans-serif',
                }}
                className="px-3 py-1 rounded-full text-xs font-500"
              >
                {product.condition}
              </span>
              {product.isFeatured && (
                <span
                  style={{
                    backgroundColor: 'rgba(167,139,250,0.12)',
                    color: '#A78BFA',
                    border: '1px solid rgba(167,139,250,0.25)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  className="px-3 py-1 rounded-full text-xs font-700 uppercase tracking-wider"
                >
                  Featured
                </span>
              )}
            </div>

            {/* Title & series */}
            <div>
              <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="font-500 uppercase tracking-wider mb-1">
                {product.series}
              </p>
              <h1
                style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 1.2 }}
                className="text-2xl sm:text-3xl font-800"
              >
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                style={{
                  color: product.salePrice ? '#FF2D78' : '#F0F0F4',
                  fontFamily: 'Outfit, sans-serif',
                }}
                className="text-3xl font-800"
              >
                {formatPrice(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <>
                  <span
                    style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }}
                    className="text-lg line-through"
                  >
                    {formatPrice(product.price)}
                  </span>
                  <span
                    style={{
                      backgroundColor: 'rgba(255,45,120,0.12)',
                      color: '#FF2D78',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-700"
                  >
                    {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Pre-order info */}
            {product.category === 'pre-order' && product.estimatedArrival && (
              <div
                style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.75rem' }}
                className="px-4 py-3 flex items-start gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M8 5V8.5L10 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
                <div>
                  <p style={{ color: '#F59E0B', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600">Pre-Order Item</p>
                  <p style={{ color: '#A07020', fontFamily: 'Inter, sans-serif' }} className="text-xs mt-0.5">
                    Estimated arrival: {product.estimatedArrival}. Payment collected upfront. Refundable if delayed beyond 90 days.
                  </p>
                </div>
              </div>
            )}

            {/* Specs */}
            <div
              style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.75rem' }}
              className="px-4 py-3 grid grid-cols-2 gap-3"
            >
              {[
                { label: 'Manufacturer', value: product.manufacturer },
                { label: 'Scale', value: product.scale || 'Non-scale' },
                { label: 'Character', value: product.character },
                { label: 'Condition', value: product.condition },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 10 }} className="uppercase tracking-wider font-500 mb-0.5">{label}</p>
                  <p style={{ color: '#B0B0BC', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="font-500">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <div
                style={{
                  color: '#80808C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  lineHeight: 1.7,
                  overflow: 'hidden',
                  maxHeight: descExpanded ? 'none' : '80px',
                }}
              >
                {product.description}
              </div>
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                style={{ color: '#FF2D78', fontFamily: 'Inter, sans-serif' }}
                className="text-xs font-600 mt-1 hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                {descExpanded ? 'Show less' : 'Read more'}
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: descExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-1">
              <button
                disabled={stockStatus === 'sold-out'}
                onClick={handleAddToCart}
                style={{
                  background: stockStatus === 'sold-out' ? '#222228' : added ? '#22C55E' : '#FF2D78',
                  color: stockStatus === 'sold-out' ? '#50505C' : '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'background 0.3s ease',
                  boxShadow: stockStatus === 'sold-out' ? 'none' : added ? '0 4px 20px rgba(34,197,94,0.3)' : '0 4px 20px rgba(255,45,120,0.3)',
                }}
                className="flex-1 py-3.5 rounded-full text-base font-700 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {stockStatus === 'sold-out'
                  ? 'Sold Out'
                  : added
                  ? '✓ Added!'
                  : product.category === 'pre-order'
                  ? 'Reserve Now'
                  : 'Add to Cart'}
              </button>
              <button
                style={{
                  backgroundColor: '#141418',
                  border: '1px solid #222228',
                  color: '#80808C',
                }}
                className="w-13 h-13 rounded-full flex items-center justify-center hover:border-[#333340] hover:text-[#F0F0F4] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.5 3.8 3 6 3C7.2 3 8.3 3.6 9 4.5C9.7 3.6 10.8 3 12 3C14.2 3 16 4.5 16 6.5C16 11 9 15.5 9 15.5Z" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div style={{ borderTop: '1px solid #1A1A20' }} className="pt-10">
              <h2
                style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
                className="text-xl font-700 mb-6"
              >
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} onView={onView} onAddToCart={onAddToCart} size="sm" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setZoom(false)}
        >
          <img
            src={product.images[activeImage]}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-xl"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
          <button
            style={{ color: '#80808C', backgroundColor: 'rgba(20,20,24,0.8)' }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile sticky CTA */}
      {stockStatus !== 'sold-out' && (
        <div
          style={{ backgroundColor: 'rgba(10,10,11,0.95)', borderTop: '1px solid #1A1A20', backdropFilter: 'blur(12px)' }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 lg:hidden"
        >
          <button
            onClick={handleAddToCart}
            style={{
              background: added ? '#22C55E' : '#FF2D78',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: added ? '0 4px 20px rgba(34,197,94,0.3)' : '0 4px 20px rgba(255,45,120,0.3)',
              transition: 'background 0.3s ease',
            }}
            className="w-full py-3.5 rounded-full text-white text-base font-700"
          >
            {added ? '✓ Added to Cart!' : product.category === 'pre-order' ? `Reserve — ${formatPrice(product.salePrice ?? product.price)}` : `Add to Cart — ${formatPrice(product.salePrice ?? product.price)}`}
          </button>
        </div>
      )}
    </div>
  );
}
