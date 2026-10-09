import { useEffect, useRef, useState, Suspense, lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Wine, 
  UtensilsCrossed, 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const Table3DViewer = lazy(() => import("@/components/Table3DViewer"));

export default function Table3DSection() {
  const sectionRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const progressBarRef = useRef(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Text refs for GSAP scrub animation
  const s1Ref = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      if (s1Ref.current) gsap.set(s1Ref.current, { autoAlpha: 1 });
      if (s2Ref.current) gsap.set(s2Ref.current, { autoAlpha: 0 });
      if (s3Ref.current) gsap.set(s3Ref.current, { autoAlpha: 0 });
      if (s4Ref.current) gsap.set(s4Ref.current, { autoAlpha: 0 });
      return;
    }

    // Set initial text states
    if (s1Ref.current) gsap.set(s1Ref.current, { autoAlpha: 1, y: 0 });
    if (s2Ref.current) gsap.set(s2Ref.current, { autoAlpha: 0, y: 26 });
    if (s3Ref.current) gsap.set(s3Ref.current, { autoAlpha: 0, y: 26 });
    if (s4Ref.current) gsap.set(s4Ref.current, { autoAlpha: 0, y: 26 });

    // Single unified Master Timeline with ScrollTrigger pinned stage
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          scrollProgressRef.current = p;

          // Update HUD progress line
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${(p * 100).toFixed(1)}%`;
          }

          // Active story tracker (0 to 3)
          let idx = 0;
          if (p >= 0.76) idx = 3;
          else if (p >= 0.50) idx = 2;
          else if (p >= 0.24) idx = 1;
          setActiveStoryIndex(idx);
        },
      },
    });

    // Anchor: defines normalized duration of 1.0
    master.to({}, { duration: 1 }, 0);

    // ── STORY 01: THE DINING EXPERIENCE (0.00 – 0.24) ──
    // Starts visible at 0.00, holds until 0.17, exits upward
    if (s1Ref.current) {
      master.to(
        s1Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.07 },
        0.17
      );
    }

    // ── STORY 02: ATMOSPHERE & PROXIMITY (0.26 – 0.50) ──
    // Enters 0.26 – 0.33, holds until 0.43, exits upward
    if (s2Ref.current) {
      master.fromTo(
        s2Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.07 },
        0.26
      ).to(
        s2Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.07 },
        0.43
      );
    }

    // ── STORY 03: YOUR TABLE (0.52 – 0.76) ──
    // Enters 0.52 – 0.59, holds until 0.69, exits upward
    if (s3Ref.current) {
      master.fromTo(
        s3Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.07 },
        0.52
      ).to(
        s3Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.07 },
        0.69
      );
    }

    // ── STORY 04: BOOK WITH CONFIDENCE (0.78 – 1.00) ──
    // Enters 0.78 – 0.86, holds through end of scroll
    if (s4Ref.current) {
      master.fromTo(
        s4Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.08 },
        0.78
      );
    }

    return () => {
      master.scrollTrigger?.kill();
      master.kill();
    };
  }, []);

  // Shared Editorial Typography Styles matching BookMyTable Brand
  const eyebrowStyle = {
    fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
    fontSize: "clamp(10px, 0.95vw, 12px)",
    letterSpacing: "0.26em",
  };

  const headlineStyle = {
    fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
    fontSize: "clamp(30px, 4.4vw, 56px)",
    letterSpacing: "-0.018em",
    textShadow: "0 2px 28px rgba(0,0,0,0.85)",
  };

  const bodyStyle = {
    fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
    fontSize: "clamp(13px, 1.15vw, 15px)",
    lineHeight: 1.68,
    color: "rgba(255, 255, 255, 0.78)",
    textShadow: "0 1px 12px rgba(0,0,0,0.7)",
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0a0806] text-white"
      style={{ height: "100vh" }}
    >
      {/* ── PERSISTENT 3D DINING ENVIRONMENT CANVAS (STAGE) ── */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#0a0806]">
              <div className="w-12 h-12 rounded-full border-2 border-[#c8a46e]/20 border-t-[#c8a46e] animate-spin" />
            </div>
          }
        >
          <Table3DViewer scrollProgressRef={scrollProgressRef} />
        </Suspense>
      </div>


      {/* ── FOREGROUND STORYTELLING OVERLAYS (4 ACTS) ── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">

        {/* ── STORY 01: THE DINING EXPERIENCE (Lower-Left) ── */}
        <div
          ref={s1Ref}
          className="absolute left-6 sm:left-12 lg:left-20 bottom-16 sm:bottom-20 lg:bottom-24 max-w-[90vw] sm:max-w-md lg:max-w-lg"
        >
          <div className="inline-flex items-center gap-2 text-[#c8a46e] uppercase font-medium mb-3 sm:mb-4" style={eyebrowStyle}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Dining Experience</span>
          </div>

          <h2 className="font-medium text-white leading-[1.08] mb-4" style={headlineStyle}>
            Every table <br />
            <em className="font-normal italic text-[#e4c28d]">sets the mood.</em>
          </h2>

          <p style={bodyStyle}>
            From quiet candlelit alcoves to vibrant social gatherings, the physical space defines the moment before the first course is even served.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/5 backdrop-blur-md border border-[#c8a46e]/20 text-neutral-300">
              <Wine className="w-3.5 h-3.5 text-[#c8a46e]" />
              Artisanal Tableware
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/5 backdrop-blur-md border border-[#c8a46e]/20 text-neutral-300">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#c8a46e]" />
              Acoustic Balance
            </span>
          </div>
        </div>

        {/* ── STORY 02: ATMOSPHERE & PROXIMITY (Lower-Right) ── */}
        <div
          ref={s2Ref}
          className="absolute right-6 sm:right-12 lg:right-20 bottom-16 sm:bottom-20 lg:bottom-24 max-w-[90vw] sm:max-w-md lg:max-w-lg text-left sm:text-right"
        >
          <div className="inline-flex items-center gap-2 text-[#c8a46e] uppercase font-medium mb-3 sm:mb-4 sm:justify-end" style={eyebrowStyle}>
            <Wine className="w-3.5 h-3.5" />
            <span>Atmosphere & Proximity</span>
          </div>

          <h2 className="font-medium text-white leading-[1.08] mb-4" style={headlineStyle}>
            Choose the setting <br />
            <em className="font-normal italic text-[#e4c28d]">that feels right.</em>
          </h2>

          <p style={bodyStyle} className="sm:ml-auto">
            Inspect layout spacing, sommelier stemware, and ambient table lighting in real time before confirming your reservation.
          </p>

          {/* Reference-Inspired Feature Spec Badges */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pointer-events-auto">
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-[#c8a46e]/30 shadow-md">
              <div className="text-[#c8a46e] text-xs font-semibold uppercase tracking-wider mb-0.5">
                Stemware & Linen
              </div>
              <p className="text-[11px] text-neutral-300 leading-tight">
                Crystal glasses & sommelier-curated table settings.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-[#c8a46e]/30 shadow-md">
              <div className="text-[#c8a46e] text-xs font-semibold uppercase tracking-wider mb-0.5">
                Generous Spacing
              </div>
              <p className="text-[11px] text-neutral-300 leading-tight">
                Designed for intimacy, privacy, and effortless dialogue.
              </p>
            </div>
          </div>
        </div>

        {/* ── STORY 03: YOUR TABLE (Lower-Left) ── */}
        <div
          ref={s3Ref}
          className="absolute left-6 sm:left-12 lg:left-20 bottom-16 sm:bottom-20 lg:bottom-24 max-w-[90vw] sm:max-w-md lg:max-w-lg"
        >
          <div className="inline-flex items-center gap-2 text-[#c8a46e] uppercase font-medium mb-3 sm:mb-4" style={eyebrowStyle}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Precision Seating</span>
          </div>

          <h2 className="font-medium text-white leading-[1.08] mb-4" style={headlineStyle}>
            From the room <br />
            <em className="font-normal italic text-[#e4c28d]">to your seat.</em>
          </h2>

          <p style={bodyStyle}>
            What you discover here corresponds precisely to the reserved setting for your party. Zero guesswork, zero compromises on viewpoint or atmosphere.
          </p>

          {/* Table Verification Pill Card */}
          <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-md border border-white/10 max-w-sm pointer-events-auto shadow-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#c8a46e] font-medium uppercase tracking-wider">
                Table #04 · Chef's Perspective
              </span>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Guaranteed
              </span>
            </div>
            <p className="text-[12px] text-neutral-300">
              Unobstructed dining vista with sommelier service.
            </p>
          </div>
        </div>

        {/* ── STORY 04: BOOK WITH CONFIDENCE (Lower-Right with CTAs) ── */}
        <div
          ref={s4Ref}
          className="absolute right-6 sm:right-12 lg:right-20 bottom-14 sm:bottom-18 lg:bottom-20 max-w-[90vw] sm:max-w-md lg:max-w-lg text-left sm:text-right"
        >
          <div className="inline-flex items-center gap-2 text-[#c8a46e] uppercase font-medium mb-3 sm:mb-4 sm:justify-end" style={eyebrowStyle}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Book With Confidence</span>
          </div>

          <h2 className="font-medium text-white leading-[1.08] mb-4" style={headlineStyle}>
            Your table, <br />
            <em className="font-normal italic text-[#e4c28d]">your time.</em>
          </h2>

          <p style={bodyStyle} className="sm:ml-auto mb-6">
            Join over 150,000 diners who reserve their ideal culinary experiences with BookMyTable. Real-time availability with zero waitlist friction.
          </p>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:justify-end pointer-events-auto">
            <Link to="/discover">
              <Button 
                size="lg" 
                className="bg-[#c8a46e] hover:bg-[#b5915d] text-black font-medium tracking-wide shadow-[0_0_24px_rgba(200,164,110,0.4)] gap-2 transition-all hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4" />
                Explore Restaurants
              </Button>
            </Link>
            <Link to="/near-me">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white bg-black/40 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
              >
                Curated Dining
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* ── BOTTOM VIEWPORT ACCENT SCROLL HINT ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#c8a46e]/70">
        <span>Scroll To Explore</span>
        <div className="w-1 h-3 rounded-full bg-[#c8a46e]/60 animate-pulse" />
      </div>
    </section>
  );
}
