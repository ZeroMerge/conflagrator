import React, { useEffect, useLayoutEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { kliPEvents, klipTeam, klipValues } from '@/data/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ══════════════════════════════
   1. ETHEREAL MONOLITH HEADER
══════════════════════════════ */
const KlipHeader: React.FC = () => {
    return (
        <section className="relative min-h-[80svh] flex flex-col items-center justify-center text-center bg-deep-black overflow-hidden px-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_40%,rgba(0,137,123,0.08)_0%,transparent_55%),radial-gradient(ellipse_55%_65%_at_50%_55%,rgba(227,0,15,0.06)_0%,transparent_72%)] pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-surface-black/30 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-12 md:mt-0">
                <ScrollReveal>
                    {/* Clean, typographical lowercase 'i' in Teal */}
                    <h1 className="font-dm font-black text-[28vw] md:text-[180px] lg:text-[240px] leading-[0.8] tracking-tighter text-off-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] mb-6 flex items-baseline justify-center">
                        <span>KL</span>
                        <span className="text-[#00897B] lowercase mx-1 md:mx-2">i</span>
                        <span>P</span>
                    </h1>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                    <p className="font-dm font-bold text-xs md:text-sm tracking-[0.3em] uppercase text-white/40 mb-12">
                        Kingdom Leaders in Politics
                    </p>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                    <p className="font-dm font-bold text-xl md:text-4xl text-off-white leading-tight tracking-tight">
                        Passionate about God and governance?<br />
                        <span className="text-conflagrator-red">The time is now.</span>
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
};

/* ══════════════════════════════
   2. IGNITE VISION TEAM GRID
══════════════════════════════ */
const TeamGrid: React.FC = () => {
    return (
        <section className="bg-surface-black py-20 md:py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

            <div className="px-6 md:px-16 lg:px-24 max-w-7xl mx-auto mb-12 md:mb-16 text-center relative z-10">
                <ScrollReveal>
                    <span className="font-dm font-bold text-[10px] md:text-xs tracking-widest uppercase text-conflagrator-red block mb-4 md:mb-6">The People</span>
                    <h2 className="font-dm font-black text-4xl md:text-7xl tracking-tighter text-off-white uppercase leading-[0.9]">
                        BOUNDED BY<br /><span className="text-conflagrator-red">IGNITE VISION.</span>
                    </h2>
                </ScrollReveal>
            </div>

            <div className="w-full bg-deep-black overflow-hidden py-4 flex gap-8 whitespace-nowrap mb-8 md:mb-12 select-none relative z-10">
                <div className="flex gap-8 md:gap-12 animate-drift">
                    {[...klipValues, ...klipValues, ...klipValues].map((val, i) => (
                        <span key={i} className="font-dm font-black text-[10px] md:text-sm tracking-widest uppercase text-white/30">
                            {val} <span className="text-conflagrator-red ml-8 md:ml-12">✦</span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 w-full relative z-10">
                {klipTeam.map((member, i) => (
                    <a
                        key={i}
                        href={member.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-[3/4] overflow-hidden bg-deep-black block transition-transform duration-300 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-[#0a0a0a] grayscale group-hover:grayscale-0 transition-all duration-500">
                            <img
                                src={member.img}
                                alt={member.name}
                                className="w-full h-full object-cover opacity-55 md:opacity-35 group-hover:opacity-100 transition-opacity duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <p className="font-dm font-black text-sm md:text-2xl tracking-tighter text-off-white uppercase mb-1 leading-tight">{member.name}</p>
                            <p className="font-dm font-bold text-[8px] md:text-[9px] tracking-widest uppercase text-conflagrator-red">{member.role}</p>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
};

/* ══════════════════════════════
   3. ARCHITECTURAL EVENTS GRID + MODAL
══════════════════════════════ */
const EventArchive: React.FC = () => {
    const [selectedEvent, setSelectedEvent] = useState<(typeof kliPEvents)[number] | null>(null);

    useEffect(() => {
        if (!selectedEvent) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedEvent(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedEvent]);

    return (
        <section className="py-20 md:py-28 bg-deep-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_40%_at_50%_0%,rgba(227,0,15,0.06)_0%,transparent_60%)] pointer-events-none" />

            {/* Event Flyer Modal */}
            {selectedEvent && selectedEvent.image && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-start md:items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 overflow-y-auto"
                    onClick={() => setSelectedEvent(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="fixed md:absolute top-4 right-4 md:top-12 md:right-12 z-[1001] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 shadow-lg backdrop-blur-sm transition-colors hover:text-white"
                        aria-label="Close image preview"
                    >
                        <X size={24} />
                    </button>

                    <div
                        className="relative w-full max-w-6xl grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] items-stretch pt-16 md:pt-0"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={selectedEvent.image}
                            alt={selectedEvent.title}
                            className="w-full max-h-[62svh] md:max-h-[80svh] object-contain shadow-2xl border border-white/10 bg-black/60"
                        />

                        <div className="bg-surface-black border border-white/10 p-6 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto">
                            <div>
                                <span className="font-dm font-bold text-[10px] md:text-xs tracking-[0.22em] uppercase text-conflagrator-red block mb-3">Event Archive</span>
                                <h3 className="font-dm font-black text-2xl md:text-4xl text-off-white uppercase leading-[0.95] tracking-tighter mb-4">
                                    {selectedEvent.title}
                                </h3>
                                <p className="font-dm text-sm md:text-base leading-relaxed text-white/60">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-4 mt-6">
                                <div className="flex items-start gap-2 text-white/45">
                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                    <span className="font-dm text-[10px] md:text-xs tracking-[0.2em] uppercase leading-relaxed">
                                        {selectedEvent.location || 'Virtual / TBA'}
                                    </span>
                                </div>
                                <div className="font-dm font-bold text-[10px] md:text-xs tracking-[0.22em] uppercase text-off-white/70">
                                    {selectedEvent.date}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-6 md:px-16 lg:px-24 max-w-7xl mx-auto mb-12 md:mb-16 relative z-10">
                <ScrollReveal>
                    <h2 className="font-dm font-black text-4xl md:text-7xl tracking-tighter text-off-white uppercase leading-[0.9]">
                        WHAT WE<br /><span className="text-conflagrator-red">ARE BUILDING.</span>
                    </h2>
                </ScrollReveal>
            </div>

            <div className="w-full relative z-10 px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto gap-px bg-white/5">
                    {kliPEvents.map((ev, i) => (
                        <ScrollReveal key={ev.id} delay={i * 0.1}>
                            <div
                                onClick={() => ev.image && setSelectedEvent(ev)}
                                className={`group text-left relative p-8 md:p-12 flex flex-col justify-between overflow-hidden bg-deep-black transition-all duration-300 ease-out h-full ${ev.image ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04)_0%,transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_30%,rgba(0,0,0,0.35)_100%)]" />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(90deg,rgba(0,137,123,0.08)_0%,transparent_24%,transparent_76%,rgba(227,0,15,0.08)_100%)]" />

                                <div className="absolute left-6 top-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                <div className="absolute left-6 bottom-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />

                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 -translate-x-px -translate-y-px hidden md:block" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 translate-x-px -translate-y-px hidden md:block" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 -translate-x-px translate-y-px hidden md:block" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 translate-x-px translate-y-px hidden md:block" />

                                <div className="relative z-10 flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-8">
                                        <span className="font-dm font-bold text-[10px] tracking-[0.2em] uppercase text-white/50">{ev.date}</span>
                                    </div>

                                    <div>
                                        <h3 className="font-dm font-black text-2xl md:text-4xl text-off-white tracking-tighter leading-[1.1] mb-6 group-hover:text-conflagrator-red transition-colors duration-300">
                                            {ev.title}
                                        </h3>
                                        <p className="font-dm text-sm text-white/50 leading-relaxed max-w-sm mb-8">
                                            {ev.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-auto flex flex-col md:flex-row justify-between items-start md:items-center border-t border-white/10 pt-5 md:pt-6 gap-4 md:gap-4 w-full">
                                    <div className="flex items-start md:items-center gap-2 text-white/40 w-full md:w-auto">
                                        <MapPin size={14} className="shrink-0 mt-0.5 md:mt-0" />
                                        <span className="font-dm font-bold text-[9px] md:text-[10px] tracking-widest uppercase leading-snug break-words">
                                            {ev.location || 'Virtual / TBA'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 font-dm font-bold text-[9px] md:text-[10px] tracking-widest uppercase text-off-white group-hover:text-[#00897B] transition-colors shrink-0">
                                        {ev.image ? 'View Details' : 'Archive only'}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ══════════════════════════════
   MAIN PAGE ASSEMBLY
══════════════════════════════ */
const Klip: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'main' | 'events'>('main');
    const tabsShellRef = React.useRef<HTMLDivElement | null>(null);
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const updatePill = () => {
            const shell = tabsShellRef.current;
            if (!shell) return;

            const activeTrigger = shell.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]');
            if (!activeTrigger) return;

            const shellRect = shell.getBoundingClientRect();
            const triggerRect = activeTrigger.getBoundingClientRect();

            setPillStyle({
                left: triggerRect.left - shellRect.left,
                width: triggerRect.width,
            });
        };

        updatePill();
        window.addEventListener('resize', updatePill);
        return () => window.removeEventListener('resize', updatePill);
    }, [activeTab]);

    return (
        <div className="bg-deep-black min-h-[100svh]">
            <KlipHeader />

            <div className="px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value === 'events' ? 'events' : 'main')}
                    className="mx-auto max-w-7xl"
                >
                    <div ref={tabsShellRef} className="relative mx-auto w-full max-w-2xl rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

                        {/* Solid Teal Pill (z-0) - GLOW REMOVED */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 top-1 bottom-1 z-0 rounded-full bg-[#00897B] transition-[transform,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{
                                width: pillStyle.width,
                                transform: `translateX(${pillStyle.left}px)`,
                            }}
                        />

                        <TabsList className="relative z-10 grid h-auto w-full grid-cols-2 bg-transparent p-0 border-none">
                            <TabsTrigger
                                value="main"
                                className="relative z-20 rounded-full px-3 py-3 md:px-5 md:py-4 text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-white/50 transition-all duration-300 hover:text-off-white active:scale-[0.97] data-[state=active]:text-off-white"
                            >
                                Main Chapter
                            </TabsTrigger>
                            <TabsTrigger
                                value="events"
                                className="relative z-20 rounded-full px-3 py-3 md:px-5 md:py-4 text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-white/50 transition-all duration-300 hover:text-off-white active:scale-[0.97] data-[state=active]:text-off-white"
                            >
                                Events Archive
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="main" className="mt-10 md:mt-14">
                        <TeamGrid />
                    </TabsContent>

                    <TabsContent value="events" className="mt-10 md:mt-14">
                        <EventArchive />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Klip;