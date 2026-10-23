import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

import type { CategoryInfo } from '../data/products';
import { CHIX_SLUG } from '../data/products';

const PRIMARY_PINK = '#FF2D78';

const EXTRA_NAV_ITEMS = [
  { label: 'Pre-Orders', action: 'pre-order' },
  { label: 'Pinas On Hand', action: 'new-arrivals' },
];

interface HeaderProps {
  /** Shop categories, shown first in the menu. */
  categories: CategoryInfo[];
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  cartCount: number;
  /** Nav action of the page being shown; that item stays highlighted. */
  current?: string | null;
}

export default function Header({ categories, onSearch, onNavigate, cartCount, current = null }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const NAV_ITEMS = [...categories.map((c) => ({ label: c.label, action: c.slug })), ...EXTRA_NAV_ITEMS];

  /** Colour of the current nav item: CHIX Figures keeps its green, every other item is pink. */
  function navColors(action: string): Record<string, string> {
    const accent = action === CHIX_SLUG ? (categories.find((c) => c.slug === action)?.accent ?? PRIMARY_PINK) : PRIMARY_PINK;
    // Light text on pink, dark text on the bright green CHIX accent so it stays readable.
    const text = accent.toUpperCase() === '#22C55E' ? '#04140A' : '#FFFFFF';
    return { '--nav-accent': accent, '--nav-text': text };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    // Full window width, so the bar stays solid over the full-width hero as the page scrolls. Its content stays in the 1280px column.
    <header
      style={{ backgroundColor: 'rgba(10,10,11,0.95)', borderBottom: '1px solid #1A1A20', marginLeft: 'calc(50% - 50vw)' }}
      className="sticky top-0 z-50 w-screen backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 flex-shrink-0 min-w-0"
          aria-label="Panda's Attic home"
        >
          <img src="/logo.png" alt="" width={36} height={36} className="w-9 h-9 rounded-full flex-shrink-0" />
          <span
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
            className="text-lg sm:text-xl font-700 tracking-tight whitespace-nowrap"
          >
            Panda's Attic
          </span>
        </button>

        {/* Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.action}
              onClick={() => onNavigate(item.action)}
              style={{
                ...navColors(item.action),
                color: item.action === current ? navColors(item.action)['--nav-text'] : '#80808C',
                backgroundColor: item.action === current ? navColors(item.action)['--nav-accent'] : undefined,
                fontFamily: 'Inter, sans-serif',
              } as CSSProperties}
              className="px-2.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => onNavigate('cart')}
            aria-label="Cart"
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
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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

      {/* Search bar, always under the navigation */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#50505C' }}
            >
              <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search figures, series, characters…"
              aria-label="Search figures"
              style={{ backgroundColor: '#141418', border: '1px solid #222228', color: '#F0F0F4', fontFamily: 'Inter, sans-serif' }}
              className="w-full h-10 pl-10 pr-4 text-sm rounded-full outline-none focus:border-[#FF2D78] transition-colors placeholder:text-[#50505C]"
            />
          </div>
          <button
            type="submit"
            style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif' }}
            className="h-10 px-5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Search
          </button>
        </form>
      </div>

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
