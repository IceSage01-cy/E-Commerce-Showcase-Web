import { useState, useMemo, useRef } from 'react';
import type { Product, Category, Condition, Collection, CategoryInfo, BulkAction } from '../data/products';
import { getStockStyle, formatPrice, CONDITIONS, collectionLabel, normalizeCondition, CHIX_SLUG, SCALE_SLUG, FIGURE_TYPES } from '../data/products';
import BannersTab, { type Banner, type BannerFormData } from '../components/BannersTab';
import CategoriesTab, { type CategoryFormData } from '../components/CategoriesTab';
import AnimeCoversTab, { type AnimeCover } from '../components/AnimeCoversTab';
import ImageDropzone from '../components/ImageDropzone';

interface AdminPageProps {
  products: Product[];
  /** Resolves to null when saved, or to the message to show in the form when the server rejected it. */
  onAdd: (p: Omit<Product, 'id'>) => Promise<string | null>;
  onEdit: (p: Product) => Promise<string | null>;
  onDelete: (id: string) => void;
  onToggleStock: (id: string, inStock: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onBulk: (ids: string[], action: BulkAction) => Promise<boolean>;
  onNavigate: (page: string) => void;
  categories: CategoryInfo[];
  onAddCategory: (data: CategoryFormData) => Promise<boolean>;
  onEditCategory: (id: string, data: CategoryFormData) => Promise<boolean>;
  onDeleteCategory: (id: string, moveTo?: string) => Promise<boolean>;
  banners: Banner[];
  onAddBanner: (b: BannerFormData) => void;
  onEditBanner: (id: string, b: BannerFormData) => void;
  onDeleteBanner: (id: string) => void;
  animeCovers: AnimeCover[];
  onSaveAnimeCover: (series: string, image: string | null) => Promise<string | null>;
}

type Tab = 'dashboard' | 'products' | 'categories' | 'banners' | 'anime' | 'orders';

/** Listing type = how the item is sold. (The main storefront category is `collection`.) */
const CATEGORIES: Category[] = ['on-hand', 'pre-order', 'new-release'];
const categoryLabel: Record<Category, string> = { 'on-hand': 'On Hand', 'pre-order': 'Pre-Order', 'new-release': 'New Release' };
const categoryColor: Record<Category, { text: string; bg: string }> = {
  'on-hand': { text: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'pre-order': { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'new-release': { text: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
};

const COLS = '28px minmax(0,2.2fr) minmax(0,1.3fr) 64px 84px 116px 104px 72px';

const emptyForm = (collection: Collection = ''): Omit<Product, 'id'> => ({
  name: '',
  series: '',
  character: '',
  price: 0,
  salePrice: undefined,
  images: [],
  category: 'on-hand',
  collection,
  figureType: null,
  condition: 'MIB',
  inStock: true,
  isFeatured: false,
  isNendoroid: false,
  dateAdded: new Date().toISOString().slice(0, 10),
  description: '',
  manufacturer: '',
  scale: '',
  estimatedArrival: '',
  releaseDate: '',
});

export default function AdminPage({
  products, onAdd, onEdit, onDelete, onToggleStock, onToggleFeatured, onBulk, onNavigate,
  categories, onAddCategory, onEditCategory, onDeleteCategory, banners, onAddBanner, onEditBanner, onDeleteBanner,
  animeCovers, onSaveAnimeCover,
}: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | 'bulk' | null>(null);
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [figureFilter, setFigureFilter] = useState<'all' | 'prize' | 'scale'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Multi-select for bulk actions
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const lastClicked = useRef<number | null>(null);

  // Dashboard stats
  const stats = useMemo(() => {
    const onHand = products.filter((p) => p.category === 'on-hand');
    const preOrder = products.filter((p) => p.category === 'pre-order');
    const featured = products.filter((p) => p.isFeatured);
    const outOfStock = products.filter((p) => !p.inStock);
    return {
      total: products.length,
      onHand: onHand.length,
      preOrder: preOrder.length,
      inStock: products.length - outOfStock.length,
      outOfStock,
      featured: featured.length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (collectionFilter !== 'all' && p.collection !== collectionFilter) return false;
      if (figureFilter !== 'all' && p.figureType !== figureFilter) return false;
      if (featuredFilter === 'featured' && !p.isFeatured) return false;
      if (featuredFilter === 'not-featured' && p.isFeatured) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q) || p.character.toLowerCase().includes(q);
    });
  }, [products, search, collectionFilter, featuredFilter, figureFilter]);

  // Form suggestions: the series that already exist, and the characters of the series typed so far.
  // The storefront groups on the exact text, so reusing these spellings keeps products under one tile.
  const seriesOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.series.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [products]
  );
  const characterOptions = useMemo(() => {
    const series = form.series.trim().toLowerCase();
    if (!series) return [];
    const names = products.filter((p) => p.series.trim().toLowerCase() === series).map((p) => p.character.trim());
    return Array.from(new Set(names.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [products, form.series]);
  // A typed value that differs from an existing one only by letter case would become a separate tile.
  const seriesTyped = form.series.trim();
  const seriesNearMatch = seriesTyped && !seriesOptions.includes(seriesTyped)
    ? seriesOptions.find((s) => s.toLowerCase() === seriesTyped.toLowerCase())
    : undefined;
  const characterTyped = form.character.trim();
  const characterNearMatch = characterTyped && !characterOptions.includes(characterTyped)
    ? characterOptions.find((c) => c.toLowerCase() === characterTyped.toLowerCase())
    : undefined;

  // Only count ticks for products that still exist (a delete elsewhere can't leave a phantom selection).
  const selectedIds = useMemo(() => products.filter((p) => selected.has(p.id)).map((p) => p.id), [products, selected]);
  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selected.has(p.id));
  const someSelected = filteredProducts.some((p) => selected.has(p.id));

  function toggleSelect(id: string, index: number, shift: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shift && lastClicked.current !== null) {
        // Shift-click: tick (or untick) everything between the last click and this one.
        const [from, to] = [lastClicked.current, index].sort((a, b) => a - b);
        const turnOn = !prev.has(id);
        for (let i = from; i <= to; i++) {
          const pid = filteredProducts[i]?.id;
          if (!pid) continue;
          if (turnOn) next.add(pid); else next.delete(pid);
        }
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    lastClicked.current = index;
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) filteredProducts.forEach((p) => next.delete(p.id));
      else filteredProducts.forEach((p) => next.add(p.id));
      return next;
    });
  }

  async function runBulk(action: BulkAction) {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    const ok = await onBulk(selectedIds, action);
    setBulkBusy(false);
    if (ok) setSelected(new Set());
  }

  function openAdd() {
    // Pre-select the category being filtered on, otherwise the first one.
    setForm(emptyForm(categories.find((c) => c.slug === collectionFilter)?.slug ?? categories[0]?.slug));
    setModal({ mode: 'add' });
  }
  function openEdit(p: Product) {
    const { id, ...rest } = p;
    setForm({ ...rest, condition: normalizeCondition(rest.condition) });
    setModal({ mode: 'edit', product: p });
  }

  const missing = [
    !form.name.trim() && 'name',
    !form.series.trim() && 'series',
    !(form.price > 0) && 'price',
    form.collection === CHIX_SLUG && !form.figureType && 'CHIX figure type',
    form.images.filter(Boolean).length === 0 && 'at least one photo',
  ].filter(Boolean) as string[];

  async function saveForm() {
    if (missing.length > 0 || saving) return;
    setSaving(true);
    setFormError(null);
    const error = modal?.mode === 'edit' && modal.product
      ? await onEdit({ id: modal.product.id, ...form })
      : await onAdd(form);
    setSaving(false);
    // If the server rejected it, stay open with everything typed and say why.
    if (error) setFormError(error);
    else setModal(null);
  }
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Chips and filters follow the categories set in Admin -> Categories.
  const collectionOptions = categories.map((c) => ({ slug: c.slug, label: c.label }));

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
      id: 'categories',
      label: 'Categories',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="1.5" y="9" width="13" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
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
      id: 'anime',
      label: 'Anime covers',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M1.5 9.5L5 6.5L8 9L10.5 7L14.5 10" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
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
          <img src="/logo.png" alt="" width={28} height={28} className="w-7 h-7 rounded-full flex-shrink-0" />
          <span style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 14 }} className="font-700">
            Panda's Attic
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

          {/* Dashboard */}
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
                  { label: 'In Stock', value: stats.inStock, color: '#22C55E', sub: 'Available to buy' },
                  { label: 'Out of Stock', value: stats.outOfStock.length, color: '#80808C', sub: 'Hidden from buying', alert: stats.outOfStock.length > 0 },
                  { label: 'Japan New Arrivals', value: stats.featured, color: '#FF2D78', sub: 'Shown on the homepage' },
                ].map((k) => (
                  <div
                    key={k.label}
                    style={{
                      backgroundColor: '#141418',
                      border: k.alert ? '1px solid rgba(128,128,140,0.35)' : '1px solid #222228',
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

              {/* Out-of-stock list with one-click restock */}
              {stats.outOfStock.length > 0 && (
                <div>
                  <p style={{ color: '#80808C', fontFamily: 'Outfit, sans-serif', fontSize: 13 }} className="font-600 mb-3">Out of Stock</p>
                  <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.75rem', overflow: 'hidden' }}>
                    {stats.outOfStock.map((p, i, arr) => (
                      <div
                        key={p.id}
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid #1A1A20' : 'none', padding: '10px 16px' }}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p style={{ color: '#F0F0F4', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="font-500 truncate">{p.name}</p>
                          <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="truncate">{p.series}</p>
                        </div>
                        <button
                          onClick={() => onToggleStock(p.id, true)}
                          style={{ color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 9999, padding: '4px 12px' }}
                          className="font-600 hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                          Mark In Stock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {tab === 'products' && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Products</h1>
                  <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-0.5">
                    {filteredProducts.length === products.length
                      ? `${products.length} listings`
                      : `${filteredProducts.length} of ${products.length} listings`}
                    {' · most recently changed first'}
                  </p>
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

              {/* Search + filters */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
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
                <select
                  value={collectionFilter}
                  onChange={(e) => setCollectionFilter(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
                  aria-label="Filter by category"
                >
                  <option value="all">All categories</option>
                  {collectionOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={figureFilter}
                  onChange={(e) => setFigureFilter(e.target.value as typeof figureFilter)}
                  style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
                  aria-label="Filter by CHIX figure type"
                >
                  <option value="all">CHIX type: any</option>
                  <option value="prize">CHIX: Prize</option>
                  <option value="scale">CHIX: Scale</option>
                </select>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value as typeof featuredFilter)}
                  style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
                  aria-label="Filter by Japan New Arrivals"
                >
                  <option value="all">Japan New: any</option>
                  <option value="featured">Japan New: on</option>
                  <option value="not-featured">Japan New: off</option>
                </select>
              </div>

              {/* Bulk action bar: appears as soon as something is ticked */}
              {selectedIds.length > 0 && (
                <div
                  style={{
                    position: 'sticky',
                    top: 8,
                    zIndex: 20,
                    backgroundColor: '#17171C',
                    border: '1px solid rgba(255,45,120,0.35)',
                    borderRadius: '0.75rem',
                    padding: '10px 12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  className="flex flex-wrap items-center gap-2 mb-3"
                >
                  <span style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 13 }} className="font-700 mr-1">
                    {selectedIds.length} selected
                  </span>
                  <BulkButton disabled={bulkBusy} tone="pink" onClick={() => runBulk('feature')}>Add to Japan New Arrivals</BulkButton>
                  <BulkButton disabled={bulkBusy} onClick={() => runBulk('unfeature')}>Remove from Japan New Arrivals</BulkButton>
                  <BulkButton disabled={bulkBusy} tone="green" onClick={() => runBulk('in_stock')}>In Stock</BulkButton>
                  <BulkButton disabled={bulkBusy} onClick={() => runBulk('out_of_stock')}>Out of Stock</BulkButton>
                  <BulkButton disabled={bulkBusy} tone="danger" onClick={() => setDeleteConfirm('bulk')}>Delete</BulkButton>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                    className="hover:text-[#F0F0F4] transition-colors px-2"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Table (scrolls sideways on narrow screens) */}
              <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.875rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 1020 }}>
                    {/* Table header */}
                    <div
                      style={{
                        backgroundColor: '#111114',
                        borderBottom: '1px solid #1A1A20',
                        padding: '10px 16px',
                        display: 'grid',
                        gridTemplateColumns: COLS,
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={toggleSelectAll}
                        aria-label="Select all listed products"
                        style={{ width: 16, height: 16, accentColor: '#FF2D78', cursor: 'pointer' }}
                      />
                      {['Product', 'Category', 'Condition', 'Price', 'Availability', 'Japan New', ''].map((h, i) => (
                        <p key={h + i} style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="uppercase tracking-wider font-500">
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
                        const sc = getStockStyle(p.inStock);
                        const cc = categoryColor[p.category];
                        const isSel = selected.has(p.id);
                        return (
                          <div
                            key={p.id}
                            style={{
                              borderBottom: i < filteredProducts.length - 1 ? '1px solid #1A1A20' : 'none',
                              padding: '12px 16px',
                              display: 'grid',
                              gridTemplateColumns: COLS,
                              gap: 12,
                              alignItems: 'center',
                              backgroundColor: isSel ? 'rgba(255,45,120,0.06)' : 'transparent',
                            }}
                          >
                            {/* Select (shift-click to select a range) */}
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => {}}
                              onClick={(e) => toggleSelect(p.id, i, e.shiftKey)}
                              aria-label={`Select ${p.name}`}
                              style={{ width: 16, height: 16, accentColor: '#FF2D78', cursor: 'pointer' }}
                            />

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

                            {/* Category (main category + listing type) */}
                            <div className="min-w-0">
                              <p style={{ color: '#C8C8D2', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="truncate">{collectionLabel(p.collection, categories)}{p.figureType ? ` · ${p.figureType === 'prize' ? 'Prize' : 'Scale'}` : ''}</p>
                              <span
                                style={{
                                  backgroundColor: cc.bg,
                                  color: cc.text,
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: 10,
                                  padding: '1px 7px',
                                  borderRadius: 9999,
                                  fontWeight: 700,
                                  display: 'inline-block',
                                  marginTop: 3,
                                }}
                              >
                                {categoryLabel[p.category]}
                              </span>
                            </div>

                            {/* Condition */}
                            <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="font-600">{p.condition}</p>

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

                            {/* Availability: one-click toggle */}
                            <div>
                              <button
                                onClick={() => onToggleStock(p.id, !p.inStock)}
                                title={p.inStock ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                                aria-pressed={p.inStock}
                                style={{
                                  color: sc.text,
                                  backgroundColor: sc.bg,
                                  border: `1px solid ${p.inStock ? 'rgba(34,197,94,0.3)' : '#2A2A32'}`,
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: 11,
                                  padding: '5px 10px',
                                  borderRadius: 9999,
                                  whiteSpace: 'nowrap',
                                }}
                                className="font-700 flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all"
                              >
                                <span style={{ backgroundColor: sc.text }} className="w-1.5 h-1.5 rounded-full inline-block" />
                                {sc.label}
                              </button>
                            </div>

                            {/* Japan New Arrivals: one-click toggle */}
                            <div>
                              <button
                                onClick={() => onToggleFeatured(p.id, !p.isFeatured)}
                                title={p.isFeatured ? 'Shown in Japan New Arrivals. Click to remove' : 'Click to add to Japan New Arrivals'}
                                aria-pressed={p.isFeatured}
                                style={{
                                  color: p.isFeatured ? '#FF2D78' : '#50505C',
                                  backgroundColor: p.isFeatured ? 'rgba(255,45,120,0.12)' : '#0D0D10',
                                  border: `1px solid ${p.isFeatured ? 'rgba(255,45,120,0.35)' : '#222228'}`,
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: 11,
                                  padding: '5px 10px',
                                  borderRadius: 9999,
                                  whiteSpace: 'nowrap',
                                }}
                                className="font-700 flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all"
                              >
                                <svg width="11" height="11" viewBox="0 0 20 20" fill={p.isFeatured ? 'currentColor' : 'none'}>
                                  <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                </svg>
                                {p.isFeatured ? 'Featured' : 'Feature'}
                              </button>
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
              </div>
            </div>
          )}

          {/* Categories */}
          {/* Kept mounted (hidden when not open) so an unsaved draft survives switching tabs. */}
          <div style={{ display: tab === 'categories' ? undefined : 'none' }}>
            <CategoriesTab categories={categories} products={products} onAdd={onAddCategory} onEdit={onEditCategory} onDelete={onDeleteCategory} />
          </div>

          {/* Banners */}
          <div style={{ display: tab === 'banners' ? undefined : 'none' }}>
            <BannersTab
              banners={banners}
              categories={categories}
              onAdd={onAddBanner}
              onEdit={onEditBanner}
              onDelete={onDeleteBanner}
            />
          </div>

          {/* Anime covers */}
          {tab === 'anime' && <AnimeCoversTab covers={animeCovers} onSave={onSaveAnimeCover} />}

          {/* Orders */}
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

      {/* Add / Edit Modal: everything on one page, nothing to click "Next" through */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-3 sm:px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && !saving && setModal(null)}
        >
          <div
            style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '1rem', width: '100%', maxWidth: 680 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: '1px solid #1A1A20', padding: '16px 20px' }} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 17 }} className="font-700">
                  {modal.mode === 'add' ? 'Add Product' : 'Edit Product'}
                </h2>
                {modal.mode === 'edit' && (
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#50505C', fontSize: 12 }} className="truncate">{modal.product?.name}</p>
                )}
              </div>
              <button
                onClick={() => !saving && setModal(null)}
                style={{ color: '#50505C', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem' }}
                className="hover:text-[#F0F0F4] hover:bg-[#1A1A20] transition-all flex-shrink-0"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-6">
              {/* Basics */}
              <FormSection title="Basics">
                <Field label="Product Name *">
                  <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Hatsune Miku DX Edition" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Series *">
                    <input
                      style={inputStyle}
                      value={form.series}
                      onChange={(e) => set('series', e.target.value)}
                      placeholder="e.g. Vocaloid"
                      list="series-options"
                      autoComplete="off"
                    />
                    <datalist id="series-options">
                      {seriesOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                    {seriesNearMatch && (
                      <button
                        type="button"
                        onClick={() => set('series', seriesNearMatch)}
                        style={{ color: '#F59E0B', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                        className="mt-1 text-left hover:opacity-80"
                      >
                        Did you mean “{seriesNearMatch}”? Click to use it (names are case-sensitive).
                      </button>
                    )}
                  </Field>
                  <Field label="Character">
                    <input
                      style={inputStyle}
                      value={form.character}
                      onChange={(e) => set('character', e.target.value)}
                      placeholder="e.g. Hatsune Miku"
                      list="character-options"
                      autoComplete="off"
                    />
                    <datalist id="character-options">
                      {characterOptions.map((c) => <option key={c} value={c} />)}
                    </datalist>
                    {characterNearMatch && (
                      <button
                        type="button"
                        onClick={() => set('character', characterNearMatch)}
                        style={{ color: '#F59E0B', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                        className="mt-1 text-left hover:opacity-80"
                      >
                        Did you mean “{characterNearMatch}”? Click to use it (names are case-sensitive).
                      </button>
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Manufacturer">
                    <input style={inputStyle} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} placeholder="Good Smile Co." />
                  </Field>
                  <Field label="Scale">
                    <input style={inputStyle} value={form.scale ?? ''} onChange={(e) => set('scale', e.target.value)} placeholder="1/7" />
                  </Field>
                </div>
              </FormSection>

              {/* Where it lives + status */}
              <FormSection title="Condition">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  {form.category === 'pre-order' && (
                    <Field label="Estimated Arrival">
                      <input style={inputStyle} value={form.estimatedArrival ?? ''} onChange={(e) => set('estimatedArrival', e.target.value)} placeholder="e.g. March 2027" />
                    </Field>
                  )}
                </div>
              </FormSection>

              {/* Pricing */}
              <FormSection title="Pricing & Stock">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Field label="Sale Price (₱), optional">
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
                <Field label="Availability *">
                  <div className="flex gap-2">
                    {([true, false] as const).map((val) => {
                      const st = getStockStyle(val);
                      const active = form.inStock === val;
                      return (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => set('inStock', val)}
                          style={{
                            flex: 1,
                            color: active ? st.text : '#50505C',
                            backgroundColor: active ? st.bg : '#0D0D10',
                            border: `1px solid ${active ? (val ? 'rgba(34,197,94,0.4)' : '#3A3A44') : '#222228'}`,
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 12,
                            borderRadius: '0.5rem',
                            padding: '8px 10px',
                          }}
                          className="font-700 transition-all"
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('isFeatured', !form.isFeatured)}
                    aria-pressed={form.isFeatured}
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
                  <span style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Show in Japan New Arrivals</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('isNendoroid', !form.isNendoroid)}
                    aria-pressed={form.isNendoroid}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: form.isNendoroid ? '#FF2D78' : '#222228',
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
                        left: form.isNendoroid ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        transition: 'left 0.2s',
                        display: 'block',
                      }}
                    />
                  </button>
                  <span style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Nendoroid line (shows in the Nendoroids section)</span>
                </div>
              </FormSection>

              {/* Photos */}
              <FormSection title="Photos">
                <ImageDropzone
                  label=""
                  images={form.images.filter(Boolean)}
                  onChange={(imgs) => set('images', imgs)}
                  multiple
                  folder="products"
                />

                {/* One-tap labels: choosing one files the item under that category automatically. */}
                <div>
                  <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, marginBottom: 6 }} className="uppercase tracking-wider font-500">
                    Label: category *
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {collectionOptions.map((c) => (
                      <LabelChip key={c.slug} active={form.collection === c.slug} onClick={() => setForm((prev) => ({ ...prev, collection: c.slug, figureType: c.slug === SCALE_SLUG ? null : prev.figureType }))}>
                        {c.label}
                      </LabelChip>
                    ))}
                  </div>
                </div>
                {form.collection !== SCALE_SLUG && (
                  <div>
                    <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, marginBottom: 6 }} className="uppercase tracking-wider font-500">
                      Label: Prize / Scale {form.collection === CHIX_SLUG ? '* (required for CHIX)' : '(optional, click again to clear)'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {FIGURE_TYPES.map((t) => (
                        <LabelChip
                          key={t.value}
                          active={form.figureType === t.value}
                          onClick={() => set('figureType', form.figureType === t.value ? null : t.value)}
                        >
                          {/* Short names here, so they aren't confused with the "Scale Figures" collection. */}
                          {t.value === 'prize' ? 'Prize type' : 'Scale type'}
                        </LabelChip>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, marginBottom: 6 }} className="uppercase tracking-wider font-500">
                    Label: listing type *
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <LabelChip key={c} active={form.category === c} onClick={() => set('category', c)}>
                        {categoryLabel[c]}
                      </LabelChip>
                    ))}
                  </div>
                </div>
              </FormSection>

              {/* Description */}
              <FormSection title="Description">
                <textarea
                  style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Product details, features, included accessories…"
                />
              </FormSection>
            </div>

            {/* Footer: always visible, one click saves everything */}
            <div
              style={{ borderTop: '1px solid #1A1A20', padding: '12px 20px', position: 'sticky', bottom: 0, backgroundColor: '#111114', borderRadius: '0 0 1rem 1rem' }}
              className="flex items-center justify-between gap-3"
            >
              <p
                role={formError ? 'alert' : undefined}
                style={{ color: formError ? '#F87171' : '#FF2D78', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                className="min-w-0"
              >
                {formError ?? (missing.length > 0 ? `Still needed: ${missing.join(', ')}` : '')}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setModal(null)}
                  disabled={saving}
                  style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
                  className="font-500 hover:text-[#F0F0F4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveForm}
                  disabled={missing.length > 0 || saving}
                  style={{
                    background: '#FF2D78',
                    color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 13,
                    borderRadius: 9999,
                    padding: '8px 24px',
                    opacity: missing.length > 0 || saving ? 0.4 : 1,
                    border: 'none',
                    cursor: missing.length > 0 || saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(255,45,120,0.3)',
                  }}
                  className="font-700 hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Saving…' : modal.mode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm (single product or the whole selection) */}
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
            <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 16, marginBottom: 8 }} className="font-700">
              {deleteConfirm === 'bulk' ? `Delete ${selectedIds.length} products?` : 'Delete product?'}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#50505C', fontSize: 13, marginBottom: 20 }}>
              {deleteConfirm === 'bulk'
                ? 'The selected products will be permanently removed.'
                : `"${products.find((p) => p.id === deleteConfirm)?.name}" will be permanently removed.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = deleteConfirm;
                  setDeleteConfirm(null);
                  if (target === 'bulk') runBulk('delete');
                  else onDelete(target);
                }}
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
      {label && (
        <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 13, borderBottom: '1px solid #1A1A20', paddingBottom: 6 }} className="font-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

function LabelChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        color: active ? '#fff' : '#B0B0BC',
        backgroundColor: active ? '#FF2D78' : '#0D0D10',
        border: `1px solid ${active ? '#FF2D78' : '#2A2A32'}`,
        fontFamily: 'Outfit, sans-serif',
        fontSize: 13,
        borderRadius: 9999,
        padding: '7px 16px',
        boxShadow: active ? '0 4px 12px rgba(255,45,120,0.3)' : 'none',
      }}
      className="font-600 hover:border-[#FF2D78] transition-all"
    >
      {children}
    </button>
  );
}

type BulkTone = 'default' | 'pink' | 'green' | 'danger';

function BulkButton({ children, onClick, disabled, tone = 'default' }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: BulkTone }) {
  const tones: Record<BulkTone, { c: string; bg: string; b: string }> = {
    default: { c: '#C8C8D2', bg: '#1A1A20', b: '#2A2A32' },
    pink: { c: '#FF2D78', bg: 'rgba(255,45,120,0.12)', b: 'rgba(255,45,120,0.35)' },
    green: { c: '#22C55E', bg: 'rgba(34,197,94,0.1)', b: 'rgba(34,197,94,0.3)' },
    danger: { c: '#FF6B6B', bg: 'rgba(255,80,80,0.08)', b: 'rgba(255,80,80,0.3)' },
  };
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        color: t.c,
        backgroundColor: t.bg,
        border: `1px solid ${t.b}`,
        fontFamily: 'Outfit, sans-serif',
        fontSize: 12,
        borderRadius: 9999,
        padding: '5px 12px',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'wait' : 'pointer',
        whiteSpace: 'nowrap',
      }}
      className="font-700 hover:opacity-80 active:scale-95 transition-all"
    >
      {children}
    </button>
  );
}
