import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

import type { CategoryInfo, BrowseFilter, BrowseSort, FigureType } from '../data/products';
import { CHIX_SLUG, FIGURE_TYPES } from '../data/products';

const EXTRA_NAV_ITEMS = [
  { label: 'Pre-Orders', action: 'pre-order' },
  { label: 'New Arrivals', action: 'new-arrivals' },
];

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

type Listing = 'on-hand' | 'pre-order';

/** What is picked in a nav dropdown before "Show results". */
interface Pick {
  figureType: FigureType | null;
  listing: Listing | null;
  sort: BrowseSort;
}

const EMPTY_PICK: Pick = { figureType: null, listing: null, sort: 'relevance' };

interface HeaderProps {
  /** Shop categories, shown first in the menu. */
  categories: CategoryInfo[];
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  /** Opens a collection with the filters picked in the nav dropdown. */
  onBrowse: (filter: BrowseFilter) => void;
  cartCount: number;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        fontFamily: 'Inter, sans-serif',
        backgroundColor: active ? '#FF2D78' : '#141418',
        color: active ? '#FFFFFF' : '#A0A0AC',
        border: `1px solid ${active ? '#FF2D78' : '#222228'}`,
      }}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:text-[#F0F0F4]"
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-[11px] uppercase tracking-widest mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function Header({ categories, onSearch, onNavigate, onBrowse, cartCount }: HeaderProps) {
  const NAV_ITEMS = [...categories.map((c) => ({ label: c.label, action: c.slug })), ...EXTRA_NAV_ITEMS];
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [pick, setPick] = useState<Pick>(EMPTY_PICK);
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openItem = NAV_ITEMS.find((item) => item.action === openNav) ?? null;

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close the nav dropdown on a click outside the header, or on Escape.
  useEffect(() => {
    if (!openNav) return;
    function onMouseDown(e: MouseEvent) {
      if (!headerRef.current?.contains(e.target as Node)) setOpenNav(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenNav(null);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openNav]);

  function toggleNav(action: string) {
    if (openNav === action) {
      setOpenNav(null);
      return;
    }
    setPick(EMPTY_PICK);
    setOpenNav(action);
  }

  function showResults(action: string) {
    const isCollection = categories.some((c) => c.slug === action);
    onBrowse({
      collection: isCollection ? action : 'all',
      category: pick.listing ?? (action === 'pre-order' ? 'pre-order' : 'all'),
      figureType: action === CHIX_SLUG && pick.figureType ? pick.figureType : 'all',
      sort: action === 'new-arrivals' && pick.sort === 'relevance' ? 'newest' : pick.sort,
    });
    setOpenNav(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setSearchOpen(false);
    }
  }

  return (
    <header
      ref={headerRef}
      style={{ backgroundColor: 'rgba(10,10,11,0.95)', borderBottom: '1px solid #1A1A20' }}
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo: same picture as the favicon. The name stays visible on phones too
            (it only tucks away while the search box is open so the bar doesn't overflow). */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 flex-shrink-0 min-w-0"
          aria-label="Panda's Attic home"
        >
          <img
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 rounded-full flex-shrink-0"
          />
          <span
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
            className={`text-lg sm:text-xl font-700 tracking-tight whitespace-nowrap ${searchOpen ? 'hidden sm:block' : 'block'}`}
          >
            Panda's Attic
          </span>
        </button>

        {/* Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.action}
              onClick={() => toggleNav(item.action)}
              aria-expanded={openNav === item.action}
              style={{ color: openNav === item.action ? '#F0F0F4' : '#80808C', fontFamily: 'Inter, sans-serif' }}
              className="px-2.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap hover:text-[#F0F0F4] hover:bg-[#141418]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search figures, characters…"
                style={{
                  backgroundColor: '#141418',
                  border: '1px solid #222228',
                  color: '#F0F0F4',
                  fontFamily: 'Inter, sans-serif',
                }}
                className="w-48 sm:w-64 h-9 px-3 text-sm rounded-full outline-none focus:border-[#FF2D78] transition-colors placeholder:text-[#50505C]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ color: '#80808C' }}
                className="p-2 hover:text-[#F0F0F4] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{ color: '#80808C' }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#141418] hover:text-[#F0F0F4] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => onNavigate('cart')}
            style={{ color: '#80808C' }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#141418] hover:text-[#F0F0F4] transition-all relative"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2H4L5.5 10H13.5L15 5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="13.5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="13.5" r="1.5" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span
                style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-600 text-white flex items-center justify-center"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: '#80808C' }}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#141418] hover:text-[#F0F0F4] transition-all"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M14 4L4 14M4 4L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Desktop nav dropdown: the filters for the item that was clicked */}
      {openItem && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full z-50"
          style={{ backgroundColor: '#0D0D10', borderBottom: '1px solid #1A1A20', boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-end gap-x-10 gap-y-5">
            {openItem.action === CHIX_SLUG && (
              <Group title="Type">
                <Chip active={pick.figureType === null} onClick={() => setPick((p) => ({ ...p, figureType: null }))}>All</Chip>
                {FIGURE_TYPES.map((t) => (
                  <Chip key={t.value} active={pick.figureType === t.value} onClick={() => setPick((p) => ({ ...p, figureType: t.value }))}>
                    {t.label}
                  </Chip>
                ))}
              </Group>
            )}

            <Group title="Availability">
              <Chip
                active={pick.listing === 'on-hand'}
                onClick={() => setPick((p) => ({ ...p, listing: p.listing === 'on-hand' ? null : 'on-hand' }))}
              >
                On Hand
              </Chip>
              <Chip
                active={pick.listing === 'pre-order'}
                onClick={() => setPick((p) => ({ ...p, listing: p.listing === 'pre-order' ? null : 'pre-order' }))}
              >
                Pre-Order
              </Chip>
            </Group>

            <Group title="Sort">
              {SORT_OPTIONS.map((s) => (
                <Chip key={s.value} active={pick.sort === s.value} onClick={() => setPick((p) => ({ ...p, sort: s.value }))}>
                  {s.label}
                </Chip>
              ))}
            </Group>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => { onNavigate(openItem.action); setOpenNav(null); }}
                style={{ color: '#A0A0AC', border: '1px solid #222228', fontFamily: 'Inter, sans-serif' }}
                className="px-4 py-2 rounded-full text-sm font-medium hover:text-[#F0F0F4] transition-colors"
              >
                View all {openItem.label}
              </button>
              <button
                type="button"
                onClick={() => showResults(openItem.action)}
                style={{ background: '#FF2D78', fontFamily: 'Inter, sans-serif' }}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div
          style={{ backgroundColor: '#0D0D10', borderTop: '1px solid #1A1A20' }}
          className="lg:hidden px-4 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.action}
              onClick={() => { onNavigate(item.action); setMenuOpen(false); }}
              style={{ color: '#A0A0AC', fontFamily: 'Inter, sans-serif' }}
              className="text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-[#141418] hover:text-[#F0F0F4] transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
