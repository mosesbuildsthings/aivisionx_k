import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function OverlaySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const tileTLRef = useRef<HTMLDivElement>(null);
  const tileTRRef = useRef<HTMLDivElement>(null);
  const tileBLRef = useRef<HTMLDivElement>(null);
  const tileBRRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      // Headline enters first
      scrollTl.fromTo(
        headlineRef.current,
        { y: '-6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      // Center card rises from below
      scrollTl.fromTo(
        centerCardRef.current,
        { y: '70vh', rotateX: -22, scale: 0.92, opacity: 0 },
        { y: 0, rotateX: 0, scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // Surrounding tiles enter from edges (start at 10%)
      scrollTl.fromTo(
        tileTLRef.current,
        { x: '-20vw', y: '-16vh', opacity: 0 },
        { x: 0, y: 0, opacity: 0.9, ease: 'none' },
        0.1
      );

      scrollTl.fromTo(
        tileTRRef.current,
        { x: '20vw', y: '-16vh', opacity: 0 },
        { x: 0, y: 0, opacity: 0.9, ease: 'none' },
        0.12
      );

      scrollTl.fromTo(
        tileBLRef.current,
        { x: '-20vw', y: '16vh', opacity: 0 },
        { x: 0, y: 0, opacity: 0.9, ease: 'none' },
        0.14
      );

      scrollTl.fromTo(
        tileBRRef.current,
        { x: '20vw', y: '16vh', opacity: 0 },
        { x: 0, y: 0, opacity: 0.9, ease: 'none' },
        0.16
      );

      // SETTLE (30-70%): Hold position

      // EXIT (70-100%)
      scrollTl.fromTo(
        centerCardRef.current,
        { y: 0, rotateX: 0, opacity: 1 },
        { y: '-18vh', rotateX: 14, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [tileTLRef.current, tileTRRef.current, tileBLRef.current, tileBRRef.current],
        { opacity: 0.9 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-4vh', opacity: 0, ease: 'power2.in' },
        0.75
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="overlay"
      className="section-pinned bg-[#05060B] z-50 perspective-1000"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Glow behind center card */}
      <div className="absolute left-[22vw] top-[18vh] w-[56vw] h-[56vh] glow-indigo rounded-[28px] blur-3xl opacity-40 pointer-events-none" />

      {/* Headline */}
      <div
        ref={headlineRef}
        className="absolute left-[10vw] top-[10vh] w-[40vw]"
      >
        <h2 className="text-[clamp(34px,3.6vw,52px)] font-bold text-[#F4F6FF] leading-[1.05] mb-3">
          Ask. Delegate.<br />
          <span className="text-indigo-400">Automate.</span>
        </h2>
        <p className="text-base text-[#A7ACBF]">
          A chat-native overlay that understands what you're working on.
        </p>
      </div>

      {/* Center Overlay UI Card */}
      <div
        ref={centerCardRef}
        className="absolute left-[22vw] top-[20vh] w-[56vw] h-[56vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/overlay_ui_main.jpg"
            alt="Chat Overlay"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Surrounding Small Tiles */}
      <div
        ref={tileTLRef}
        className="absolute left-[8vw] top-[20vh] w-[12vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-90">
          <img
            src="/overlay_tile_1.jpg"
            alt="Suggestions"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        ref={tileTRRef}
        className="absolute left-[80vw] top-[20vh] w-[12vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-90">
          <img
            src="/overlay_tile_2.jpg"
            alt="Shortcuts"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        ref={tileBLRef}
        className="absolute left-[8vw] top-[56vh] w-[12vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-90 bg-indigo-900/20 flex items-center justify-center">
          <span className="font-mono-label text-indigo-400 text-center">Quick Actions</span>
        </div>
      </div>

      <div
        ref={tileBRRef}
        className="absolute left-[78vw] top-[56vh] w-[14vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-90 bg-indigo-900/20 flex items-center justify-center">
          <span className="font-mono-label text-indigo-400 text-center">Context Menu</span>
        </div>
      </div>
    </section>
  );
}
