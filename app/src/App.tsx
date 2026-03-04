import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/sections/HeroSection';
import { CaptureSection } from '@/sections/CaptureSection';
import { StackSection } from '@/sections/StackSection';
import { PrivacySection } from '@/sections/PrivacySection';
import { OverlaySection } from '@/sections/OverlaySection';
import { UseCasesSection } from '@/sections/UseCasesSection';
import { DownloadSection } from '@/sections/DownloadSection';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      // Build pinned ranges and snap targets from actual ScrollTriggers
      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Check if within any pinned range (with buffer)
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            
            if (!inPinned) return value; // Flowing section: free scroll

            // Find nearest pinned center
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out'
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#05060B] min-h-screen">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main className="relative">
        {/* Section 1: Hero - z-10 */}
        <HeroSection />
        
        {/* Section 2: Capture Flow - z-20 */}
        <CaptureSection />
        
        {/* Section 3: Intelligence Stack - z-30 */}
        <StackSection />
        
        {/* Section 4: Privacy Firewall - z-40 */}
        <PrivacySection />
        
        {/* Section 5: Live Overlay - z-50 */}
        <OverlaySection />
        
        {/* Section 6: Use Cases - z-60 (flowing) */}
        <UseCasesSection />
        
        {/* Section 7: Download CTA + Footer - z-70 (flowing) */}
        <DownloadSection />
      </main>
    </div>
  );
}

export default App;
