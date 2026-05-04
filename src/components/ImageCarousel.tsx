import React, {
  useRef, useEffect, useState, useCallback, useLayoutEffect,
} from 'react';
import { usePersonalGallery } from '@/hooks/usePersonalGallery';

/* ─── types ──────────────────────────────────────────── */
export type CarouselMedia = { src: string; alt?: string; type?: 'image' | 'video' };

interface Props {
  /** If omitted, pulls from personal-manifest.json via usePersonalGallery */
  images?: CarouselMedia[];
  /** Continuous ticker mode. Default false = manual snap */
  ticker?: boolean;
  /** px/second auto-scroll speed. Default 55 */
  speed?: number;
  /** Pause the ticker (stop automatic movement) */
  paused?: boolean;
  /** Card width CSS value. Default 'clamp(220px,28vw,360px)' */
  cardWidth?: string;
  /** Card height CSS value. Default 'clamp(260px,34vw,440px)' */
  cardHeight?: string;
  className?: string;
}

/* ─── lerp ───────────────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ─── media card ─────────────────────────────────────── */
const Card: React.FC<{ item: CarouselMedia; w: string; h: string; eager?: boolean }> = ({ item, w, h, eager }) => (
  <div style={{
    flexShrink: 0,
    width: w,
    height: h,
    overflow: 'hidden',
    background: '#0d0d0d',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
    position: 'relative',
    transform: 'translateZ(0)',
  }}>
    {item.type === 'video' ? (
      <video
        src={item.src} autoPlay loop muted playsInline preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
      />
    ) : (
      <img
        src={item.src} alt={item.alt ?? ''}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
      />
    )}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.38), rgba(0,0,0,0.08) 36%, rgba(0,0,0,0))',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '24px',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    }} />
  </div>
);

/* ══════════════════════════════════════════════════════
   TICKER — transform-based RAF loop, zero scrollLeft
══════════════════════════════════════════════════════ */
const Ticker: React.FC<Required<Pick<Props, 'speed' | 'cardWidth' | 'cardHeight' | 'className'>> & { items: CarouselMedia[]; paused?: boolean }> = ({
  items, speed, cardWidth, cardHeight, className, paused,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const posRef = useRef(0);
  const velRef = useRef(speed);
  const curVelRef = useRef(speed);
  const segRef = useRef(0);
  const lastTRef = useRef<number | undefined>(undefined);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragPosRef = useRef(0);

  // triple the deck for seamless loop
  const deck = [...items, ...items, ...items];

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || !items.length) return;
    const children = Array.from(el.children) as HTMLElement[];
    let w = 0;
    for (let i = 0; i < items.length; i++) w += children[i]?.offsetWidth ?? 0;
    // account for gap (12px * n gaps)
    w += 12 * items.length;
    segRef.current = w;
    posRef.current = -w;
    el.style.transform = `translate3d(${-w}px,0,0)`;
  }, [items]);

  const tick = useCallback((now: number) => {
    const dt = Math.min((now - (lastTRef.current ?? now)) / 1000, 0.05);
    lastTRef.current = now;
    if (!dragging.current) {
      curVelRef.current = lerp(curVelRef.current, velRef.current, 0.07);
      posRef.current -= curVelRef.current * dt;
      const seg = segRef.current;
      if (seg > 0) {
        if (posRef.current < -seg * 2) posRef.current += seg;
        if (posRef.current > -seg) posRef.current -= seg;
      }
      if (trackRef.current)
        trackRef.current.style.transform = `translate3d(${posRef.current}px,0,0)`;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  // reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) velRef.current = 0;
    const fn = () => { velRef.current = mq.matches ? 0 : speed; };
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [speed]);

  // Pause/resume when `paused` toggles
  useEffect(() => {
    if (paused) {
      velRef.current = 0;
    } else {
      velRef.current = speed;
    }
  }, [paused, speed]);

  // Pause handling will be done by parent via a prop; we expose a CSS var below

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragPosRef.current = posRef.current;
    velRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    posRef.current = dragPosRef.current + (e.clientX - dragStartX.current);
    if (trackRef.current)
      trackRef.current.style.transform = `translate3d(${posRef.current}px,0,0)`;
  };

  const onPointerUp = () => {
    dragging.current = false;
    curVelRef.current = 0;
    setTimeout(() => { velRef.current = speed; }, 700);
  };

  if (!items.length) return null;

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'grab' }}
      onMouseEnter={() => { velRef.current = 0; }}
      onMouseLeave={() => { velRef.current = speed; }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Edge fade */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, #080808 0%, rgba(8,8,8,0.6) 4%, transparent 8%, transparent 92%, rgba(8,8,8,0.6) 96%, #080808 100%)',
      }} />

      <div
        ref={trackRef}
        style={{ display: 'flex', gap: '12px', willChange: 'transform', userSelect: 'none' }}
      >
        {deck.map((m, i) => (
          <Card key={i} item={m} w={cardWidth} h={cardHeight} eager={i < items.length} />
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   SNAP — native scroll snap, manual swipe + arrows + dots
══════════════════════════════════════════════════════ */
const Snap: React.FC<Required<Pick<Props, 'cardHeight' | 'className'>> & { items: CarouselMedia[] }> = ({
  items, cardHeight, className,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const n = items.length;

  const goTo = useCallback((idx: number) => {
    const i = ((idx % n) + n) % n;
    setCurrent(i);
    trackRef.current?.scrollTo({ left: i * (trackRef.current.offsetWidth), behavior: 'smooth' });
  }, [n]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const fn = () => setCurrent(Math.round(el.scrollLeft / el.offsetWidth) % n);
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, [n]);

  if (!items.length) return null;

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex', overflowX: 'scroll',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
        }}
      >
        <style>{`.snap-hide::-webkit-scrollbar{display:none}`}</style>
        {items.map((m, i) => (
          <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', height: cardHeight, overflow: 'hidden' }}>
            <Card item={m} w="100%" h={cardHeight} eager={i === 0} />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {n > 1 && ['left', 'right'].map(side => (
        <button key={side}
          onClick={() => goTo(current + (side === 'right' ? 1 : -1))}
          aria-label={side}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [side]: '12px', zIndex: 10,
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,8,8,0.85)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#F4F3F0', cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#E3000F')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points={side === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
          </svg>
        </button>
      ))}

      {/* Dots */}
      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? '20px' : '6px', height: '6px',
              background: i === current ? '#E3000F' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   UNIFIED EXPORT
   Usage examples:

   // Ticker from manifest (personal gallery):
   <ImageCarousel ticker speed={55} />

   // Ticker from explicit images:
   <ImageCarousel ticker images={myImages} speed={40} cardHeight="360px" />

   // Manual snap from explicit images:
   <ImageCarousel images={myImages} cardHeight="400px" />
══════════════════════════════════════════════════════ */
const ImageCarousel: React.FC<Props> = ({
  images,
  ticker = false,
  speed = 55,
  cardWidth = 'clamp(220px,28vw,360px)',
  cardHeight = 'clamp(260px,34vw,440px)',
  className = '',
  paused = false,
}) => {
  const { items: galleryItems, loading } = usePersonalGallery();

  // If images prop supplied use it, otherwise fall back to manifest
  const resolved: CarouselMedia[] = images
    ? images
    : galleryItems.map(g => ({ src: g.src, alt: g.filename, type: g.type }));

  if (loading && !images) {
    return (
      <div style={{ height: cardHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 28, height: 28, border: '2px solid #E3000F',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!resolved.length) {
    return (
      <div style={{
        height: cardHeight, border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'DM Sans'", fontWeight: 300, fontSize: '10px',
          letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(244,243,240,0.2)',
        }}>No media yet</span>
      </div>
    );
  }

  return ticker
    ? <Ticker items={resolved} speed={speed} cardWidth={cardWidth} cardHeight={cardHeight} className={className} paused={paused} />
    : <Snap items={resolved} cardHeight={cardHeight} className={className} />;
};

export default ImageCarousel;