import { useEffect, useState } from 'react';

export const PAGE_SIZE = 24;

/** Render long product grids in chunks: first 24, then 24 more per click. Resets when the list changes. */
export function usePaged<T>(items: T[]) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => setVisible(PAGE_SIZE), [items]);
  return {
    shown: items.slice(0, visible),
    remaining: Math.max(0, items.length - visible),
    more: () => setVisible((v) => v + PAGE_SIZE),
  };
}

export function ShowMoreButton({ remaining, onClick }: { remaining: number; onClick: () => void }) {
  if (remaining <= 0) return null;
  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={onClick}
        style={{ background: '#1A1A20', color: '#F0F0F4', border: '1px solid #2A2A32', fontFamily: 'Outfit, sans-serif', fontSize: 14, borderRadius: 9999, padding: '10px 28px' }}
        className="font-600 hover:border-[#FF2D78] transition-colors"
      >
        Show more ({remaining} left)
      </button>
    </div>
  );
}
