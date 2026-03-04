import { useRef, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Apple, Monitor, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function DownloadSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaCardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // CTA card animation
      gsap.fromTo(
        ctaCardRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaCardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Footer animation
      gsap.fromTo(
        footerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="download"
      className="relative bg-[#05060B] z-70 py-16 lg:py-24"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative px-8 lg:px-[10vw]">
        {/* CTA Card */}
        <div
          ref={ctaCardRef}
          className="glass-card overflow-hidden mb-16 lg:mb-24"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0">
            {/* Text Content */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <h2 className="text-[clamp(32px,3vw,48px)] font-bold text-[#F4F6FF] leading-[1.05] mb-4">
                Ready to see your screen <span className="text-indigo-400">differently?</span>
              </h2>
              <p className="text-base text-[#A7ACBF] mb-8">
                Join the beta. macOS & Windows support launching soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 text-base font-medium transition-all group"
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Download for macOS
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-[#F4F6FF] hover:bg-white/10 rounded-full px-6 text-base font-medium transition-all"
                >
                  <Monitor className="w-5 h-5 mr-2" />
                  Windows (Waitlist)
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative h-64 lg:h-auto">
              <img
                src="/cta_ui_card.jpg"
                alt="Download AiVisionX"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05060B] via-transparent to-transparent lg:bg-gradient-to-l" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          ref={footerRef}
          className="border-t border-white/[0.08] pt-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#F4F6FF]">AiVisionX</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors">
                Support
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#A7ACBF]">
              © 2026 AiVisionX. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
