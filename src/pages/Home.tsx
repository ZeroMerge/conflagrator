import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, ArrowRight, ArrowLeft, X, Maximize2, Plus } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import UploadZone from '@/components/UploadZone';
import CTAButton from '@/components/CTAButton';
import ImageCarousel from '@/components/ImageCarousel';
import { useAgeCounter } from '@/hooks/useAgeCounter';
import { usePersonalGallery } from '@/hooks/usePersonalGallery';

gsap.registerPlugin(ScrollTrigger);

/* ── Divider helpers ── */
const MacroSpace = () => <div style={{ height: 'clamp(80px,18vh,180px)', background: '#050505' }} />;

const ColorBlock = ({ from, to }: { from: string; to: string }) => (
  <div style={{ height: '2px', background: `linear-gradient(to right, ${from}, ${to})`, opacity: 0.06 }} />
);

const EditorialLine = () => (
  <div style={{ height: 'clamp(60px,12vh,120px)', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '48px', height: '2px', background: '#E3000F', opacity: 0.5 }} />
  </div>
);

/* ══════════════════════════════
   HERO
══════════════════════════════ */
const Hero: React.FC = () => {
  const age = useAgeCounter();
  const imgRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: 15, ease: 'none',
          scrollTrigger: { trigger: imgRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
      const words = wordsRef.current?.querySelectorAll('.hw');
      if (words) {
        gsap.fromTo(words,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full min-h-[100svh] bg-deep-black overflow-hidden flex flex-col justify-center">
      <div ref={imgRef} className="absolute inset-0 md:left-auto md:right-0 md:w-[50%] h-[115%] -top-[5%] will-change-transform">
        <img src="/images/hero-portrait-main.jpg" alt="Oreoluwa" className="w-full h-full object-cover object-top grayscale-[80%] contrast-125 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/80 to-transparent md:bg-gradient-to-r md:from-deep-black md:via-deep-black/90 md:to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-24 lg:px-32 relative z-10">
        <div ref={wordsRef} className="flex flex-col items-start justify-center min-h-[100svh] mt-12 md:mt-0 pointer-events-none">
          <div className="hw"><span className="font-dm font-black text-[17vw] md:text-[8vw] leading-[0.85] tracking-tighter text-off-white block">SALAMI</span></div>
          <div className="hw"><span className="font-dm font-black text-[14vw] md:text-[9.5vw] leading-[0.85] tracking-tighter text-off-white block mb-4 opacity-60">OREOLUWA</span></div>
          <div className="hw"><span className="font-dm font-black text-[10vw] md:text-[5vw] leading-[0.85] tracking-tighter text-conflagrator-red block mt-4">AUTHOR</span></div>
          <div className="hw"><span className="font-dm font-black text-[14vw] md:text-[6.5vw] leading-[0.85] tracking-tighter text-off-white block">FOUNDER</span></div>
          <div className="hw"><span className="font-dm font-black text-[10vw] md:text-[5vw] leading-[0.85] tracking-tighter text-conflagrator-red block">LEADER</span></div>
          <div className="hw"><span className="font-dm font-black text-[13vw] md:text-[6vw] leading-[0.85] tracking-tighter text-off-white block">ENGINEER</span></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-24 lg:px-32 relative z-10">
        <p className="font-dm font-black text-2xl md:text-4xl tracking-tight text-off-white">
          {age} <span className="text-conflagrator-red">YEARS</span> OF FIRE
        </p>
      </div>
    </section>
  );
};

/* ══════════════════════════════
   CHAPTER 1: ORIGINS — TIMELINE WALL
══════════════════════════════ */
const roles = [
  { label: 'Head Boy', year: '2022', school: 'Beulah Academy', color: '#f5edd4' },
  { label: 'Club President', year: '2021', school: 'JET & Computer Club', color: '#E3000F' },
  { label: 'General Secretary', year: '2023', school: 'GSF, FUTMinna', color: '#00897B' },
  { label: 'Author', year: '2021', school: 'Perfect Years', color: '#cfcfcfdc' },
  { label: 'Mentor', year: 'Now', school: 'Ignition Movement', color: '#E3000F' },
  { label: 'Conflagrator', year: 'Always', school: 'The World', color: '#00897B' },
];

const ChapterOrigins: React.FC = () => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1, transformOrigin: 'top center', duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: lineRef.current, start: 'top 80%', toggleActions: 'play none none none' }
        }
      );
    }
    itemsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, x: -28 },
        {
          opacity: 1, x: 0, duration: 0.65, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' }
        }
      );
    });
  }, []);

  return (
    <section className="bg-deep-black py-24 md:py-40 px-6 md:px-16 lg:px-24 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="font-dm font-black text-4xl md:text-7xl text-off-white leading-[0.9] tracking-tighter mb-16 md:mb-24">
            ALWAYS THE ONE<br /><span className="text-conflagrator-red">PEOPLE FOLLOWED.</span>
          </p>
        </ScrollReveal>

        <div className="flex gap-6 md:gap-12 items-flex-start">
          {/* Red vertical line */}
          <div className="flex-shrink-0 flex flex-col items-center pt-[6px]">
            <div className="w-2 h-2 rounded-full bg-conflagrator-red flex-shrink-0" />
            <div
              ref={lineRef}
              className="w-px flex-1 origin-top"
              style={{
                minHeight: '360px',
                background: 'linear-gradient(to bottom, #E3000F 0%, rgba(227,0,15,0.12) 100%)',
              }}
            />
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(227,0,15,0.2)' }} />
          </div>

          {/* Role list */}
          <div className="flex-1 flex flex-col gap-8 md:gap-12">
            {roles.map((r, i) => (
              <div
                key={i}
                ref={el => { itemsRef.current[i] = el; }}
                className="opacity-0 group cursor-default"
              >
                {/* Connector */}
                <div className="flex items-center gap-0 mb-2">
                  <div className="h-px w-6 md:w-10" style={{ background: 'rgba(227,0,15,0.35)' }} />
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                </div>

                <p
                  className="font-dm font-black uppercase leading-none tracking-tighter transition-colors duration-300"
                  style={{ fontSize: 'clamp(20px,4vw,36px)', color: '#F4F3F0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = r.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#F4F3F0'; }}
                >
                  {r.label}
                </p>

                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-dm font-light text-[10px] uppercase tracking-[0.18em]" style={{ color: r.color, opacity: 0.75 }}>{r.year}</span>
                  <div className="w-px h-2.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <span className="font-dm font-light text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(244, 243, 240, 0.56)' }}>{r.school}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════
   CHAPTER 2: THE AUTHOR (Bookshelf & Square Reveal)
══════════════════════════════ */
const ChapterAuthor: React.FC = () => {
  const [activeBook, setActiveBook] = useState(false);

  const books = [
    { w: 'w-[30px] md:w-[40px]', h: 'h-[160px] md:h-[200px]', bg: 'bg-[#1a1a1a]', text: 'Governance' },
    { w: 'w-[24px] md:w-[32px]', h: 'h-[140px] md:h-[180px]', bg: 'bg-[#222]', text: 'Faith' },
    { w: 'w-[40px] md:w-[60px]', h: 'h-[180px] md:h-[240px]', bg: 'bg-conflagrator-red', text: 'PERFECT YEARS', target: true },
    { w: 'w-[28px] md:w-[36px]', h: 'h-[150px] md:h-[190px]', bg: 'bg-[#111]', text: 'Policy' },
    { w: 'w-[34px] md:w-[44px]', h: 'h-[170px] md:h-[210px]', bg: 'bg-[#1a1a1a]', text: 'Vision' },
  ];

  return (
    <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 bg-[#0d0d0d]">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="font-dm font-black text-4xl md:text-7xl text-off-white leading-[0.9] tracking-tighter mb-20">
            HE WROTE IT AT 17.<br /><span className="text-conflagrator-red">NOBODY TOLD HIM TO.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-center gap-1 md:gap-2 px-8">
              {books.map((b, i) => (
                <div
                  key={i}
                  onClick={() => b.target && setActiveBook(!activeBook)}
                  className={`relative flex items-center justify-center transition-transform duration-300 origin-bottom ${b.w} ${b.h} ${b.bg} ${b.target ? 'cursor-pointer z-10 hover:scale-105' : 'z-0'}`}
                  style={{ transform: b.target && activeBook ? 'translateY(-20px)' : 'translateY(0)' }}
                >
                  <span className={`font-dm font-bold text-[9px] md:text-xs tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 ${b.target ? 'text-deep-black' : 'text-white/30'}`}>
                    {b.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full h-4 bg-[#111] border-t-2 border-[#222]" />
            <div className="w-full h-8 bg-[#0a0a0a]" />

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeBook ? 'max-h-[600px] mt-12 opacity-100' : 'max-h-0 opacity-0 mt-0'}`}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 bg-deep-black p-8 md:p-12 border border-white/5">
                <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-[#0a0a0a]">
                  <img src="/images/book-cover-perfect-years.jpg" alt="Perfect Years" className="w-full h-full object-cover grayscale-[20%]" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-dm font-black text-4xl md:text-6xl tracking-tighter text-off-white mb-6">PERFECT<br /><span className="text-conflagrator-red">YEARS</span></h3>
                  <CTAButton href="/book">Read the Book</CTAButton>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════
   CHAPTER 3: THE BICYCLE
══════════════════════════════ */
const ChapterBicycle: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const polaroids = [
    { src: '/images/bicycle-story-1.jpg', rot: '-rotate-2', caption: 'THE LAB. JULY 31.' },
    { src: '/images/bicycle-story-2.jpg', rot: 'rotate-2', caption: 'THE BICYCLE.' },
    { src: '/images/bicycle-story-3.jpg', rot: '-rotate-1', caption: 'DANIEL SAID YES.' },
    { src: '/images/bicycle-story-4.jpg', rot: 'rotate-3', caption: '10 YEARS. ONE THURSDAY.' },
    { src: '/images/bicycle-story-5.jpg', rot: '-rotate-2', caption: 'FINALLY.' },
  ];

  return (
    <section className="py-24 md:py-40 bg-deep-black overflow-hidden">
      <div className="px-6 md:px-16 lg:px-24 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <ScrollReveal>
          <p className="font-dm font-black text-6xl md:text-8xl tracking-tighter leading-[0.85] text-off-white">
            THE<br /><span className="text-conflagrator-red">BICYCLE.</span>
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="flex gap-4">
            <button onClick={() => scroll(-1)} className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <ArrowLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <ArrowRight size={20} />
            </button>
          </div>
        </ScrollReveal>
      </div>

      <div className="w-full mb-24 overflow-x-auto no-scrollbar" ref={scrollRef}>
        <div className="relative flex items-start pt-16 px-6 md:px-16 lg:px-24 gap-8 md:gap-16 pb-12 w-max min-w-full">
          <svg className="absolute top-8 left-0 w-full h-[100px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 2000 100">
            <path d="M0,50 Q250,80 500,50 T1000,50 T1500,50 T2000,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          </svg>
          {polaroids.map((p, i) => (
            <div key={i} className={`flex-shrink-0 transition-transform duration-300 hover:scale-105 cursor-grab active:cursor-grabbing ${p.rot}`}>
              <div className="w-2 h-6 bg-[#333] mx-auto -mb-2 z-10 relative border border-white/10" />
              <div className="bg-[#F4F3F0] p-4 pb-12 w-[240px] md:w-[300px]">
                <div className="w-full bg-[#111]">
                  <img src={p.src} alt="" className="w-full h-auto object-contain grayscale-[20%]" />
                </div>
                <p className="font-dm font-bold text-sm md:text-base text-deep-black text-center mt-6 tracking-wide">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <ScrollReveal>
          <p className="font-dm font-black text-5xl md:text-8xl tracking-tight leading-[0.88] text-off-white uppercase">
            NOW I CAN<br /><span className="text-conflagrator-red">FINALLY</span><br />RIDE.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════
   CHAPTER 4: THE BUILDER
══════════════════════════════ */
const ChapterBuilder: React.FC = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="py-24 md:py-40 px-6 md:px-24 lg:px-32 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <p className="font-dm font-black text-4xl md:text-7xl text-off-white leading-[0.9] tracking-tighter mb-20">
            HE DIDN'T WAIT FOR<br /><span className="text-conflagrator-red">THE WORLD TO CHANGE.</span>
          </p>
        </ScrollReveal>

        <div className="relative h-[480px] md:h-[550px] w-full max-w-4xl mx-auto perspective-[1200px]">
          <div className={`absolute inset-0 bg-[#0a0a0a] border border-white/10 p-8 md:p-16 flex flex-col justify-between transition-all duration-700 ease-in-out ${flipped ? 'z-20 translate-x-0 rotate-0' : 'z-10 translate-x-4 translate-y-4 rotate-3'}`}>
            <h3 className="font-dm font-black text-6xl md:text-9xl absolute top-8 right-8 text-white/5 origin-top-right tracking-tighter pointer-events-none">IGNITION</h3>
            <div className="relative z-10 transition-opacity duration-500 delay-200" style={{ opacity: flipped ? 1 : 0 }}>
              <h3 className="font-dm font-black text-5xl md:text-7xl text-off-white tracking-tighter mb-6">IGNITION</h3>
              <p className="font-dm font-medium text-lg md:text-xl text-white/60 max-w-lg leading-relaxed">Every person carries a fire inside them. Most just need someone to help them find it.</p>
            </div>
            <div className="relative z-10 flex justify-between items-center mt-12" style={{ opacity: flipped ? 1 : 0 }}>
              <button onClick={() => setFlipped(false)} className="bg-white/10 text-off-white font-dm font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-white/20 transition-colors">← Back to KLiP</button>
            </div>
          </div>

          <div className={`absolute inset-0 bg-conflagrator-red p-8 md:p-16 flex flex-col justify-between transition-all duration-700 ease-in-out origin-bottom-left ${flipped ? 'z-10 -translate-x-[110%] -rotate-6 opacity-0' : 'z-20 translate-x-0 rotate-0'}`}>
            <div className="relative z-10">
              <h3 className="font-dm font-black text-5xl md:text-7xl text-off-white tracking-tighter mb-6">KLiP</h3>
              <p className="font-dm font-medium text-lg md:text-xl text-off-white/90 max-w-lg leading-relaxed">Faith and governance were never supposed to be strangers. Built for everyone who felt that pull.</p>
            </div>
            <div className="relative z-10 flex justify-between items-center w-full mt-12">
              <button className="bg-deep-black text-off-white font-dm font-bold text-xs md:text-sm tracking-widest uppercase px-6 md:px-8 py-3 md:py-4 hover:bg-black transition-colors" onClick={() => window.location.href = '/klip'}>Explore KLiP</button>
              <button onClick={() => setFlipped(true)} className="font-dm font-bold text-xs md:text-sm uppercase tracking-widest text-off-white/60 hover:text-off-white transition-colors py-4">Swipe Card →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════
   CHAPTER 5: QUOTES
══════════════════════════════ */
const ChapterQuotes: React.FC = () => {
  const quotes = [
    { n: '01', text: 'Willing to fall means ready to fly.', attr: 'The Bicycle Lesson', bg: 'bg-[#EAE8E3]', textCol: 'text-deep-black', iconCol: 'text-deep-black/60' },
    { n: '02', text: 'Keep moving. Balance finds you.', attr: 'July 31, 2025', bg: 'bg-conflagrator-red', textCol: 'text-off-white', iconCol: 'text-off-white/70' },
    { n: '03', text: 'Eyes ahead. Always.', attr: 'The Conflagrator', bg: 'bg-[#B30000]', textCol: 'text-off-white', iconCol: 'text-off-white/60' },
    { n: '04', text: 'The intersection of technology and leadership is where nation-building begins.', attr: 'Oreoluwa Salami', bg: 'bg-[#330000]', textCol: 'text-off-white', iconCol: 'text-off-white/50' },
  ];

  return (
    <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 bg-deep-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {quotes.map((q, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <div className={`p-10 md:p-16 h-[350px] md:h-[400px] flex flex-col justify-between border border-white/5 ${q.bg} ${q.textCol}`}>
              <span className="font-dm font-black text-6xl md:text-8xl tracking-tighter opacity-20">{q.n}</span>
              <div>
                <p className="font-dm font-black text-3xl md:text-4xl leading-[1.1] tracking-tighter mb-8">{q.text}</p>
                <div className="flex items-center gap-3">
                  <Flame size={16} className={q.iconCol} />
                  <span className={`font-dm font-bold text-xs tracking-widest uppercase ${q.iconCol}`}>{q.attr}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

/* ══════════════════════════════
   HOME ASSEMBLY
   Divider strategy per gap:
   Hero → Origins      : MacroSpace      (luxury silence)
   Origins → Author    : ColorBlock      (bg shift #050505 → #0d0d0d)
   Author → Bicycle    : EditorialLine   (magazine chapter break)
   Bicycle → Builder   : ColorBlock      (bg shift back)
   Builder → Quotes    : MacroSpace      (silence before final act)
══════════════════════════════ */
const Home: React.FC = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<any | null>(null);
  const { items: galleryItems } = usePersonalGallery();

  const displayCarouselItems = React.useMemo(() => {
    const list = [...galleryItems];
    if (pendingUpload) {
      list.unshift({
        filename: pendingUpload.public_id || pendingUpload.public_id || 'pending-preview',
        type: pendingUpload.resource_type === 'video' ? 'video' : 'image',
        src: pendingUpload.secure_url || pendingUpload.secureUrl || pendingUpload.url,
        uploaded: new Date().toISOString(),
      });
    }
    return list;
  }, [galleryItems, pendingUpload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="bg-deep-black">
      <Hero />
      <MacroSpace />
      <ChapterOrigins />
      <ColorBlock from="#050505" to="#0d0d0d" />
      <section className="bg-[#0d0d0d] px-6 md:px-16 lg:px-24 pt-16 md:pt-24 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <ScrollReveal>
                <p className="font-dm text-[10px] md:text-xs uppercase tracking-[0.28em] text-white/35 mb-3">
                  Personal archive
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="font-dm font-black text-4xl md:text-7xl tracking-tighter leading-[0.86] text-off-white max-w-4xl">
                  MOMENTS CHERISHED<br /><span className="text-conflagrator-red">BEYOND WORDS.</span>
                </p>
              </ScrollReveal>
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-3">
              <button
                onClick={() => setUploadOpen(true)}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/8 hover:bg-white/14 text-white/45 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Drop your own moments"
              >
                <Plus size={9} strokeWidth={2.75} />
              </button>
              <button
                onClick={() => setGalleryOpen(true)}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/12 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Expand all uploaded moments"
              >
                <Maximize2 size={9} strokeWidth={2.75} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel with subtle upload trigger */}
      <div className="relative">
        <ImageCarousel images={displayCarouselItems} ticker speed={55} paused={galleryOpen} />
      </div>

      <ColorBlock from="#0d0d0d" to="#0d0d0d" />
      <ChapterAuthor />
      <EditorialLine />
      <ChapterBicycle />
      <ColorBlock from="#050505" to="#0d0d0d" />
      <ChapterBuilder />
      <MacroSpace />
      <ChapterQuotes />

      {/* Masonry gallery modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 md:py-12">
          <div className="absolute inset-0 bg-black" onClick={() => setGalleryOpen(false)} />
          <div className="relative z-60 w-full max-w-7xl mx-4 md:mx-8 bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-black/95 px-5 md:px-8 py-4 backdrop-blur-sm">
              <div>
                <p className="font-dm text-[10px] uppercase tracking-[0.28em] text-white/30 mb-1">Expanded archive</p>
                <h2 className="font-dm font-black text-2xl md:text-4xl tracking-tighter text-off-white">All uploaded moments</h2>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/18 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close expanded archive"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 md:p-8">
              {(galleryItems.length === 0 && !pendingUpload) ? (
                <div className="text-white/40 font-dm text-sm border border-white/10 p-6 rounded-lg">No uploaded moments yet.</div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-4 [column-fill:_balance]">
                  {([...(pendingUpload ? [{
                    filename: pendingUpload.public_id || 'pending-preview',
                    type: pendingUpload.resource_type === 'video' ? 'video' : 'image',
                    src: pendingUpload.secure_url || pendingUpload.secureUrl || pendingUpload.url,
                    uploaded: new Date().toISOString(),
                  }] : []), ...galleryItems]).map(item => (
                    <figure key={item.filename} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-lg">
                      {item.type === 'video' ? (
                        <video src={item.src} autoPlay loop muted playsInline className="w-full h-auto block" />
                      ) : (
                        <img src={item.src} alt={item.filename} className="w-full h-auto block" loading="lazy" />
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setUploadOpen(false)} />
          <div className="relative z-60 w-full max-w-2xl mx-4 md:mx-0 bg-deep-black border border-white/10 rounded-lg p-6 md:p-10">
            <button onClick={() => setUploadOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={18} />
            </button>
            <div className="mt-2">
              <UploadZone
                onUploadMessage={(m: string) => setToast(m)}
                onUploadSuccess={(res) => {
                  setUploadOpen(false);
                  setPendingUpload(res || null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-60 bg-teal/10 border border-teal/30 text-teal px-4 py-2 rounded font-dm text-sm">
          {toast}
        </div>
      )}

      {/* Verification / Consent modal shown after upload completes */}
      {pendingUpload && (
        <div className="fixed inset-0 z-70 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPendingUpload(null)} />
          <div className="relative z-80 w-full max-w-lg mx-4 md:mx-0 bg-deep-black border border-white/10 rounded-lg p-6 md:p-8">
            <h3 className="font-dm font-bold text-lg text-off-white mb-3">Confirm upload</h3>
            <div className="mb-4">
              {pendingUpload.resource_type === 'video' ? (
                <video src={pendingUpload.secure_url} controls className="w-full rounded-md" />
              ) : (
                <img src={pendingUpload.secure_url || pendingUpload.secureUrl || pendingUpload.url} alt="preview" className="w-full rounded-md" />
              )}
            </div>
            <label className="flex items-start gap-3 mb-4">
              <input type="checkbox" className="mt-1" id="consent" />
              <div className="text-[13px] text-white/70">I consent to my photo being displayed publicly on this website if approved by an admin.</div>
            </label>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setPendingUpload(null)} className="px-4 py-2 border border-white/10 text-white/60">Cancel</button>
              <button
                onClick={() => {
                  setToast('Upload confirmed. Awaiting admin approval.');
                  setPendingUpload(null);
                }}
                className="px-4 py-2 bg-conflagrator-red text-white rounded"
              >
                Confirm and send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;