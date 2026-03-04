import { useRef, useLayoutEffect } from 'react';
import { Code, ShieldCheck, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useCases = [
  {
    icon: Code,
    title: 'Developers',
    description: 'Explain code, find bugs, generate tests from the current file. Get instant context-aware assistance without switching windows.',
    image: '/usecase_dev.jpg'
  },
  {
    icon: ShieldCheck,
    title: 'Security Analysts',
    description: 'Spot misconfigurations and get remediation steps instantly. Analyze logs, configs, and dashboards with AI-powered insights.',
    image: '/usecase_security.jpg'
  },
  {
    icon: Zap,
    title: 'Operations',
    description: 'Draft responses and automate repetitive UI tasks. Streamline workflows with intelligent screen understanding.',
    image: '/usecase_ops.jpg'
  }
];

export function UseCasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Card animations
      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const image = card.querySelector('.case-image');
        const content = card.querySelector('.case-content');

        gsap.fromTo(
          image,
          { x: index % 2 === 0 ? -60 : 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo(
          content,
          { x: index % 2 === 0 ? 40 : -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="usecases"
      className="relative bg-[#05060B] z-60 py-24 lg:py-32"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative px-8 lg:px-[10vw]">
        {/* Heading */}
        <div ref={headingRef} className="max-w-xl mb-16 lg:mb-24">
          <h2 className="text-[clamp(34px,3.6vw,52px)] font-bold text-[#F4F6FF] leading-[1.05] mb-4">
            Built for <span className="text-indigo-400">deep work.</span>
          </h2>
          <p className="text-lg text-[#A7ACBF]">
            AiVisionX adapts to your workflow, providing contextual assistance across different roles and tasks.
          </p>
        </div>

        {/* Use Case Cards */}
        <div className="space-y-16 lg:space-y-24">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              ref={el => { cardRefs.current[index] = el; }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className={`case-image ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="glass-card overflow-hidden aspect-video">
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className={`case-content ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                    <useCase.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="font-mono-label text-indigo-400">Use Case {String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#F4F6FF] mb-4">
                  {useCase.title}
                </h3>
                <p className="text-base text-[#A7ACBF] leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
