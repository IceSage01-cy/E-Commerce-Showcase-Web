import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import ProductCard from './components/ProductCard';
import CartPage from './pages/CartPage';
import type { Product } from './data/products';

type Route =
  | { type: 'home' }
  | { type: 'product'; id: string }
  | { type: 'search'; query: string; category?: string }
  | { type: 'category'; category: string }
  | { type: 'new-arrivals' }
  | { type: 'cart' };

export default function App() {
  const [route, setRoute] = useState<Route>({ type: 'home' });
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);
  const [cartToast, setCartToast] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/products').then((res) => {
      setProducts(res.data);
    }).finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  function navigate(page: string) {
    if (page === 'home') setRoute({ type: 'home' });
    else if (page === 'cart') setRoute({ type: 'cart' });
    else if (page === 'new-arrivals') setRoute({ type: 'new-arrivals' });
    else if (['on-hand', 'pre-order', 'new-release'].includes(page)) {
      setRoute({ type: 'category', category: page });
    } else {
      setRoute({ type: 'home' });
    }
  }

  function viewProduct(id: string) {
    setRoute({ type: 'product', id });
  }

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

  function addToCart(id: string) {
    setCart((prev) => [...prev, id]);
    const p = products.find((x) => x.id === id);
    setCartToast(p?.name ?? 'Item');
    setTimeout(() => setCartToast(null), 3000);
  }

  const sortedNew = [...products].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh' }}>
      <Header onSearch={(q) => handleSearch(q)} onNavigate={navigate} cartCount={cart.length} />

      <main style={{ paddingBottom: 16 }}>
        {productsLoading && route.type === 'home' && products.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: '50vh', color: 'var(--color-text-muted)', fontFamily: 'Karla, sans-serif', fontSize: 14 }}>
            Setting the table…
          </div>
        ) : route.type === 'home' && (
          <HomePage products={products} onView={viewProduct} onNavigate={navigate} onAddToCart={addToCart} />
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
            onView={viewProduct}
            onAddToCart={addToCart}
            onSearch={handleSearch}
            products={products}
          />
        )}
        {route.type === 'category' && (
          <SearchPage
            initialQuery=""
            initialCategory={route.category}
            onView={viewProduct}
            onAddToCart={addToCart}
            onSearch={handleSearch}
            products={products}
          />
        )}
        {route.type === 'new-arrivals' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <p style={{ color: '#22C55E', fontFamily: 'Outfit, sans-serif', fontSize: 11 }} className="font-700 uppercase tracking-widest mb-1">Just Added</p>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-3xl font-800">New Arrivals</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {sortedNew.map((p) => (
                <ProductCard key={p.id} product={p} onView={viewProduct} onAddToCart={addToCart} size="sm" />
              ))}
            </div>
          </div>
        )}
        {route.type === 'cart' && (
          <CartPage
            cart={cart}
            products={products}
            onNavigate={navigate}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
          />
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
