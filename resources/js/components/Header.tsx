import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';

import type { CategoryInfo } from '../data/products';
import { CHIX_SLUG } from '../data/products';

const PRIMARY_PINK = '#FF2D78';

const EXTRA_NAV_ITEMS = [
  { label: 'Pre-Orders', action: 'pre-order' },
  { label: 'New Arrivals', action: 'new-arrivals' },
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
  const NAV_ITEMS = [...categories.map((c) => ({ label: c.label, action: c.slug })), ...EXTRA_NAV_ITEMS];

  /** Colour of the current nav item: CHIX Figures keeps its green, every other item is pink. */
  function navColors(action: string): Record<string, string> {
    const accent = action === CHIX_SLUG ? (categories.find((c) => c.slug === action)?.accent ?? PRIMARY_PINK) : PRIMARY_PINK;
    // Light text on pink, dark text on the bright green CHIX accent so it stays readable.
    const text = accent.toUpperCase() === '#22C55E' ? '#04140A' : '#FFFFFF';
    return { '--nav-accent': accent, '--nav-text': text };
  }
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setSearchOpen(false);
    }
  }

  return (
    <header
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
