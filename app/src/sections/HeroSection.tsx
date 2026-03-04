import { useRef, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const tileARef = useRef<HTMLDivElement>(null);
  const tileBRef = useRef<HTMLDivElement>(null);
  const tileCRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const microLabelRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation on load
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Main card entrance
      loadTl.fromTo(
        mainCardRef.current,
        { opacity: 0, y: '10vh', rotateX: 18, scale: 0.96 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.1 },
        0
      );

      // Satellite tiles entrance
      loadTl.fromTo(
        tileARef.current,
        { opacity: 0, y: '12vh', rotateZ: -6, scale: 0.92 },
        { opacity: 0.85, y: 0, rotateZ: 0, scale: 1, duration: 0.9 },
        0.15
      );
      loadTl.fromTo(
        tileBRef.current,
        { opacity: 0, y: '12vh', rotateZ: 6, scale: 0.92 },
        { opacity: 0.85, y: 0, rotateZ: 0, scale: 1, duration: 0.9 },
        0.27
      );
      loadTl.fromTo(
        tileCRef.current,
        { opacity: 0, y: '12vh', rotateZ: -4, scale: 0.92 },
        { opacity: 0.85, y: 0, rotateZ: 0, scale: 1, duration: 0.9 },
        0.39
      );

      // Text elements entrance
      loadTl.fromTo(
        microLabelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.4
      );

      // Headline word animation
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        loadTl.fromTo(
          words,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.04 },
          0.5
        );
      }

      loadTl.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.7
      );

      loadTl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.8
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([mainCardRef.current, tileARef.current, tileBRef.current, tileCRef.current], {
              opacity: 1, x: 0, y: 0, rotateY: 0, rotateX: 0
            });
            gsap.set([headlineRef.current, subheadlineRef.current, ctaRef.current, microLabelRef.current], {
              opacity: 1, y: 0
            });
          }
        }
      });

      // ENTRANCE (0-30%): Hold at fully visible (matches load end state)
      // SETTLE (30-70%): Static composition
      
      // EXIT (70-100%): Elements exit
      scrollTl.fromTo(
        mainCardRef.current,
        { x: 0, y: 0, rotateY: 0, opacity: 1 },
        { x: '-18vw', y: '-10vh', rotateY: 18, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        tileARef.current,
        { x: 0, opacity: 0.85 },
        { x: '-12vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        tileBRef.current,
        { x: 0, opacity: 0.85 },
        { x: '12vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        tileCRef.current,
        { x: 0, y: 0, opacity: 0.85 },
        { x: '10vw', y: '8vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [headlineRef.current, subheadlineRef.current, ctaRef.current, microLabelRef.current],
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
      id="hero"
      className="section-pinned bg-[#05060B] z-10 perspective-1000"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      {/* Glow behind main card */}
      <div className="absolute left-[18vw] top-[18vh] w-[64vw] h-[46vh] glow-indigo rounded-[28px] blur-3xl opacity-60 pointer-events-none" />

      {/* Main UI Card */}
      <div
        ref={mainCardRef}
        className="absolute left-[18vw] top-[18vh] w-[64vw] h-[46vh] preserve-3d"
      >
        <div className="glass-card w-full h-full overflow-hidden">
          <img
            src="/hero_ui_main.jpg"
            alt="AiVisionX Dashboard"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Satellite Tile A */}
      <div
        ref={tileARef}
        className="absolute left-[8vw] top-[34vh] w-[18vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-85">
          <img
            src="/hero_tile_a.jpg"
            alt="Metrics"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Satellite Tile B */}
      <div
        ref={tileBRef}
        className="absolute left-[74vw] top-[26vh] w-[18vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-85">
          <img
            src="/hero_tile_b.jpg"
            alt="Analytics"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Satellite Tile C */}
      <div
        ref={tileCRef}
        className="absolute left-[62vw] top-[70vh] w-[18vw] h-[22vh]"
      >
        <div className="glass-card-sm w-full h-full overflow-hidden opacity-85">
          <img
            src="/hero_tile_c.jpg"
            alt="Status"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="absolute left-[8vw] top-[68vh] w-[42vw]">
        <span
          ref={microLabelRef}
          className="font-mono-label text-indigo-400 block mb-4"
        >
          AI-Powered Desktop Assistant
        </span>
        
        <h1
          ref={headlineRef}
          className="text-[clamp(44px,5vw,72px)] font-bold text-[#F4F6FF] leading-[0.95] mb-4"
        >
          <span className="word inline-block">See</span>{' '}
          <span className="word inline-block">your</span>{' '}
          <span className="word inline-block">screen</span>{' '}
          <span className="word inline-block">through</span>{' '}
          <span className="word inline-block text-indigo-400">AI.</span>
        </h1>
        
        <p
          ref={subheadlineRef}
          className="text-lg text-[#A7ACBF] max-w-md"
        >
          Capture, understand, and act—without leaving your flow.
        </p>
      </div>

      {/* CTAs */}
      <div
        ref={ctaRef}
        className="absolute left-[8vw] top-[88vh] flex items-center gap-4"
      >
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 text-base font-medium transition-all group"
        >
          Get Early Access
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-white/20 text-[#F4F6FF] hover:bg-white/10 rounded-full px-6 text-base font-medium transition-all"
        >
          <Play className="w-4 h-4 mr-2" />
          Watch Demo
        </Button>
      </div>
    </section>
  );
}
