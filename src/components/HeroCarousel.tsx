import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAgeCounter } from '@/hooks/useAgeCounter';

gsap.registerPlugin(ScrollTrigger);

const HeroCarousel: React.FC = () => {
  const age = useAgeCounter();
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Portrait parallaxes slower than text
      if (portraitRef.current) {
        gsap.to(portraitRef.current, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
      // Name text drifts slightly up faster
      if (nameRef.current) {
        gsap.to(nameRef.current, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
      // Fade in on load
      gsap.fromTo([nameRef.current, metaRef.current],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15, delay: 0.2 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-deep-black"
      style={{ height: '100svh', minHeight: '600px' }}
    >
      {/* Portrait — fills right 65%, behind the text */}
      <div
        ref={portraitRef}
        className="absolute right-0 top-0 h-full w-full md:w-[65%]"
        style={{ willChange: 'transform' }}
      >
        <img
          src="/images/hero-portrait-1.jpg"
          alt="Salami Oreoluwa"
          className="w-full h-full object-cover object-top"
          style={{
            filter: 'grayscale(60%) contrast(1.1)',
            mixBlendMode: 'luminosity',
            opacity: 0.6,
          }}
        />
        {/* Gradient fade on left so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #0A0A0A 0%, #0A0A0A 20%, transparent 60%)',
          }}
        />
        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, #0A0A0A, transparent)' }}
        />
      </div>

      {/* Name — bleeds off left and right edges */}
      <div
        ref={nameRef}
        className="absolute inset-0 flex flex-col justify-center"
        style={{ willChange: 'transform', paddingLeft: '4vw' }}
      >
        {/* Small red identity label */}
        <span
          className="label-text text-conflagrator-red mb-4 block"
          style={{ fontSize: '10px', letterSpacing: '0.22em' }}
        >
          THE CONFLAGRATOR
        </span>

        {/* Giant name — bleed text */}
        <h1
          className="hero-name-text text-off-white leading-none"
          style={{
            fontSize: 'clamp(64px, 19vw, 220px)',
            letterSpacing: '-0.03em',
            lineHeight: 0.88,
          }}
        >
          <span className="block" style={{ color: '#F5F5F5' }}>SALAMI</span>
          <span className="block" style={{ color: '#F5F5F5' }}>
            OREL<span style={{ color: '#E3000F' }}>U</span>WA
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="pull-quote text-off-white/60 mt-6"
          style={{ fontSize: 'clamp(13px, 1.8vw, 18px)', maxWidth: '340px' }}
        >
          Igniting the fire from within to without.
        </p>
      </div>

      {/* Bottom meta — age counter + scroll cue */}
      <div
        ref={metaRef}
        className="absolute bottom-8 left-0 right-0 flex items-end justify-between px-5 md:px-12"
      >
        <div>
          <span className="label-text text-muted-grey" style={{ fontSize: '10px' }}>
            Born May 3, 2004
          </span>
          <p
            className="font-dm font-black text-off-white mt-1"
            style={{ fontSize: 'clamp(26px, 7vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {age} <span className="text-conflagrator-red">years</span> of fire.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 animate-bounce-y">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="label-text text-teal" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
