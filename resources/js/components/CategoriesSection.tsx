interface CategoriesSectionProps {
  onNavigate: (cat: string) => void;
}

const categories = [
  {
    id: 'on-hand',
    label: 'Pinas On Hand',
    sublabel: 'Ready to Ship',
    description: 'Local stock — order today, dispatched within 1–3 business days from Manila.',
    accent: '#22C55E',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.2)',
    image: 'https://images.unsplash.com/photo-1777730039398-830cddd1cf15?w=600&h=400&fit=crop&auto=format',
    badge: 'Ships Fast',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10H17M10 3V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 6L10 2L18 6V14L10 18L2 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'pre-order',
    label: 'Japan Pre-Order',
    sublabel: 'Source Direct from Japan',
    description: 'Exclusive sourcing from Japanese retailers — reserve now, arrive in 3–6 months.',
    accent: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    image: 'https://images.unsplash.com/photo-1762376622511-0c1d97912bf5?w=600&h=400&fit=crop&auto=format',
    badge: 'Pre-Order',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'new-release',
    label: 'New Release',
    sublabel: 'Monthly Rotation',
    description: 'Fresh monthly drops featuring newly announced figures and limited collaborations.',
    accent: '#A78BFA',
    accentBg: 'rgba(167,139,250,0.08)',
    accentBorder: 'rgba(167,139,250,0.2)',
    image: null,
    badge: 'Coming Soon',
    isEmpty: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function CategoriesSection({ onNavigate }: CategoriesSectionProps) {
  return (
    <section className="py-12 px-4" style={{ borderTop: '1px solid #1A1A20' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p
            style={{ color: '#80808C', fontFamily: 'Outfit, sans-serif', fontSize: 11 }}
            className="font-700 uppercase tracking-widest mb-1"
          >
            Browse By
          </p>
          <h2
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
            className="text-2xl sm:text-3xl font-800"
          >
            Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => !cat.isEmpty && onNavigate(cat.id)}
              style={{
                backgroundColor: '#141418',
                border: `1px solid ${cat.accentBorder}`,
                borderRadius: '0.875rem',
                cursor: cat.isEmpty ? 'default' : 'pointer',
                textAlign: 'left',
              }}
              className="group overflow-hidden relative transition-all hover:border-opacity-60"
            >
              {/* Image area */}
              <div
                className="relative overflow-hidden"
                style={{ height: 160, backgroundColor: '#1A1A1F' }}
              >
                {cat.image ? (
                  <>
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: 'brightness(0.5) saturate(1.1)' }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(20,20,24,0.95) 0%, transparent 60%)' }}
                    />
                  </>
                ) : (
                  /* Empty state placeholder */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div
                      style={{ color: cat.accent, opacity: 0.3 }}
                      className="w-16 h-16 rounded-2xl border-2 border-current flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 6V26M6 16H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p
                      style={{ color: cat.accent, opacity: 0.4, fontFamily: 'Outfit, sans-serif' }}
                      className="text-xs font-600 uppercase tracking-wider"
                    >
                      Coming Monthly
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: cat.accent }}>{cat.icon}</span>
                      <span
                        style={{
                          backgroundColor: cat.accentBg,
                          color: cat.accent,
                          border: `1px solid ${cat.accentBorder}`,
                          fontFamily: 'Outfit, sans-serif',
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-700 uppercase tracking-wider"
                      >
                        {cat.badge}
                      </span>
                    </div>
                    <h3
                      style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
                      className="text-base font-700"
                    >
                      {cat.label}
                    </h3>
                    <p
                      style={{ color: '#80808C', fontFamily: 'Inter, sans-serif' }}
                      className="text-xs font-500 mt-0.5"
                    >
                      {cat.sublabel}
                    </p>
                  </div>
                  {!cat.isEmpty && (
                    <div
                      style={{ color: cat.accent, opacity: 0 }}
                      className="flex-shrink-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 9H14M10 5L14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <p
                  style={{ color: '#606068', fontFamily: 'Inter, sans-serif' }}
                  className="text-xs font-400 leading-relaxed"
                >
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
