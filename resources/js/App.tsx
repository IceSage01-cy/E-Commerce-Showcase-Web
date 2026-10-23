import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
// Loaded on demand: the cart page pulls in the receipt image library, which the rest of the shop doesn't need.
const CartPage = lazy(() => import('./pages/CartPage'));
import ChixPage from './pages/ChixPage';
import NendoroidsPage from './pages/NendoroidsPage';
import JapanNewArrivalsPage from './pages/JapanNewArrivalsPage';
import PinasOnHandPage from './pages/PinasOnHandPage';
import AnimeBrowser from './components/AnimeBrowser';
import SectionHeading from './components/SectionHeading';
import type { Product, CategoryInfo } from './data/products';
import { FALLBACK_CATEGORIES, CHIX_SLUG } from './data/products';

type Route =
  | { type: 'home' }
  | { type: 'product'; id: string }
  | { type: 'search'; query: string; category?: string }
  | { type: 'category'; category: string }
  | { type: 'collection'; collection: string }
  | { type: 'chix' }
  | { type: 'nendoroids' }
  | { type: 'anime'; series: string }
  | { type: 'new-arrivals' }
  | { type: 'japan-new-arrivals' }
  | { type: 'cart' };

export default function App() {
  const [route, setRoute] = useState<Route>({ type: 'home' });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  // Series name => cover picture URL (only series that have one).
  const [animeCovers, setAnimeCovers] = useState<Record<string, string>>({});
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    axios.get('/api/products').then((res) => {
      setProducts(res.data);
    }).finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    // Main categories + their admin-managed background pictures. The page works without them (fallback tiles).
    axios.get('/api/categories').then((res) => setCategories(res.data)).catch(() => {});
    axios.get('/api/anime-covers').then((res) => setAnimeCovers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  function navigate(page: string) {
    if (page === 'home') setRoute({ type: 'home' });
    else if (page === 'cart') setRoute({ type: 'cart' });
    else if (page === CHIX_SLUG) setRoute({ type: 'chix' });
    else if (page === 'new-arrivals') setRoute({ type: 'new-arrivals' });
    else if (page === 'japan-new-arrivals') setRoute({ type: 'japan-new-arrivals' });
    else if (page === 'nendoroids') setRoute({ type: 'nendoroids' });
    else if (products.some((p) => p.series === page)) setRoute({ type: 'anime', series: page });
    else if (navCategories.some((c) => c.slug === page)) setRoute({ type: 'collection', collection: page });
    else if (['on-hand', 'pre-order', 'new-release'].includes(page)) {
      setRoute({ type: 'category', category: page });
    } else {
      setRoute({ type: 'home' });
    }
  }

  const viewProduct = useCallback((id: string) => {
    setRoute({ type: 'product', id });
  }, []);

  function handleSearch(query: string, category?: string) {
    setRoute({ type: 'search', query, category });
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const idx = prev.lastIndexOf(id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }

  function clearCart() {
    setCart([]);
  }

  // Stable identity so memoised <ProductCard>s don't re-render on every cart/toast change.
  const addToCart = useCallback((id: string) => {
    const product = products.find((x) => x.id === id);
    if (product && !product.inStock) return; // out-of-stock items can never enter the cart
    setCart((prev) => [...prev, id]);
    setCartToast(product?.name ?? 'Item');
    // Reset the timer so a quick second add doesn't get its toast cut short by the first one.
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setCartToast(null), 3000);
  }, [products]);

  // Menu + routing follow the categories managed in the admin panel (defaults until they load).
  const navCategories = useMemo(
    () => (categories.length ? categories : FALLBACK_CATEGORIES).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );


  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh' }}>
      <Header
        categories={navCategories}
        onSearch={(q) => handleSearch(q)}
        onNavigate={navigate}
        cartCount={cart.length}
        current={
          route.type === 'collection' ? route.collection
            : route.type === 'chix' ? CHIX_SLUG
            : route.type === 'category' ? route.category
            : route.type === 'new-arrivals' ? 'new-arrivals'
            : null
        }
      />

      <main style={{ paddingBottom: 16 }}>
        {productsLoading && route.type === 'home' && products.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: '50vh', color: 'var(--color-text-muted)', fontFamily: 'Karla, sans-serif', fontSize: 14 }}>
            Setting the table…
          </div>
        ) : route.type === 'home' && (
          <HomePage products={products} categories={navCategories} covers={animeCovers} onView={viewProduct} onNavigate={navigate} onAddToCart={addToCart} />
        )}
        {route.type === 'product' && (
          <ProductDetailPage
            productId={route.id}
            onNavigate={navigate}
            onView={viewProduct}
            onAddToCart={addToCart}
            products={products}
          />
        )}
        {route.type === 'search' && (
          <SearchPage
            initialQuery={route.query}
            initialCategory={route.category}
            categories={navCategories}
            onView={viewProduct}
            onAddToCart={addToCart}
            products={products}
          />
        )}
        {route.type === 'category' && (
          <SearchPage
            key={`category-${route.category}`}
            initialQuery=""
            initialCategory={route.category}
            categories={navCategories}
            onView={viewProduct}
            onAddToCart={addToCart}
            products={products}
          />
        )}
        {route.type === 'collection' && (
          <SearchPage
            key={`collection-${route.collection}`}
            initialQuery=""
            initialCollection={route.collection}
            categories={navCategories}
            onView={viewProduct}
            onAddToCart={addToCart}
            products={products}
          />
        )}
        {route.type === 'chix' && (
          <ChixPage
            products={products}
            categories={navCategories}
            onNavigate={navigate}
            onView={viewProduct}
            onAddToCart={addToCart}
          />
        )}
        {route.type === 'nendoroids' && (
          <NendoroidsPage products={products} onView={viewProduct} onAddToCart={addToCart} />
        )}
        {route.type === 'anime' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* The series cover comes first, above its characters. */}
            {animeCovers[route.series] && (
              <div className="relative w-full overflow-hidden rounded-2xl mb-8" style={{ aspectRatio: '21 / 9', border: '1px solid #222228' }}>
                <img src={animeCovers[route.series]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.9) 0%, rgba(10,10,11,0.1) 60%, transparent 100%)' }}
                />
                <p
                  style={{ fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
                  className="absolute bottom-4 left-5 text-3xl sm:text-5xl font-bold uppercase tracking-tight"
                >
                  {route.series}
                </p>
              </div>
            )}
            <SectionHeading kicker="Anime" title={route.series} accent="#FF2D78" />
            <AnimeBrowser
              key={route.series}
              products={products.filter((p) => p.series === route.series)}
              onView={viewProduct}
              onAddToCart={addToCart}
              rootLabel={route.series}
              fixedSeries={route.series}
              covers={animeCovers}
            />
          </div>
        )}
        {route.type === 'japan-new-arrivals' && (
          <JapanNewArrivalsPage products={products} covers={animeCovers} onView={viewProduct} onAddToCart={addToCart} />
        )}
        {route.type === 'new-arrivals' && (
          <PinasOnHandPage products={products} covers={animeCovers} onView={viewProduct} onAddToCart={addToCart} />
        )}
        {route.type === 'cart' && (
          <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20" />}>
            <CartPage
              cart={cart}
              products={products}
              onNavigate={navigate}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
            />
          </Suspense>
        )}
      </main>

      <Footer />

      {/* Cart toast */}
      {cartToast && (
        <div
          style={{
            backgroundColor: '#141418',
            border: '1px solid rgba(34,197,94,0.25)',
            borderLeft: '3px solid #22C55E',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            padding: '12px 16px',
            borderRadius: '0.75rem',
            width: 'calc(100% - 32px)',
            maxWidth: 320,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ color: '#22C55E', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
              <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ color: '#B0B0BC', fontSize: 13 }}>
            <span style={{ color: '#F0F0F4', fontWeight: 600 }}>{cartToast}</span> added to cart
          </span>
        </div>
      )}
    </div>
  );
}
