import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  cartCount: number;
}

export default function Header({ onSearch, onNavigate, cartCount }: HeaderProps) {
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
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <div
            style={{ background: 'linear-gradient(135deg, #FF2D78, #A855F7)' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" fillOpacity="0.9" />
              <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
            className="text-xl font-700 tracking-tight hidden sm:block"
          >
            Panda's Attic
          </span>
        </button>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'On Hand', action: 'on-hand' },
            { label: 'Pre-Orders', action: 'pre-order' },
            { label: 'New Arrivals', action: 'new-arrivals' },
          ].map((item) => (
            <button
              key={item.action}
              onClick={() => onNavigate(item.action)}
              style={{ color: '#80808C', fontFamily: 'Inter, sans-serif' }}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:text-[#F0F0F4] hover:bg-[#141418]"
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
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#141418] hover:text-[#F0F0F4] transition-all"
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
          className="md:hidden px-4 py-3 flex flex-col gap-1"
        >
          {[
            { label: 'On Hand', action: 'on-hand' },
            { label: 'Pre-Orders', action: 'pre-order' },
            { label: 'New Arrivals', action: 'new-arrivals' },
          ].map((item) => (
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
