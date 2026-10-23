import type { ReactNode } from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  accent: string;
  action?: ReactNode;
}

/** Section and page header: an optional kicker, a heavy uppercase title and an accent rule. */
export default function SectionHeading({ kicker, title, accent, action }: SectionHeadingProps) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {kicker && (
            <p
              style={{ color: accent, fontFamily: 'Outfit, sans-serif' }}
              className="flex items-center gap-2 text-xs font-800 uppercase tracking-[0.25em] mb-2"
            >
              <span>{kicker}</span>
            </p>
          )}
          <h2
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 0.95 }}
            className="text-4xl sm:text-6xl font-bold uppercase tracking-tight"
          >
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div
        className="mt-5 h-[3px] w-full rounded-full"
        style={{ background: `linear-gradient(to right, ${accent}, transparent 70%)` }}
      />
    </div>
  );
}
