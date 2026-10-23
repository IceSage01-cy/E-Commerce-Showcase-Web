import type { CategoryInfo } from '../data/products';

// Facebook page and Messenger thread the shop already uses for orders (see CartPage).
const FACEBOOK_PAGE = 'https://www.facebook.com/TOYcomManjiGangAuthenticFigures';
const FACEBOOK_MESSENGER = 'https://www.facebook.com/messages/t/100066661427714';

interface FooterProps {
  categories: CategoryInfo[];
  onNavigate: (page: string) => void;
}

const linkStyle = { color: '#50505C', background: 'none', padding: 0, fontFamily: 'Inter, sans-serif' };
const linkClass = 'block text-xs mb-2 text-left hover:text-[#80808C] transition-colors';

export default function Footer({ categories, onNavigate }: FooterProps) {
  return (
    <footer
      // Full window width, like the hero; the content inside stays in the 1280px column.
      style={{
        backgroundColor: '#0D0D10',
        borderTop: '1px solid #1A1A20',
        fontFamily: 'Inter, sans-serif',
        marginLeft: 'calc(50% - 50vw)',
      }}
      className="relative w-screen py-12 px-4 mt-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="" width={28} height={28} className="w-7 h-7 rounded-full flex-shrink-0" />
              <span
                style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
                className="text-base font-700"
              >
                Panda's Attic
              </span>
            </div>
            <p style={{ color: '#50505C' }} className="text-xs leading-relaxed">
              Anime figures, collectibles and Japan pre-orders. Based in the Philippines.
            </p>
          </div>

          {/* Shop: the same categories as the navigation, plus Japan New Arrivals */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Shop</p>
            {categories.map((c) => (
              <button key={c.slug} type="button" onClick={() => onNavigate(c.slug)} style={linkStyle} className={linkClass}>
                {c.label}
              </button>
            ))}
            <button type="button" onClick={() => onNavigate('japan-new-arrivals')} style={linkStyle} className={linkClass}>
              Japan New Arrivals
            </button>
          </div>

          {/* Info */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Info</p>
            <button type="button" onClick={() => onNavigate('pre-order')} style={linkStyle} className={linkClass}>
              Pre-Orders
            </button>
            <a href={FACEBOOK_MESSENGER} target="_blank" rel="noopener noreferrer" style={linkStyle} className={linkClass}>
              Contact Us
            </a>
          </div>

          {/* Social */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Follow Us</p>
            <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" style={linkStyle} className={linkClass}>
              Facebook
            </a>
          </div>
        </div>

        <div
          style={{ borderTop: '1px solid #1A1A20', color: '#30303C' }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          <p>© 2026 Panda's Attic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
