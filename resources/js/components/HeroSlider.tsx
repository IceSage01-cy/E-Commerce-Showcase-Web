import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { heroSlides as fallbackSlides } from '../data/products';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: string;
  image: string;
  accent: string;
}

interface HeroSliderProps {
  onNavigate: (page: string) => void;
}

export default function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    axios.get('/api/banners').then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSlides(res.data);
        setCurrent(0);
      }
    }).catch(() => {
      // Keep the fallback slides if the request fails for any reason.
    });
  }, []);

  const go = useCallback((index: number) => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    setCurrent(((index % slides.length) + slides.length) % slides.length);
  }, [isAnimating, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(timer);
  }, [current, go, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'min(72vh, 580px)' }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.45) saturate(1.1)' }}
          />
          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0.3) 60%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(10,10,11,0.9) 0%, transparent 50%)',
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div
            className="max-w-xl transition-all duration-500"
            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(12px)' : 'translateY(0)' }}
          >
            {/* Category chip */}
            <div className="mb-4">
              <span
                style={{
                  backgroundColor: slide.accent + '22',
                  color: slide.accent,
                  border: `1px solid ${slide.accent}44`,
                  fontFamily: 'Outfit, sans-serif',
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-600 uppercase tracking-wider"
              >
                <span
                  style={{ backgroundColor: slide.accent }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                {current === 0 ? 'New Arrivals' : current === 1 ? 'Pre-Order' : 'Collection'}
              </span>
            </div>

            <h1
              style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', lineHeight: 1.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-800 mb-3"
            >
              {slide.title}
            </h1>

            <p
              style={{ color: '#A0A0AC', fontFamily: 'Inter, sans-serif' }}
              className="text-base sm:text-lg mb-8 font-400"
            >
              {slide.subtitle}
            </p>

            <button
              onClick={() => onNavigate(slide.ctaAction)}
              style={{
                background: slide.accent,
                fontFamily: 'Outfit, sans-serif',
                color: '#FFFFFF',
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-600 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              {slide.cta}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(current - 1)}
            style={{ backgroundColor: 'rgba(20,20,24,0.7)', border: '1px solid #222228', color: '#A0A0AC' }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[#1E1E26] hover:text-[#F0F0F4] hover:border-[#333340]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => go(current + 1)}
            style={{ backgroundColor: 'rgba(20,20,24,0.7)', border: '1px solid #222228', color: '#A0A0AC' }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[#1E1E26] hover:text-[#F0F0F4] hover:border-[#333340]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="transition-all"
                style={{
                  width: i === current ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === current ? slide.accent : 'rgba(240,240,244,0.3)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
