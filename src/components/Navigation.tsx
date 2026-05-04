import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import FlameLogo from './FlameLogo';

const pages = [
  { path: '/', label: 'Home' },
  { path: '/klip', label: 'KLiP' },
  { path: '/book', label: 'Book' },
  { path: '/connect', label: 'Connect' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeIdx = pages.findIndex(p => p.path === location.pathname);
  const idx = activeIdx < 0 ? 0 : activeIdx;

  const navRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const flameTapRef = useRef<{ count: number; last: number }>({ count: 0, last: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleFlameClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    const elapsed = now - flameTapRef.current.last;

    if (elapsed > 1200) {
      flameTapRef.current.count = 0;
    }

    flameTapRef.current.count += 1;
    flameTapRef.current.last = now;

    if (flameTapRef.current.count >= 3) {
      event.preventDefault();
      sessionStorage.setItem('admin-login-unlocked', '1');
      flameTapRef.current.count = 0;
      navigate('/admin-login');
    }
  };

  // Slide the ember dot to active item
  const moveDot = () => {
    if (!navRef.current || !dotRef.current) return;
    const items = navRef.current.querySelectorAll<HTMLElement>('.nav-item');
    const el = items[idx];
    if (!el) return;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const center = elRect.left - navRect.left + elRect.width / 2;
    dotRef.current.style.transform = `translateX(${center}px) translateX(-50%)`;
  };

  useEffect(() => { moveDot(); window.addEventListener('resize', moveDot); return () => window.removeEventListener('resize', moveDot); }, [idx]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const lbl: React.CSSProperties = {
    fontFamily: "'DM Sans'",
    fontWeight: 300,
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'color 0.25s',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <>
      {/* ── Top bar ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 clamp(24px, 4vw, 56px)',
        background: scrolled ? 'rgba(5,5,5,0.92)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
      }}>

        {/* ── DESKTOP: logo + nav centered together ── */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" onClick={handleFlameClick} style={{ display: 'flex', alignItems: 'center', padding: '4px', WebkitTapHighlightColor: 'transparent' }}>
            <FlameLogo className="w-5 h-5" />
          </Link>

          <div ref={navRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {pages.map((p, i) => (
              <Link
                key={p.path}
                to={p.path}
                className="nav-item"
                style={{
                  ...lbl,
                  padding: '18px 22px 16px',
                  color: idx === i ? 'rgba(244,243,240,0.9)' : 'rgba(244,243,240,0.3)',
                  fontWeight: idx === i ? 500 : 300,
                }}
                onMouseEnter={e => { if (idx !== i) (e.currentTarget as HTMLElement).style.color = 'rgba(244,243,240,0.65)'; }}
                onMouseLeave={e => { if (idx !== i) (e.currentTarget as HTMLElement).style.color = 'rgba(244,243,240,0.3)'; }}
              >
                {p.label}
              </Link>
            ))}
            {/* Sliding ember dot */}
            <div ref={dotRef} style={{ position: 'absolute', bottom: 0, left: 0, width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(227,0,15,0.9)', boxShadow: '0 0 6px rgba(227,0,15,0.7)', transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── MOBILE: logo left · label center · hamburger right ── */}
        <div className="mobile-nav" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 clamp(20px, 4vw, 40px)' }}>
          <Link to="/" onClick={handleFlameClick} style={{ display: 'flex', alignItems: 'center', padding: '4px', WebkitTapHighlightColor: 'transparent' }}>
            <FlameLogo className="w-5 h-5" />
          </Link>
          {/* Centered label — absolute so logo/hamburger don't affect it */}
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', ...lbl, color: 'rgba(244,243,240,0.35)', fontSize: '9px', pointerEvents: 'none' }}>
            {pages[idx].label}
          </span>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', WebkitTapHighlightColor: 'transparent', display: 'flex', flexDirection: 'column', gap: '4px' }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: '18px', height: '1px', background: 'rgba(244,243,240,0.5)', transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: '18px', height: '1px', background: 'rgba(244,243,240,0.5)', transition: 'opacity 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: '18px', height: '1px', background: 'rgba(244,243,240,0.5)', transition: 'transform 0.3s, opacity 0.3s', transform: menuOpen ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 299,
        background: 'rgba(5,5,5,0.97)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 clamp(32px, 8vw, 60px)',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {pages.map((p, i) => (
          <Link
            key={p.path}
            to={p.path}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "'DM Sans'",
              fontWeight: 700,
              fontSize: 'clamp(36px, 10vw, 64px)',
              letterSpacing: '-0.02em',
              textDecoration: 'none',
              color: idx === i ? '#F4F3F0' : 'rgba(244,243,240,0.15)',
              lineHeight: 1.1,
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => (e.currentTarget.style.color = '#F4F3F0')}
            onTouchEnd={e => setTimeout(() => { if (idx !== i) (e.currentTarget.style.color = 'rgba(244,243,240,0.15)'); }, 200)}
          >
            {p.label}
            {idx === i && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(227,0,15,0.9)', boxShadow: '0 0 8px rgba(227,0,15,0.6)', flexShrink: 0 }} />
            )}
          </Link>
        ))}

        <p style={{ fontFamily: "'DM Sans'", fontWeight: 300, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.12)', marginTop: '48px' }}>
          © {new Date().getFullYear()} Conflagrator
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) { .desktop-nav { display: none !important; } }
        @media (min-width: 601px) { .mobile-nav  { display: none !important; } }
      `}</style>
    </>
  );
};

export default Navigation;