export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0D0D10',
        borderTop: '1px solid #1A1A20',
        fontFamily: 'Inter, sans-serif',
      }}
      className="py-12 px-4 mt-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{ background: 'linear-gradient(135deg, #FF2D78, #A855F7)' }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" fillOpacity="0.9" />
                </svg>
              </div>
              <span
                style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }}
                className="text-base font-700"
              >
                KaizokuFigs
              </span>
            </div>
            <p style={{ color: '#50505C' }} className="text-xs leading-relaxed">
              Your trusted source for anime figures, collectibles, and Japan pre-orders. Based in the Philippines.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Shop</p>
            {['On Hand', 'Pre-Orders', 'New Arrivals', 'Sale Items'].map((l) => (
              <p key={l} style={{ color: '#50505C' }} className="text-xs mb-2 hover:text-[#80808C] cursor-pointer transition-colors">{l}</p>
            ))}
          </div>

          {/* Info */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Info</p>
            {['Shipping Policy', 'Pre-Order FAQ', 'Returns', 'Contact Us'].map((l) => (
              <p key={l} style={{ color: '#50505C' }} className="text-xs mb-2 hover:text-[#80808C] cursor-pointer transition-colors">{l}</p>
            ))}
          </div>

          {/* Social */}
          <div>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-sm font-600 mb-3">Follow Us</p>
            {['Facebook', 'Instagram', 'TikTok', 'Shopee'].map((l) => (
              <p key={l} style={{ color: '#50505C' }} className="text-xs mb-2 hover:text-[#80808C] cursor-pointer transition-colors">{l}</p>
            ))}
          </div>
        </div>

        <div
          style={{ borderTop: '1px solid #1A1A20', color: '#30303C' }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          <p>© 2026 KaizokuFigs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Built with ❤️ for collectors, by collectors.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
