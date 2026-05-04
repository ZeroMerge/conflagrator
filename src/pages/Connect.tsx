import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '@/components/ScrollReveal';
import { Instagram, Linkedin, Mail, Check, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════
   CROSSHAIR SOCIAL GRID (Mobile Scaled)
══════════════════════════════ */
const SocialGrid: React.FC = () => {
  const socials = [
    { icon: Instagram, label: 'Instagram', handle: '@theconflagrator', href: 'https://instagram.com/theconflagrator' },
    { icon: Linkedin, label: 'LinkedIn', handle: 'Oreoluwa Salami', href: 'https://linkedin.com/in/oreoluwasalami' },
    { icon: Mail, label: 'Email', handle: 'oreoluwasalami7@gmail.com', href: 'mailto:oreoluwasalami7@gmail.com' },
  ];

  return (
    <div className="flex flex-col border-t border-white/10 w-full mt-12 md:mt-16 lg:mt-0">
      {socials.map((s, i) => (
        <a
          key={i}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative border-b border-white/10 p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-off-white transition-colors duration-500 cursor-pointer"
        >
          {/* Architectural Crosshairs */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 translate-x-px -translate-y-px" />

          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-0">
            <s.icon className="w-5 h-5 md:w-7 md:h-7 text-white/30 group-hover:text-deep-black transition-colors duration-500" strokeWidth={1.5} />
            <span className="font-dm font-black text-xl md:text-4xl text-off-white group-hover:text-deep-black uppercase tracking-tighter transition-colors duration-500">
              {s.label}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="font-dm font-bold text-[10px] md:text-xs tracking-widest uppercase text-white/40 group-hover:text-deep-black transition-colors duration-500">
              {s.handle}
            </span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-conflagrator-red transform -translate-x-2 md:-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
        </a>
      ))}
    </div>
  );
};

/* ══════════════════════════════
   CONVERSATIONAL TERMINAL FORM (Anti-Clip Baseline)
══════════════════════════════ */
const TerminalForm: React.FC = () => {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [data, setData] = useState({ name: '', email: '', message: '' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');

    try {
      // WEB3FORMS INTEGRATION
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "YOUR_ACCESS_KEY_HERE",
          subject: "New Contact from The Conflagrator",
          name: data.name,
          email: data.email,
          message: data.message
        })
      });

      if (response.ok) {
        setState('sent');
      } else {
        setState('idle');
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setState('idle');
    }
  };

  /* Geometric Success State */
  if (state === 'sent') {
    return (
      <div className="flex flex-col items-start justify-center min-h-[500px] animate-in fade-in duration-700 w-full max-w-4xl">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-conflagrator-red flex items-center justify-center mb-8 md:mb-10 shadow-[10px_10px_0px_rgba(255,255,255,0.05)] md:shadow-[20px_20px_0px_rgba(255,255,255,0.05)]">
          <Check className="w-8 h-8 md:w-12 md:h-12 text-deep-black" strokeWidth={3} />
        </div>
        <h3 className="font-dm font-black text-5xl md:text-8xl lg:text-[120px] text-off-white tracking-tighter leading-none mb-6">RECEIVED.</h3>
        <p className="font-dm font-bold text-xs md:text-sm tracking-widest uppercase text-white/40 mb-12 md:mb-16">The fire spreads. Expect a reply soon.</p>
        <button
          onClick={() => { setState('idle'); setData({ name: '', email: '', message: '' }); }}
          className="font-dm font-bold text-[10px] md:text-xs tracking-widest uppercase text-white/40 hover:text-off-white transition-colors"
        >
          ← Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-5xl">
      {/* Conversational Inputs - Flex Wrap ensures flawless baselines and no clipping */}
      <div className="flex flex-wrap items-end gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-10 font-dm font-black text-3xl md:text-5xl lg:text-[64px] text-off-white tracking-tighter mb-16 md:mb-24">

        <span className="leading-none pb-2">Hello, my name is</span>
        <input
          type="text"
          name="name"
          required
          value={data.name}
          onChange={onChange}
          placeholder="[ Your Name ]"
          className="w-full lg:w-auto lg:flex-1 min-w-[250px] md:min-w-[320px] bg-transparent border-b-[3px] border-white/10 focus:border-conflagrator-red outline-none text-conflagrator-red placeholder:text-white/20 transition-colors duration-300 px-2 pb-2 leading-none"
        />

        <span className="leading-none pb-2">and you can reach me at</span>
        <input
          type="email"
          name="email"
          required
          value={data.email}
          onChange={onChange}
          placeholder="[ Your Email ]"
          className="w-full lg:w-auto lg:flex-1 min-w-[250px] md:min-w-[400px] bg-transparent border-b-[3px] border-white/10 focus:border-conflagrator-red outline-none text-conflagrator-red placeholder:text-white/20 transition-colors duration-300 px-2 pb-2 leading-none"
        />

        <span className="leading-none pb-2 hidden lg:inline">.</span>
      </div>

      {/* Message Area */}
      <div className="mb-16 md:mb-24">
        <p className="font-dm font-black text-3xl md:text-5xl lg:text-6xl leading-[1.2] text-off-white tracking-tighter mb-8">
          I want to talk about...
        </p>
        <textarea
          name="message"
          required
          rows={3}
          value={data.message}
          onChange={onChange}
          placeholder="[ Your vision, event, or project ]"
          className="w-full bg-transparent border-l-4 border-white/10 focus:border-conflagrator-red outline-none font-dm font-medium text-xl md:text-3xl lg:text-4xl text-conflagrator-red leading-tight placeholder:text-white/20 pl-6 md:pl-8 py-2 resize-none transition-colors duration-300"
        />
      </div>

      {/* Guillotine Submit Block */}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="relative w-full border border-white/20 p-6 md:p-12 overflow-hidden group text-left cursor-pointer disabled:opacity-50"
      >
        <div className="absolute inset-0 bg-conflagrator-red origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.87,0,0.13,1)]" />
        <div className="relative z-10 flex justify-between items-center">
          <span className="font-dm font-black text-xl md:text-4xl lg:text-5xl text-off-white tracking-tighter uppercase group-hover:text-deep-black transition-colors duration-300 delay-100">
            {state === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE'}
          </span>
          <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-white/30 group-hover:text-deep-black transition-colors duration-300 delay-100" />
        </div>
      </button>
    </form>
  );
};

/* ══════════════════════════════
   CONNECT PAGE ASSEMBLY
══════════════════════════════ */
const Connect: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Kinetic Scroll Velocity Marquee
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(marqueeRef.current, {
        xPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-deep-black min-h-[100svh] flex flex-col relative overflow-hidden">

      {/* Kinetic Background Marquee (Subliminal) */}
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0 opacity-10">
        <div ref={marqueeRef} className="flex gap-16 whitespace-nowrap will-change-transform">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-dm font-black text-[120px] md:text-[250px] lg:text-[300px] tracking-tighter text-transparent"
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}
            >
              INITIATE CONTACT — BUILD TOGETHER — SPARK THE FIRE —&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <section className="pt-32 pb-12 md:pt-48 md:pb-24 px-6 md:px-16 lg:px-24 relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <ScrollReveal delay={0.1}>
            <h1 className="font-dm font-black text-6xl md:text-9xl lg:text-[140px] tracking-tighter leading-[0.85] text-off-white">
              LET'S<br /><span className="text-conflagrator-red">TALK.</span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Form & Socials Layout */}
      <section className="flex-1 px-6 md:px-16 lg:px-24 pb-32 relative z-10 border-t border-white/5 pt-16 md:pt-32">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between gap-16 xl:gap-32">

          {/* Conversational Terminal Form Area */}
          <div className="flex-[2] w-full">
            <ScrollReveal delay={0.2}>
              <TerminalForm />
            </ScrollReveal>
          </div>

          {/* Crosshair Social Grid */}
          <div className="w-full xl:max-w-md">
            <ScrollReveal delay={0.3}>
              <span className="font-dm font-bold text-[10px] md:text-xs tracking-widest uppercase text-white/30 block mb-6">Find him here</span>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <SocialGrid />
            </ScrollReveal>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Connect;