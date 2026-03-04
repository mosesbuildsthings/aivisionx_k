import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#05060B]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#F4F6FF] tracking-tight">
              AiVisionX
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('capture')}
              className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('privacy')}
              className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors"
            >
              Security
            </button>
            <button
              onClick={() => scrollToSection('usecases')}
              className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('download')}
              className="text-sm text-[#A7ACBF] hover:text-[#F4F6FF] transition-colors"
            >
              Download
            </button>
          </div>

          {/* CTA */}
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 text-sm font-medium transition-all"
          >
            Get Early Access
          </Button>
        </div>
      </div>
    </nav>
  );
}
