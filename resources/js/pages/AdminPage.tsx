import { useState, useMemo } from 'react';
import type { Product, Category, Condition } from '../data/products';
import { getStockStatus, formatPrice } from '../data/products';
import BannersTab, { type Banner, type BannerFormData } from '../components/BannersTab';
import ImageDropzone from '../components/ImageDropzone';

interface AdminPageProps {
  products: Product[];
  onAdd: (p: Omit<Product, 'id'>) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onNavigate: (page: string) => void;
  banners: Banner[];
  onAddBanner: (b: BannerFormData) => void;
  onEditBanner: (id: string, b: BannerFormData) => void;
  onDeleteBanner: (id: string) => void;
}

type Tab = 'dashboard' | 'products' | 'banners' | 'orders';

const CONDITIONS: Condition[] = ['New', 'Pre-owned', 'Loose', 'Sealed'];
const CATEGORIES: Category[] = ['on-hand', 'pre-order', 'new-release'];
const categoryLabel: Record<Category, string> = { 'on-hand': 'On Hand', 'pre-order': 'Pre-Order', 'new-release': 'New Release' };
const categoryColor: Record<Category, { text: string; bg: string }> = {
  'on-hand': { text: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'pre-order': { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'new-release': { text: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
};
const stockColors = {
  'in-stock': { text: '#22C55E', label: 'In Stock' },
  'low-stock': { text: '#FB923C', label: 'Low Stock' },
  'sold-out': { text: '#606068', label: 'Sold Out' },
};

const emptyForm = (): Omit<Product, 'id'> => ({
  name: '',
  series: '',
  character: '',
  price: 0,
  salePrice: undefined,
  images: [],
  category: 'on-hand',
  condition: 'New',
  stock: 0,
  isFeatured: false,
  dateAdded: new Date().toISOString().slice(0, 10),
  description: '',
  manufacturer: '',
  scale: '',
  estimatedArrival: '',
  releaseDate: '',
});

export default function AdminPage({ products, onAdd, onEdit, onDelete, onNavigate, banners, onAddBanner, onEditBanner, onDeleteBanner }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard stats
  const stats = useMemo(() => {
    const onHand = products.filter((p) => p.category === 'on-hand');
    const preOrder = products.filter((p) => p.category === 'pre-order');
    const lowStock = products.filter((p) => getStockStatus(p.stock) === 'low-stock');
    const soldOut = products.filter((p) => getStockStatus(p.stock) === 'sold-out');
    const featured = products.filter((p) => p.isFeatured);
    const catalogValue = products.reduce((sum, p) => sum + (p.salePrice ?? p.price) * p.stock, 0);
    return { total: products.length, onHand: onHand.length, preOrder: preOrder.length, lowStock: lowStock.length, soldOut: soldOut.length, featured: featured.length, catalogValue };
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q) || p.character.toLowerCase().includes(q));
  }, [products, search]);

  function openAdd() {
    setForm(emptyForm());
    setStep(0);
    setModal({ mode: 'add' });
  }
  function openEdit(p: Product) {
    const { id, ...rest } = p;
    setForm({ ...rest });
    setStep(0);
    setModal({ mode: 'edit', product: p });
  }
  function saveForm() {
    if (!form.name.trim() || !form.series.trim() || form.price <= 0) return;
    if (modal?.mode === 'edit' && modal.product) {
      onEdit({ id: modal.product.id, ...form });
    } else {
      onAdd(form);
    }
    setModal(null);
  }
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const STEPS = ['Basics', 'Photos', 'Pricing & Stock', 'Details'] as const;
  const step0Valid = form.name.trim() !== '' && form.series.trim() !== '';
  const step2Valid = form.price > 0;
  const canGoNext = step === 0 ? step0Valid : step === 2 ? step2Valid : true;

  const inputStyle = {
    backgroundColor: '#0D0D10',
    border: '1px solid #222228',
    color: '#F0F0F4',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
    transition: 'border-color 0.15s',
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      ),
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2H6L8 6H14L12 11H4L2 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <circle cx="5" cy="13.5" r="1.5" fill="currentColor" />
          <circle cx="11" cy="13.5" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M1.5 10.5L5.5 7L8.5 9.5L11 7L14.5 10" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <circle cx="5" cy="5.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 1.5H13L14.5 5.5V14.5H1.5V5.5L3 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M1.5 5.5H14.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M6 8.5L7.5 10L10 7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Admin topbar */}
      <div
        style={{ backgroundColor: '#0D0D10', borderBottom: '1px solid #1A1A20', height: 56 }}
        className="flex items-center px-4 gap-4 flex-shrink-0"
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ color: '#80808C' }}
          className="md:hidden w-8 h-8 flex items-center justify-center hover:text-[#F0F0F4] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div
            style={{ background: 'linear-gradient(135deg, #FF2D78, #A855F7)' }}
            className="w-6 h-6 rounded-md flex items-center justify-center"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 14 }} className="font-700">
            Pandas Attic
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,45,120,0.12)',
              color: '#FF2D78',
              border: '1px solid rgba(255,45,120,0.25)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 10,
            }}
            className="px-2 py-0.5 rounded-full font-700 uppercase tracking-wider"
          >
            Admin
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => onNavigate('home')}
          style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
          className="flex items-center gap-1.5 hover:text-[#F0F0F4] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Store
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          style={{
            backgroundColor: '#0D0D10',
            borderRight: '1px solid #1A1A20',
            width: 200,
            flexShrink: 0,
          }}
          className={`flex-col py-4 hidden md:flex`}
        >
          <nav className="flex flex-col gap-1 px-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  backgroundColor: tab === t.id ? 'rgba(255,45,120,0.1)' : 'transparent',
                  color: tab === t.id ? '#FF2D78' : '#80808C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  borderRadius: '0.5rem',
                  padding: '8px 12px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.15s',
                  border: tab === t.id ? '1px solid rgba(255,45,120,0.2)' : '1px solid transparent',
                  fontWeight: tab === t.id ? 600 : 400,
                }}
                className="hover:text-[#F0F0F4] hover:bg-[#141418]"
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-3">
            <div
              style={{
                backgroundColor: '#141418',
                border: '1px solid #222228',
                borderRadius: '0.625rem',
                padding: '10px 12px',
              }}
            >
              <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 10 }} className="uppercase tracking-wider font-500 mb-1">Total Products</p>
              <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 22 }} className="font-800">{stats.total}</p>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              style={{ backgroundColor: '#0D0D10', borderRight: '1px solid #1A1A20', width: 200, height: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-4 px-3 flex flex-col gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                    style={{
                      backgroundColor: tab === t.id ? 'rgba(255,45,120,0.1)' : 'transparent',
                      color: tab === t.id ? '#FF2D78' : '#80808C',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      borderRadius: '0.5rem',
                      padding: '8px 12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      border: 'none',
                      width: '100%',
                    }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="p-6 max-w-5xl">
              <div className="mb-6">
                <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Dashboard</h1>
                <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">Overview of your catalog and inventory.</p>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'Total Listings', value: stats.total, color: '#A78BFA', sub: 'All products' },
                  { label: 'On Hand', value: stats.onHand, color: '#22C55E', sub: 'Local stock' },
                  { label: 'Pre-Orders', value: stats.preOrder, color: '#F59E0B', sub: 'Japan sourced' },
                  { label: 'Low Stock', value: stats.lowStock, color: '#FB923C', sub: '≤ 3 units left', alert: stats.lowStock > 0 },
                  { label: 'Sold Out', value: stats.soldOut, color: '#606068', sub: '0 units' },
                  { label: 'Featured', value: stats.featured, color: '#FF2D78', sub: 'Pinned items' },
                ].map((k) => (
                  <div
                    key={k.label}
                    style={{
                      backgroundColor: '#141418',
                      border: k.alert ? `1px solid rgba(251,146,60,0.3)` : '1px solid #222228',
                      borderRadius: '0.875rem',
                      padding: '16px',
                    }}
                  >
                    <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="uppercase tracking-wider font-500 mb-1">{k.label}</p>
                    <p style={{ color: k.color, fontFamily: 'Outfit, sans-serif', fontSize: 32 }} className="font-800 leading-none">{k.value}</p>
                    <p style={{ color: '#40404C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="mt-1">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Catalog value */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255,45,120,0.08) 0%, rgba(168,85,247,0.08) 100%)',
                  border: '1px solid rgba(255,45,120,0.15)',
                  borderRadius: '0.875rem',
                  padding: '20px 24px',
                  marginBottom: 24,
                }}
              >
                <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="uppercase tracking-wider font-500 mb-1">Estimated Catalog Value (at current prices × stock)</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 36 }} className="font-800">{formatPrice(stats.catalogValue)}</p>
              </div>

              {/* Low stock alert table */}
              {stats.lowStock > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: '#FB923C' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2L13 12H1L7 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
                        <path d="M7 6V8.5M7 10.5V11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                      </svg>
                    </span>
                    <p style={{ color: '#FB923C', fontFamily: 'Outfit, sans-serif', fontSize: 13 }} className="font-600">Low Stock Alerts</p>
                  </div>
                  <div
                    style={{ backgroundColor: '#141418', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '0.75rem', overflow: 'hidden' }}
                  >
                    {products
                      .filter((p) => getStockStatus(p.stock) === 'low-stock')
                      .map((p, i, arr) => (
                        <div
                          key={p.id}
                          style={{ borderBottom: i < arr.length - 1 ? '1px solid #1A1A20' : 'none', padding: '10px 16px' }}
                          className="flex items-center justify-between gap-4"
                        >
                          <div>
                            <p style={{ color: '#F0F0F4', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="font-500">{p.name}</p>
                            <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>{p.series}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span style={{ color: '#FB923C', fontFamily: 'Outfit, sans-serif', fontSize: 15 }} className="font-700">{p.stock} left</span>
                            <button
                              onClick={() => { openEdit(p); setTab('products'); }}
                              style={{ color: '#FF2D78', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                              className="font-500 hover:opacity-80 transition-opacity"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Products</h1>
                  <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-0.5">{products.length} listings</p>
                </div>
                <button
                  onClick={openAdd}
                  style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 16px rgba(255,45,120,0.3)' }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-600 hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add Product
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ color: '#50505C', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, series, character…"
                  style={{ ...inputStyle, paddingLeft: 32 }}
                />
              </div>

              {/* Table */}
              <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.875rem', overflow: 'hidden' }}>
                {/* Table header */}
                <div
                  style={{
                    backgroundColor: '#111114',
                    borderBottom: '1px solid #1A1A20',
                    padding: '10px 16px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  {['Product', 'Category', 'Condition', 'Price', 'Stock', ''].map((h) => (
                    <p key={h} style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="uppercase tracking-wider font-500">
                      {h}
                    </p>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center">
                    <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>No products match your search.</p>
                  </div>
                ) : (
                  filteredProducts.map((p, i) => {
                    const ss = getStockStatus(p.stock);
                    const sc = stockColors[ss];
                    const cc = categoryColor[p.category];
                    return (
                      <div
                        key={p.id}
                        style={{
                          borderBottom: i < filteredProducts.length - 1 ? '1px solid #1A1A20' : 'none',
                          padding: '12px 16px',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) 80px 80px 80px',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        {/* Product */}
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            style={{ width: 40, height: 40, borderRadius: '0.375rem', objectFit: 'cover', backgroundColor: '#1A1A1F', flexShrink: 0 }}
                          />
                          <div className="min-w-0">
                            <p style={{ color: '#F0F0F4', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="font-500 truncate">{p.name}</p>
                            <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="truncate">{p.series}</p>
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <span
                            style={{
                              backgroundColor: cc.bg,
                              color: cc.text,
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: 10,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              fontWeight: 700,
                            }}
                          >
                            {categoryLabel[p.category]}
                          </span>
                        </div>

                        {/* Condition */}
                        <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>{p.condition}</p>

                        {/* Price */}
                        <div>
                          <p style={{ color: p.salePrice ? '#FF2D78' : '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 13 }} className="font-700">
                            {formatPrice(p.salePrice ?? p.price)}
                          </p>
                          {p.salePrice && (
                            <p style={{ color: '#40404C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="line-through">
                              {formatPrice(p.price)}
                            </p>
                          )}
                        </div>

                        {/* Stock */}
                        <div>
                          <p style={{ color: sc.text, fontFamily: 'Outfit, sans-serif', fontSize: 14 }} className="font-700">{p.stock}</p>
                          <p style={{ color: sc.text, fontFamily: 'Inter, sans-serif', fontSize: 10, opacity: 0.7 }}>{sc.label}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(p)}
                            style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', borderRadius: '0.375rem', width: 30, height: 30 }}
                            className="flex items-center justify-center hover:text-[#F0F0F4] hover:border-[#333340] transition-all"
                            title="Edit"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            style={{ color: '#606068', backgroundColor: '#1A1A20', border: '1px solid #222228', borderRadius: '0.375rem', width: 30, height: 30 }}
                            className="flex items-center justify-center hover:text-[#FF2D78] hover:border-[rgba(255,45,120,0.3)] transition-all"
                            title="Delete"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3H10M4 3V2H8V3M9 3L8.5 10H3.5L3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── BANNERS ── */}
          {tab === 'banners' && (
            <BannersTab
              banners={banners}
              onAdd={onAddBanner}
              onEdit={onEditBanner}
              onDelete={onDeleteBanner}
            />
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="p-6 max-w-2xl">
              <div className="mb-6">
                <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Orders</h1>
                <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">Customer orders and pre-order reservations.</p>
              </div>
              <div
                style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.875rem', padding: '48px 24px', textAlign: 'center' }}
              >
                <div style={{ color: '#222228', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 16H32M16 24H32M16 32H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={{ color: '#50505C', fontFamily: 'Outfit, sans-serif', fontSize: 16 }} className="font-700 mb-2">Orders module coming soon</p>
                <p style={{ color: '#30303C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="leading-relaxed max-w-sm mx-auto">
                  Order management will be available once the checkout flow is connected. For now, manage orders via Facebook Messenger or Shopee.
                </p>
                <div className="flex justify-center gap-2 mt-6">
                  {['Facebook', 'Shopee', 'GCash'].map((ch) => (
                    <span
                      key={ch}
                      style={{
                        backgroundColor: '#1A1A20',
                        color: '#80808C',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 11,
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: '1px solid #222228',
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div
            style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '1rem', width: '100%', maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: '1px solid #1A1A20', padding: '16px 20px' }} className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 17 }} className="font-700">
                {modal.mode === 'add' ? 'Add Product' : 'Edit Product'}
              </h2>
              <button
                onClick={() => setModal(null)}
                style={{ color: '#50505C', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem' }}
                className="hover:text-[#F0F0F4] hover:bg-[#1A1A20] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <div style={{ padding: '14px 20px 0' }} className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    style={{
                      width: '100%',
                      height: 4,
                      borderRadius: 9999,
                      backgroundColor: i <= step ? '#FF2D78' : '#1E1E26',
                      border: 'none',
                      cursor: i < step ? 'pointer' : 'default',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '6px 20px 0' }} className="flex items-center justify-between">
              <span style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 12 }} className="font-600">
                {step + 1}. {STEPS[step]}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', color: '#50505C', fontSize: 11 }}>
                Step {step + 1} of {STEPS.length}
              </span>
            </div>

            <div className="p-5 flex flex-col gap-4" style={{ minHeight: 280 }}>
              {step === 0 && (
                <>
                  <Field label="Product Name *">
                    <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Hatsune Miku DX Edition" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Series *">
                      <input style={inputStyle} value={form.series} onChange={(e) => set('series', e.target.value)} placeholder="e.g. Vocaloid" />
                    </Field>
                    <Field label="Character *">
                      <input style={inputStyle} value={form.character} onChange={(e) => set('character', e.target.value)} placeholder="e.g. Hatsune Miku" />
                    </Field>
                  </div>
                  <Field label="Manufacturer">
                    <input style={inputStyle} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} placeholder="Good Smile Co." />
                  </Field>
                </>
              )}

              {step === 1 && (
                <ImageDropzone
                  label="Photos"
                  images={form.images.filter(Boolean)}
                  onChange={(imgs) => set('images', imgs)}
                  multiple
                  folder="products"
                />
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Category *">
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={form.category}
                        onChange={(e) => set('category', e.target.value as Category)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{categoryLabel[c]}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Condition *">
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={form.condition}
                        onChange={(e) => set('condition', e.target.value as Condition)}
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price (₱) *">
                      <input
                        style={inputStyle}
                        type="number"
                        min={0}
                        value={form.price || ''}
                        onChange={(e) => set('price', Number(e.target.value))}
                        placeholder="3500"
                      />
                    </Field>
                    <Field label="Sale Price (₱) — optional">
                      <input
                        style={inputStyle}
                        type="number"
                        min={0}
                        value={form.salePrice ?? ''}
                        onChange={(e) => set('salePrice', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Leave blank if no sale"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Stock Qty *">
                      <input
                        style={inputStyle}
                        type="number"
                        min={0}
                        value={form.stock}
                        onChange={(e) => set('stock', Number(e.target.value))}
                        placeholder="0"
                      />
                    </Field>
                    <Field label="Scale">
                      <input style={inputStyle} value={form.scale ?? ''} onChange={(e) => set('scale', e.target.value)} placeholder="1/7" />
                    </Field>
                  </div>

                  {form.category === 'pre-order' && (
                    <Field label="Estimated Arrival">
                      <input style={inputStyle} value={form.estimatedArrival ?? ''} onChange={(e) => set('estimatedArrival', e.target.value)} placeholder="e.g. March 2027" />
                    </Field>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Description">
                    <textarea
                      style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Product details, features, included accessories…"
                    />
                  </Field>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set('isFeatured', !form.isFeatured)}
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: form.isFeatured ? '#FF2D78' : '#222228',
                        border: 'none',
                        position: 'relative',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: form.isFeatured ? 21 : 3,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          transition: 'left 0.2s',
                          display: 'block',
                        }}
                      />
                    </button>
                    <span style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Mark as Featured product</span>
                  </div>

                  {/* Review summary */}
                  <div style={{ backgroundColor: '#0D0D10', border: '1px solid #1A1A20', borderRadius: '0.625rem', padding: '12px 14px' }} className="flex flex-col gap-1.5">
                    <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 12 }} className="font-600 mb-0.5">Ready to save</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#80808C', fontSize: 12 }}>
                      {form.name || '(untitled)'} — {form.series || '(no series)'} · {formatPrice(form.price)}{form.salePrice ? ` (sale ${formatPrice(form.salePrice)})` : ''} · {form.stock} in stock · {form.images.filter(Boolean).length} photo{form.images.filter(Boolean).length === 1 ? '' : 's'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #1A1A20', padding: '14px 20px' }} className="flex items-center justify-between gap-3">
              <button
                onClick={() => (step === 0 ? setModal(null) : setStep(step - 1))}
                style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
                className="font-500 hover:text-[#F0F0F4] transition-colors"
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => canGoNext && setStep(step + 1)}
                  disabled={!canGoNext}
                  style={{
                    background: '#FF2D78',
                    color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 13,
                    borderRadius: 9999,
                    padding: '8px 24px',
                    opacity: canGoNext ? 1 : 0.4,
                    border: 'none',
                    cursor: canGoNext ? 'pointer' : 'not-allowed',
                  }}
                  className="font-700 hover:opacity-90 transition-opacity"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={saveForm}
                  disabled={!step0Valid || !step2Valid}
                  style={{
                    background: '#FF2D78',
                    color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 13,
                    borderRadius: 9999,
                    padding: '8px 24px',
                    opacity: (!step0Valid || !step2Valid) ? 0.4 : 1,
                    border: 'none',
                    cursor: (!step0Valid || !step2Valid) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(255,45,120,0.3)',
                  }}
                  className="font-700 hover:opacity-90 transition-opacity"
                >
                  {modal.mode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{ backgroundColor: '#111114', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '1rem', padding: '24px', width: '100%', maxWidth: 380, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ color: '#FF2D78', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 10V17M16 21V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 16, marginBottom: 8 }} className="font-700">Delete product?</p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#50505C', fontSize: 13, marginBottom: 20 }}>
              "{products.find((p) => p.id === deleteConfirm)?.name}" will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                style={{ background: 'rgba(255,45,120,0.15)', color: '#FF2D78', border: '1px solid rgba(255,45,120,0.3)', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
                className="font-700 hover:bg-[rgba(255,45,120,0.25)] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">
        {label}
      </label>
      {children}
    </div>
  );
}
