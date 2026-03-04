import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function StackSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topCardRef = useRef<HTMLDivElement>(null);
  const tile1Ref = useRef<HTMLDivElement>(null);
  const tile2Ref = useRef<HTMLDivElement>(null);
  const tile3Ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

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
      // Top card drops in from above
      scrollTl.fromTo(
        topCardRef.current,
        { y: '-70vh', rotateX: 28, opacity: 0 },
        { y: 0, rotateX: 0, opacity: 1, ease: 'none' },
        0
      );

      // Headline enters from left
      scrollTl.fromTo(
        headlineRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Bottom tiles rise up with stagger (start at 8%)
      scrollTl.fromTo(
        tile1Ref.current,
        { y: '40vh', scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0.08
      );

      scrollTl.fromTo(
        tile2Ref.current,
        { y: '40vh', scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0.12
      );

      scrollTl.fromTo(
        tile3Ref.current,
        { y: '40vh', scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0.16
      );

      // SETTLE (30-70%): Hold position

      // EXIT (70-100%)
      scrollTl.fromTo(
        topCardRef.current,
        { y: 0, rotateX: 0, opacity: 1 },
        { y: '-18vh', rotateX: -14, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [tile1Ref.current, tile2Ref.current, tile3Ref.current],
        { y: 0, opacity: 1 },
        { y: '14vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-6vw', opacity: 0, ease: 'power2.in' },
        0.75
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stack"
      className="section-pinned bg-[#05060B] z-30 perspective-1000"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Glow behind top card */}
      <div className="absolute left-[10vw] top-[18vh] w-[80vw] h-[44vh] glow-indigo rounded-[28px] blur-3xl opacity-40 pointer-events-none" />

      {/* Headline */}
      <h2
        ref={headlineRef}
        className="absolute left-[10vw] top-[10vh] text-[clamp(34px,3.6vw,52px)] font-bold text-[#F4F6FF] leading-[1.05] w-[50vw]"
      >
        Built for context.<br />
        <span className="text-indigo-400">Engineered for speed.</span>
      </h2>

      {/* Top UI Card (Wide) */}
      <div
        ref={topCardRef}
        className="absolute left-[10vw] top-[22vh] w-[80vw] h-[40vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/stack_top_ui.jpg"
            alt="AI Engine"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Tiles */}
      <div
        ref={tile1Ref}
        className="absolute left-[10vw] top-[66vh] w-[24vw] h-[20vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden relative group">
          <img
            src="/stack_tile_vision.jpg"
            alt="Vision"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-[#05060B]/80 to-transparent">
            <span className="font-mono-label text-indigo-400">Vision</span>
          </div>
        </div>
      </div>

      <div
        ref={tile2Ref}
        className="absolute left-[38vw] top-[66vh] w-[24vw] h-[20vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden relative group">
          <img
            src="/stack_tile_reasoning.jpg"
            alt="Reasoning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-[#05060B]/80 to-transparent">
            <span className="font-mono-label text-indigo-400">Reasoning</span>
          </div>
        </div>
      </div>

      <div
        ref={tile3Ref}
        className="absolute left-[66vw] top-[66vh] w-[24vw] h-[20vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden relative group">
          <img
            src="/stack_tile_action.jpg"
            alt="Action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-[#05060B]/80 to-transparent">
            <span className="font-mono-label text-indigo-400">Action</span>
          </div>
        </div>
      </div>
    </section>
  );
}
