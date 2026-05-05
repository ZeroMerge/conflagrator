import { Routes, Route, useLocation, Link } from 'react-router';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Klip from '@/pages/Klip';
import Book from '@/pages/Book';
import Connect from '@/pages/Connect';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // A small timeout ensures React has fully painted the new route before scrolling and refreshing GSAP
    setTimeout(() => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div style={{ minHeight: '100svh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pointerEvents: 'none' }}>
        <span style={{ fontFamily: "'DM Sans'", fontWeight: 900, lineHeight: 1, fontSize: 'clamp(160px, 48vw, 520px)', color: 'transparent', WebkitTextStroke: '1px rgba(227,0,15,0.07)', userSelect: 'none' }}>404</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: "'DM Sans'", fontWeight: 300, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E3000F', display: 'block', marginBottom: '20px' }}>Error — Page Not Found</span>
        <p style={{ fontFamily: "'DM Sans'", fontWeight: 900, fontSize: 'clamp(28px, 8vw, 72px)', letterSpacing: '-0.03em', lineHeight: 0.88, color: '#F4F3F0', textTransform: 'uppercase', marginBottom: '24px' }}>
          THIS FIRE<br /><span style={{ color: '#E3000F' }}>HAS MOVED.</span>
        </p>
        <p style={{ fontFamily: "'DM Sans'", fontSize: '14px', color: 'rgba(244,243,240,0.35)', marginBottom: '36px', maxWidth: '320px' }}>
          The page you're looking for doesn't exist — but the flame does.
        </p>
        <Link to="/" style={{ display: 'inline-block', background: '#E3000F', color: '#F4F3F0', fontFamily: "'DM Sans'", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '15px 32px', textDecoration: 'none', transition: 'opacity 0.3s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >Back to the Fire →</Link>
      </div>
    </div>
  );
}

function App() {
  const { pathname } = useLocation();
  const showFooter = pathname !== '/klip' && pathname !== '/admin' && pathname !== '/admin-login';

  return (
    <div style={{ background: '#050505', minHeight: '100svh' }}>
      <Navigation />
      <ScrollToTop />
      <main style={{ paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/klip" element={<Klip />} />
          <Route path="/book" element={<Book />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
