import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════
   THE MONOLITH WORDS
   We define the text and the specific index (0-based) 
   of the letter that should be italicized.
══════════════════════════════ */
const MONOLITH_WORDS = [
  { text: "BUILD", italicIndex: 1 },   // B *U* ILD
  { text: "LEAD", italicIndex: 1 },    // L *E* AD
  { text: "IGNITE", italicIndex: 3 },  // IGN *I* TE
  { text: "GOVERN", italicIndex: 3 },  // GOV *E* RN
  { text: "SERVE", italicIndex: 1 },   // S *E* RVE
];

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ══════════════════════════════
   CONCEPT 2: THE MONOLITHIC GATEWAY (CRYPTOGRAPHIC MORPH - SOLID GRAYS)
══════════════════════════════ */
const Footer: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const [displayChars, setDisplayChars] = useState(
    MONOLITH_WORDS[0].text.split('').map((char, i) => ({
      char,
      isItalic: i === MONOLITH_WORDS[0].italicIndex
    }))
  );

  // Cryptographic Scramble Logic
  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % MONOLITH_WORDS.length;
      const targetWord = MONOLITH_WORDS[nextIndex];
      const targetText = targetWord.text;

      let iteration = 0;
      const maxIterations = 15; // Number of scramble frames

      const scrambleInterval = setInterval(() => {
        setDisplayChars(targetText.split('').map((char, i) => {
          // Unveil characters gracefully from left to right over the scramble duration
          const revealThreshold = (i / targetText.length) * (maxIterations * 0.7);

          if (iteration >= revealThreshold) {
            // Lock in the correct character and its italic styling
            return { char, isItalic: i === targetWord.italicIndex };
          }

          // Show a random scrambling character
          return {
            char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
            isItalic: false
          };
        }));

        iteration++;
        if (iteration > maxIterations) {
          clearInterval(scrambleInterval);
          currentIndex = nextIndex;
        }
      }, 40); // 40ms per frame for a fast, mechanical look

    }, 4000); // Trigger a new word every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Parallax effect on the massive text container
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!parallaxRef.current || !containerRef.current) return;

      gsap.fromTo(parallaxRef.current,
        { y: -100, opacity: 0.5 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={containerRef}
      className="relative h-[70svh] bg-[#0A0A0A] flex flex-col justify-between overflow-hidden border-t border-conflagrator-red/30"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FFF 0, #FFF 1px, transparent 1px, transparent 4px)' }} />

      {/* Top Navigation Row (Well-balanced padding) */}
      <div className="relative z-10 w-full p-8 md:p-16 flex justify-between items-start">

        {/* Left: Core Navigation */}
        <div className="flex flex-col gap-2">
          <span className="font-dm font-bold text-[9px] tracking-[0.25em] uppercase text-conflagrator-red mb-2">
            Index
          </span>
          <Link to="/" className="font-dm font-bold text-xs tracking-widest uppercase text-white/50 hover:text-off-white transition-colors w-fit">
            Home
          </Link>
          <Link to="/klip" className="font-dm font-bold text-xs tracking-widest uppercase text-white/50 hover:text-off-white transition-colors w-fit">
            KLiP
          </Link>
          <Link to="/book" className="font-dm font-bold text-xs tracking-widest uppercase text-white/50 hover:text-off-white transition-colors w-fit">
            Perfect Years
          </Link>
        </div>

        {/* Right: External Network */}
        <div className="flex flex-col gap-2 text-right items-end">
          <span className="font-dm font-bold text-[9px] tracking-[0.25em] uppercase text-conflagrator-red mb-2">
            Network
          </span>
          <a href="https://linkedin.com/in/oreoluwasalami" target="_blank" rel="noopener noreferrer" className="font-dm font-bold text-xs tracking-widest uppercase text-white/50 hover:text-off-white transition-colors w-fit">
            LinkedIn ↗
          </a>
          <a href="https://instagram.com/theconflagrator" target="_blank" rel="noopener noreferrer" className="font-dm font-bold text-xs tracking-widest uppercase text-white/50 hover:text-off-white transition-colors w-fit">
            Instagram ↗
          </a>
        </div>

      </div>

      {/* The Monolith Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <div ref={parallaxRef} className="flex items-center justify-center w-full">

          {/* Cryptographic Scramble Container */}
          <div
            className="font-dm text-[22vw] leading-none tracking-tighter select-none whitespace-nowrap flex items-baseline"
            style={{ textShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
          >
            {displayChars.map((item, index) => (
              <span
                key={index}
                className={item.isItalic ? 'italic font-bold text-[#444444] pr-[1vw]' : 'font-black text-[#888888]'}
              >
                {item.char}
              </span>
            ))}
            {/* The Red Full Stop */}
            <span className="font-black text-conflagrator-red -ml-[1vw]">.</span>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;