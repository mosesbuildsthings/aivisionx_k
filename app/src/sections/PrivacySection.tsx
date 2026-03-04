import { useRef, useLayoutEffect } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PrivacySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

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
      // Shield tile enters first
      scrollTl.fromTo(
        shieldRef.current,
        { scale: 0.6, rotateZ: -12, opacity: 0 },
        { scale: 1, rotateZ: 0, opacity: 1, ease: 'none' },
        0
      );

      // Text block enters from left (starts at 5%)
      scrollTl.fromTo(
        textBlockRef.current,
        { x: '-18vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Right card enters from right (starts at 10%)
      scrollTl.fromTo(
        rightCardRef.current,
        { x: '60vw', rotateY: 35, opacity: 0 },
        { x: 0, rotateY: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // SETTLE (30-70%): Hold position

      // EXIT (70-100%)
      scrollTl.fromTo(
        shieldRef.current,
        { scale: 1, opacity: 1 },
        { scale: 0.8, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        textBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        rightCardRef.current,
        { x: 0, rotateY: 0, opacity: 1 },
        { x: '18vw', rotateY: -12, opacity: 0, ease: 'power2.in' },
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="privacy"
      className="section-pinned bg-[#05060B] z-40 perspective-1000"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Shield Icon Tile */}
      <div
        ref={shieldRef}
        className="absolute left-[10vw] top-[18vh] w-[10vw] h-[10vh]"
      >
        <div className="glass-card-sm w-full h-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-indigo-400" />
        </div>
      </div>

      {/* Text Block */}
      <div
        ref={textBlockRef}
        className="absolute left-[10vw] top-[32vh] w-[30vw]"
      >
        <span className="font-mono-label text-indigo-400 block mb-3">
          Security
        </span>
        <h2 className="text-[clamp(34px,3.6vw,52px)] font-bold text-[#F4F6FF] leading-[1.05] mb-6">
          Privacy-first<br />
          <span className="text-indigo-400">by design.</span>
        </h2>
        <p className="text-base text-[#A7ACBF] mb-6 leading-relaxed">
          Sensitive data is redacted on-device before anything leaves your machine. You control what's shared.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium group"
        >
          Read the Security Whitepaper
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Right Privacy UI Card */}
      <div
        ref={rightCardRef}
        className="absolute left-[46vw] top-[18vh] w-[44vw] h-[56vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/privacy_ui_main.jpg"
            alt="Privacy Controls"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
