import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { parseAndPaginate } from '@/data/book-text';
import type { ParsedPage } from '@/data/book-text';

/* ══════════════════════════════
   CHAPTERS META 
══════════════════════════════ */
const CHAPTERS = [
  { number: 1, title: 'The Weight of Expectation', tease: 'On carrying dreams that were never yours to carry.' },
  { number: 2, title: 'The Fire You Carry', tease: 'What excites you when no one is watching?' },
  { number: 3, title: 'Perfect Is Not the Goal', tease: 'An invitation to intentional years instead.' },
  { number: 4, title: 'Built to Build', tease: 'Why creation is the only thing that changes the world.' },
  { number: 5, title: 'The Long Road', tease: 'Everything I know at seventeen.' },
];

/* ══════════════════════════════
   REALISTIC 3-D BOOK COVER 
══════════════════════════════ */
const BookCover: React.FC<{ onRead: () => void }> = ({ onRead }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex justify-center"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 45%' }}
    >
      <div
        onClick={onRead}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative cursor-pointer select-none"
        style={{
          width: 240,
          height: 360,
          transformStyle: 'preserve-3d',
          transform: hovered
            ? 'rotateY(-28deg) rotateX(4deg) translateY(-10px)'
            : 'rotateY(-18deg) rotateX(2deg)',
          transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          filter: hovered ? 'drop-shadow(28px 28px 40px rgba(0,0,0,0.95))' : 'drop-shadow(18px 18px 30px rgba(0,0,0,0.85))',
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 60%, #111 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Cloth texture overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(
              0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px
            ), repeating-linear-gradient(
              90deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px
            )`,
            pointerEvents: 'none',
          }} />
          {/* Foil sheen on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered
              ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)'
              : 'transparent',
            transition: 'background 0.4s',
            pointerEvents: 'none',
          }} />
          {/* Book image */}
          <img
            src="/images/book-cover-perfect-years.jpg"
            alt="Perfect Years"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', mixBlendMode: 'luminosity', opacity: 0.95 }}
          />
          {/* Spine hinge shadow */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
            background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          {/* Bottom edge darkening */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))',
          }} />
        </div>

        {/* SPINE */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: 0,
          width: 28,
          transformOrigin: 'left center',
          transform: 'rotateY(90deg) translateZ(-14px)',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(to right, #0a0a0a, #181818)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Spine cloth texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          }} />
          <span style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            whiteSpace: 'nowrap',
          }}>
            PERFECT YEARS · SALAMI OREOLUWA
          </span>
        </div>

        {/* BACK FACE */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(160deg, #111 0%, #0a0a0a 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 20,
        }}>
          <div style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
            position: 'absolute', inset: 0,
          }} />
          <p style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
            Perfect Years
          </p>
        </div>

        {/* PAGE BLOCK — right edge showing pages */}
        <div style={{
          position: 'absolute',
          top: 2, bottom: 2,
          right: -8,
          width: 8,
          transformOrigin: 'left center',
          background: 'repeating-linear-gradient(to bottom, #e8e4dc, #e8e4dc 1px, #d4cfc6 1px, #d4cfc6 2px)',
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
        }} />

        {/* TOP EDGE */}
        <div style={{
          position: 'absolute',
          top: -4, left: 2, right: 0,
          height: 4,
          transformOrigin: 'bottom center',
          transform: 'rotateX(90deg)',
          background: 'repeating-linear-gradient(to right, #e8e4dc, #e8e4dc 1px, #d0cbc2 1px, #d0cbc2 2px)',
        }} />
      </div>
    </div>
  );
};

/* ══════════════════════════════
   PAGE RENDERERS (Only place Serif exists)
══════════════════════════════ */
const ChapterOpenerPage: React.FC<{ page: ParsedPage; isLeft: boolean }> = ({ page, isLeft }) => (
  <div className="w-full h-full flex flex-col justify-end relative overflow-hidden"
    style={{ background: '#0A0A0A', padding: '48px 40px' }}>
    {/* Diagonal clip image area */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'url(/images/book-cover-perfect-years.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.06,
      clipPath: isLeft ? 'polygon(0 0, 70% 0, 30% 100%, 0 100%)' : 'polygon(30% 0, 100% 0, 100% 100%, 70% 100%)',
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ width: 32, height: 2, background: '#E3000F', marginBottom: 24 }} />
      <p style={{
        fontFamily: 'DM Sans, sans-serif', fontWeight: 900, fontSize: 10,
        letterSpacing: '0.25em', textTransform: 'uppercase', color: '#E3000F', marginBottom: 16,
      }}>
        Chapter {page.chapterNumber}
      </p>
      <h2 style={{
        fontFamily: 'DM Sans, sans-serif', fontWeight: 900, fontSize: 28,
        lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-0.02em',
        color: '#f0ece4', marginBottom: 0,
      }}>
        {page.chapterTitle}
      </h2>
    </div>
  </div>
);

const PullQuotePage: React.FC<{ page: ParsedPage; isLeft: boolean }> = ({ page }) => (
  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
    style={{ background: '#FAF8F3', padding: '48px 36px' }}>
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
      <div style={{ width: 40, height: 2, background: '#E3000F', margin: '0 auto 28px' }} />
      <p style={{
        fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 20,
        lineHeight: 1.35, color: '#111', letterSpacing: '-0.01em',
        fontStyle: 'italic',
      }}>
        "{page.quote}"
      </p>
      <div style={{ width: 40, height: 2, background: '#E3000F', margin: '28px auto 0' }} />
    </div>
  </div>
);

const BodyPage: React.FC<{ page: ParsedPage; pageNum: number; isLeft: boolean }> = ({ page, pageNum, isLeft }) => {
  const paragraphs = (page.content || '').split(/\n\n+/).filter(Boolean);

  return (
    <div className="w-full h-full relative overflow-hidden"
      style={{ background: '#FAF8F3', padding: '44px 36px 36px' }}>

      {/* Spine shadow */}
      <div style={{
        position: 'absolute',
        [isLeft ? 'right' : 'left']: 0,
        top: 0, bottom: 0, width: 20,
        background: isLeft
          ? 'linear-gradient(to left, rgba(0,0,0,0.07), transparent)'
          : 'linear-gradient(to right, rgba(0,0,0,0.07), transparent)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {paragraphs.map((para, i) => {
          const isFirst = i === 0;
          const firstLetter = isFirst ? para[0] : '';
          const rest = isFirst ? para.slice(1) : para;

          return (
            <p key={i} style={{
              fontFamily: 'Georgia, serif', // ONLY ALLOWED SERIF ON SITE
              fontSize: 14,
              lineHeight: 1.82,
              color: '#1a1a1a',
              marginBottom: '0.9em',
              textAlign: 'justify',
              textIndent: isFirst ? 0 : '1.4em',
              position: 'relative',
            }}>
              {isFirst && (
                <span style={{
                  float: 'left',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 900,
                  fontSize: 52,
                  lineHeight: 0.82,
                  marginRight: 6,
                  marginTop: 6,
                  color: '#E3000F',
                  textTransform: 'uppercase',
                }}>
                  {firstLetter}
                </span>
              )}
              {rest}
            </p>
          );
        })}
      </div>

      {/* Page number */}
      <span style={{
        position: 'absolute',
        bottom: 18,
        [isLeft ? 'left' : 'right']: 28,
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: '0.2em',
        color: 'rgba(0,0,0,0.25)',
      }}>
        {pageNum}
      </span>
    </div>
  );
};

/* ══════════════════════════════
   FULL SCREEN READER (Untouched)
══════════════════════════════ */
const FullScreenReader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const [pages, setPages] = useState<ParsedPage[]>([]);
  const [current, setCurrent] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    (async () => {
      const mod = await import('@/data/book-text');
      setPages(parseAndPaginate(mod.bookText));
    })();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!pages.length || !containerRef.current || initialized.current) return;
    initialized.current = true;

    const isMobile = window.innerWidth < 768;
    const h = isMobile
      ? Math.min(window.innerHeight - 140, 520)
      : Math.min(window.innerHeight - 120, 660);
    const w = isMobile ? Math.round(h / 1.45) : Math.round(h / 1.45);

    import('page-flip').then(({ PageFlip }) => {
      const pf = new PageFlip(containerRef.current!, {
        width: w, height: h, size: 'fixed',
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
        usePortrait: isMobile,
        drawShadow: true,
        flippingTime: 900,
      });
      pf.loadFromHTML(containerRef.current!.querySelectorAll('.pf-page'));
      bookRef.current = pf;
      pf.on('flip', () => setCurrent(pf.getCurrentPageIndex()));
    }).catch(console.error);
  }, [pages]);

  const flipNext = useCallback(() => bookRef.current?.flipNext(), []);
  const flipPrev = useCallback(() => bookRef.current?.flipPrev(), []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') flipNext();
      if (e.key === 'ArrowLeft') flipPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [flipNext, flipPrev, onClose]);

  const totalPages = pages.length;

  return (
    <div className="fixed inset-0 z-[1000] bg-deep-black flex flex-col items-center justify-center animate-in fade-in duration-500">

      <div className="absolute top-0 left-0 w-full px-6 py-6 flex justify-between items-center z-[1001]">
        <span className="font-dm font-bold text-[9px] tracking-widest uppercase text-white/30">
          {current > 0 ? `Page ${current} / ${totalPages}` : 'Cover'}
        </span>
        <button onClick={onClose} className="flex items-center gap-2 font-dm font-bold text-[10px] tracking-widest uppercase text-white/40 hover:text-conflagrator-red transition-colors">
          <X size={16} /> Close Book
        </button>
      </div>

      {pages.length > 0 ? (
        <div className="flex items-center gap-4 md:gap-10">
          <button onClick={flipPrev} className="hidden md:flex w-12 h-12 rounded border border-white/10 items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all flex-shrink-0">
            <ChevronLeft size={20} />
          </button>

          <div className="shadow-[0_40px_100px_rgba(0,0,0,0.95)]">
            <div ref={containerRef}>

              {/* COVER */}
              <div className="pf-page" data-density="hard">
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex flex-col items-center justify-center text-center p-10 relative overflow-hidden border-r border-white/5">
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/50 to-transparent" />
                  <img src="/images/book-cover-perfect-years.jpg" alt="" className="w-full h-full object-cover absolute inset-0 opacity-15 mix-blend-luminosity" />
                  <div className="relative z-10">
                    <h1 className="font-dm font-black text-4xl md:text-[52px] tracking-tighter uppercase leading-[0.9] text-[#f0ece4] mb-4">PERFECT<br /><span className="text-conflagrator-red">YEARS</span></h1>
                    <div className="w-8 h-[2px] bg-conflagrator-red mx-auto my-5" />
                    <p className="font-dm font-bold text-[9px] tracking-widest uppercase text-white/40">Salami Oreoluwa</p>
                  </div>
                </div>
              </div>

              {/* INSIDE COVER */}
              <div className="pf-page" data-density="hard">
                <div className="w-full h-full bg-[#FAF8F3] flex flex-col items-center justify-center p-12">
                  <h2 className="font-dm font-black text-2xl uppercase tracking-tighter text-[#111] mb-2">PERFECT YEARS</h2>
                  <p className="font-dm font-bold text-[10px] tracking-widest text-[#555] uppercase mb-8">By Salami Oreoluwa</p>
                  <div className="w-8 h-[1px] bg-conflagrator-red mx-auto mb-8" />
                  <p className="font-dm font-medium text-xs text-[#888] text-center leading-relaxed uppercase tracking-widest max-w-[200px]">
                    Written at 17.<br />True at any age.
                  </p>
                </div>
              </div>

              {/* CONTENT PAGES */}
              {pages.map((p, i) => {
                const isLeft = i % 2 === 0;
                const pageNum = i + 1;
                return (
                  <div key={i} className="pf-page" data-density="soft">
                    {p.type === 'chapter-opener' && <ChapterOpenerPage page={p} isLeft={isLeft} />}
                    {p.type === 'pull-quote' && <PullQuotePage page={p} isLeft={isLeft} />}
                    {p.type === 'body' && <BodyPage page={p} pageNum={pageNum} isLeft={isLeft} />}
                  </div>
                );
              })}

              {/* BACK COVER */}
              <div className="pf-page" data-density="hard">
                <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#0a0a0a] relative overflow-hidden border-l border-white/5">
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-6 h-[2px] bg-conflagrator-red mb-4" />
                    <p className="font-dm font-bold text-[8px] tracking-[0.22em] uppercase text-white/20">Perfect Years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={flipNext} className="hidden md:flex w-12 h-12 rounded border border-white/10 items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all flex-shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div className="w-8 h-8 border-2 border-conflagrator-red border-t-transparent rounded-full animate-spin" />
      )}

      <p className="absolute bottom-6 font-dm font-bold text-[8px] tracking-[0.22em] uppercase text-white/20 md:hidden">
        Swipe to turn pages
      </p>
    </div>
  );
};

/* ══════════════════════════════
   REFINED PAGE SECTIONS (Void Luxury)
══════════════════════════════ */

/* ── 1. The Typographic Stack ── */
const ChapterList: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-surface-black border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col">
        {CHAPTERS.map((ch, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className="flex flex-col md:flex-row items-start md:items-baseline gap-4 md:gap-12 border-b border-white/10 py-12 md:py-16 hover:bg-white/5 transition-colors group cursor-default px-4 -mx-4 rounded-sm">
              <span className="font-dm font-black text-3xl md:text-5xl tracking-tighter text-conflagrator-red/40 group-hover:text-conflagrator-red transition-colors">
                {String(ch.number).padStart(2, '0')}
              </span>
              <div>
                <p className="font-dm font-black text-4xl md:text-6xl lg:text-7xl text-off-white tracking-tighter leading-[0.9] uppercase mb-4">
                  {ch.title}
                </p>
                <p className="font-dm font-bold text-sm md:text-base tracking-wide text-white/40 uppercase">
                  {ch.tease}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── 2. The Brutal Pull Quote ── */
const QuoteBreak: React.FC = () => (
  <section className="py-32 md:py-48 px-6 md:px-16 lg:px-24 bg-deep-black">
    <ScrollReveal>
      <div className="max-w-5xl mx-auto border-l-4 border-conflagrator-red pl-8 md:pl-16">
        <p className="font-dm font-black text-4xl md:text-6xl lg:text-8xl text-off-white tracking-tighter leading-[1.05] uppercase">
          "The fear of staying the same is worse than the fear of change."
        </p>
      </div>
    </ScrollReveal>
  </section>
);

/* ── 3. The Structural Author Block ── */
const AuthorBlock: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-surface-black border-t border-white/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-24">

      {/* Profile Picture */}
      <ScrollReveal>
        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden border border-white/10">
          <img src="/images/profile picture.jpg" alt="Salami Oreoluwa" className="w-full h-full object-cover" />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="flex flex-col max-w-xl text-center md:text-left mt-4 md:mt-8">
          <h3 className="font-dm font-black text-5xl md:text-7xl text-off-white uppercase tracking-tighter mb-6 leading-none">
            SALAMI<br />OREOLUWA
          </h3>
          <p className="font-dm font-medium text-lg md:text-xl text-white/50 leading-relaxed mb-10">
            Founder of KLiP and the Ignition Movement. He wrote Perfect Years at seventeen.
          </p>
          <a href="https://linkedin.com/in/oreoluwasalami" target="_blank" rel="noopener noreferrer" className="font-dm font-bold text-xs tracking-widest uppercase text-white/40 hover:text-off-white transition-colors flex items-center justify-center md:justify-start gap-2">
            See him on LinkedIn <span>→</span>
          </a>
        </div>
      </ScrollReveal>

    </div>
  </section>
);

/* ══════════════════════════════
   MAIN BOOK PAGE ASSEMBLY
══════════════════════════════ */
const Book: React.FC = () => {
  const [reading, setReading] = useState(false);

  return (
    <div className="bg-deep-black min-h-[100svh]">
      {reading && <FullScreenReader onClose={() => setReading(false)} />}

      {/* SOLID PRESENTATION CARD */}
      <section className="min-h-[100svh] flex items-center justify-center py-24 px-6 md:px-16 lg:px-24 border-b border-white/5 bg-deep-black">

        <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-7xl p-10 md:p-24 lg:p-32 flex flex-col md:flex-row items-center gap-16 md:gap-24 lg:gap-32 relative overflow-hidden">

          <ScrollReveal>
            <BookCover onRead={() => setReading(true)} />
          </ScrollReveal>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
            <ScrollReveal>
              <h1 className="font-dm font-black text-6xl md:text-8xl lg:text-[120px] text-off-white tracking-tighter leading-[0.85] mb-8 uppercase">
                PERFECT<br /><span className="text-conflagrator-red">YEARS</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <button
                onClick={() => setReading(true)}
                className="bg-conflagrator-red text-deep-black font-dm font-bold text-sm tracking-widest uppercase px-10 py-5 hover:bg-off-white transition-colors mt-4"
              >
                Read the Book
              </button>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* REFINED ARCHITECTURE */}
      <ChapterList />
      <QuoteBreak />
      <AuthorBlock />

    </div>
  );
};

export default Book;