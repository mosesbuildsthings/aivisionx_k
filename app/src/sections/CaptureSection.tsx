import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CaptureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const microLabelRef = useRef<HTMLSpanElement>(null);

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
      // Left card enters from left
      scrollTl.fromTo(
        leftCardRef.current,
        { x: '-60vw', rotateY: -35, opacity: 0 },
        { x: 0, rotateY: 0, opacity: 1, ease: 'none' },
        0
      );

      // Right card enters from right (starts at 5%)
      scrollTl.fromTo(
        rightCardRef.current,
        { x: '60vw', rotateY: 35, opacity: 0 },
        { x: 0, rotateY: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Connector dot appears (starts at 12%)
      scrollTl.fromTo(
        connectorRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'none' },
        0.12
      );

      // Headline and body enter
      scrollTl.fromTo(
        [microLabelRef.current, headlineRef.current],
        { y: '-8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        bodyRef.current,
        { y: '-6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.08
      );

      // All entrance animations complete by 30%
      // SETTLE (30-70%): Hold position

      // EXIT (70-100%)
      scrollTl.fromTo(
        leftCardRef.current,
        { x: 0, y: 0, rotateY: 0, opacity: 1 },
        { x: '-22vw', y: '10vh', rotateY: 12, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        rightCardRef.current,
        { x: 0, y: 0, rotateY: 0, opacity: 1 },
        { x: '22vw', y: '-10vh', rotateY: -12, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        connectorRef.current,
        { scale: 1, opacity: 1 },
        { scale: 0.6, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [microLabelRef.current, headlineRef.current, bodyRef.current],
        { y: 0, opacity: 1 },
        { y: '-6vh', opacity: 0, ease: 'power2.in' },
        0.75
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capture"
      className="section-pinned bg-[#05060B] z-20 perspective-1000"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Text Content */}
      <div className="absolute left-[10vw] top-[10vh] w-[46vw]">
        <span
          ref={microLabelRef}
          className="font-mono-label text-indigo-400 block mb-3"
        >
          Screen Context
        </span>
        <h2
          ref={headlineRef}
          className="text-[clamp(34px,3.6vw,52px)] font-bold text-[#F4F6FF] leading-[1.05]"
        >
          Capture everything.<br />
          <span className="text-indigo-400">Miss nothing.</span>
        </h2>
      </div>

      <p
        ref={bodyRef}
        className="absolute left-[10vw] top-[24vh] w-[30vw] text-base text-[#A7ACBF]"
      >
        Differential screen capture + active window detection keeps the context fresh without burning CPU.
      </p>

      {/* Left UI Card (Capture Preview) */}
      <div
        ref={leftCardRef}
        className="absolute left-[10vw] top-[32vh] w-[38vw] h-[52vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/capture_left_ui.jpg"
            alt="Screen Capture"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Connector Dot */}
      <div
        ref={connectorRef}
        className="absolute left-1/2 top-[58vh] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse-dot" />
      </div>

      {/* Right UI Card (Analysis) */}
      <div
        ref={rightCardRef}
        className="absolute left-[52vw] top-[32vh] w-[38vw] h-[52vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/capture_right_ui.jpg"
            alt="Analysis Dashboard"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
