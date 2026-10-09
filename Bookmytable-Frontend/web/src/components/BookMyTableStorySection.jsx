import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import editorialDiningImage from "@/assets/editorial-dining-setup.jpg";

gsap.registerPlugin(ScrollTrigger);

/**
 * WavyReserveButton
 *
 * Architecture:
 *   - Button is 100×40 viewBox (normalised).
 *   - Wave starts completely off-screen BELOW (top edge at y=45, entire path ≥ y=45 → hidden below button).
 *   - On hover, the top edge of the wave rises from y=45 (below) to y=0 (above button top),
 *     while the organic Bezier curve deforms continuously, producing a visible liquid surface.
 *   - Two stacked paths:
 *       backPath  (rgba #FFF8F0 at 40%): sits slightly higher → translucent crest / shine
 *       frontPath (#FFF8F0 solid)      : main cream liquid body
 *
 * viewBox: "0 0 200 48"  (200 wide × 48 tall — matches a typical pill button aspect ratio)
 * Wave top y range: 58 (off-screen below) → -8 (off-screen above) during animation progress 0→1
 *
 * The "wave top" is governed by animated progress `t` ∈ [0,1]:
 *   baseY = 58 - t * 66       → goes from 58 (below) to -8 (above)
 * The organic deformation uses sin/cos on the x-axis control points to produce
 * a continuously morphing, asymmetric Bezier curve — clearly NOT a straight line.
 *
 * To make the wave deformation visible during travel (not just at endpoints),
 * the amplitude peaks near t=0.5 (sin(t·π)) and the phase phi evolves with t.
 */

function buildWavePath(t, phase) {
  // viewBox: 200 wide × 48 tall.
  // t = 0: default half-fill (waterline ~y=24, 50% fill)
  // t = 1: full fill (waterline ~y=-12, 100% fill)
  const baseY = 24 - t * 36;

  // Wave amplitude: 6.5px at rest (2.2× increase for pronounced curvy liquid profile), swells to 11px on hover rise
  const amplitude = 6.5 + Math.sin(t * Math.PI) * 4.5;

  // Multi-harmonic phase angles for continuous traveling liquid wave
  const p1 = phase;
  const p2 = phase * 1.2 + 0.8;
  const p3 = phase * 0.9 + 2.1;
  const p4 = phase * 1.4 + 3.2;

  // Crest and trough Y values for asymmetric organic liquid shape
  const y0 = baseY + amplitude * Math.sin(p1);
  const y1 = baseY + amplitude * Math.sin(p1 + 1.2) + Math.cos(p2) * 2;
  const y2 = baseY - amplitude * Math.sin(p2 + 0.5);
  const y3 = baseY + amplitude * Math.cos(p3 + 1.1) - Math.sin(p4) * 2;
  const y4 = baseY - amplitude * Math.sin(p4 + 0.8);

  // Dynamic control point X coordinates for continuous horizontal traveling movement
  const cx1 = 45 + Math.sin(phase * 0.7) * 8;
  const cx2 = 95 + Math.cos(phase * 0.8) * 10;
  const cx3 = 150 + Math.sin(phase * 0.6) * 8;

  return (
    `M 0,${y0.toFixed(2)}` +
    ` C ${cx1.toFixed(2)},${y1.toFixed(2)} ${cx2.toFixed(2)},${y2.toFixed(2)} 100,${((y2 + y3) / 2).toFixed(2)}` +
    ` C ${cx3.toFixed(2)},${y3.toFixed(2)} 175,${y4.toFixed(2)} 200,${y4.toFixed(2)}` +
    ` L 200,48 L 0,48 Z`
  );
}

function WavyReserveButton() {
  const wavePathRef  = useRef(null);
  const buttonRef    = useRef(null);
  const textRef      = useRef(null);
  const iconRef      = useRef(null);
  const hoverTlRef   = useRef(null);
  const stateRef     = useRef({ t: 0, phase: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Set initial path
    if (wavePathRef.current) {
      wavePathRef.current.setAttribute("d", buildWavePath(0, 0));
    }

    if (prefersReducedMotion) return;

    // Lightweight continuous GSAP ticker for liquid wave motion
    const onTick = () => {
      stateRef.current.phase += 0.04;
      const { t, phase } = stateRef.current;
      if (wavePathRef.current) {
        wavePathRef.current.setAttribute("d", buildWavePath(t, phase));
      }
    };

    gsap.ticker.add(onTick);

    return () => {
      gsap.ticker.remove(onTick);
      if (hoverTlRef.current) hoverTlRef.current.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stateRef.current.t = 1;
      if (wavePathRef.current) wavePathRef.current.setAttribute("d", buildWavePath(1, 0));
      if (textRef.current) textRef.current.style.color = "#FFFFFF";
      if (iconRef.current) iconRef.current.style.color = "#FFFFFF";
      return;
    }

    if (hoverTlRef.current) hoverTlRef.current.kill();

    const proxy = { t: stateRef.current.t };
    hoverTlRef.current = gsap.to(proxy, {
      t: 1,
      duration: 0.55,
      ease: "power2.inOut",
      onUpdate: () => {
        stateRef.current.t = proxy.t;
        // Transition text & icon color from dark (#18181B) to white (#FFFFFF) in sync with fill
        const whiteRatio = proxy.t;
        const grayVal = Math.round(24 + (255 - 24) * whiteRatio);
        const rgbColor = `rgb(${grayVal}, ${grayVal}, ${grayVal})`;
        if (textRef.current) textRef.current.style.color = rgbColor;
        if (iconRef.current) iconRef.current.style.color = rgbColor;
      },
    });
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stateRef.current.t = 0;
      if (wavePathRef.current) wavePathRef.current.setAttribute("d", buildWavePath(0, 0));
      if (textRef.current) textRef.current.style.color = "#18181B";
      if (iconRef.current) iconRef.current.style.color = "#18181B";
      return;
    }

    if (hoverTlRef.current) hoverTlRef.current.kill();

    const proxy = { t: stateRef.current.t };
    hoverTlRef.current = gsap.to(proxy, {
      t: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: () => {
        stateRef.current.t = proxy.t;
        const whiteRatio = proxy.t;
        const grayVal = Math.round(24 + (255 - 24) * whiteRatio);
        const rgbColor = `rgb(${grayVal}, ${grayVal}, ${grayVal})`;
        if (textRef.current) textRef.current.style.color = rgbColor;
        if (iconRef.current) iconRef.current.style.color = rgbColor;
      },
    });
  };

  return (
    <Link to="/discover" className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden bg-white rounded-full px-8 py-4 text-base font-semibold shadow-[0_4px_18px_rgba(0,0,0,0.12)] border border-border/40 inline-flex items-center gap-3 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
        style={{ minWidth: 190 }}
      >
        {/*
          LIQUID WAVE SVG — viewBox 200×48 matches button aspect ratio.
          Wave fill uses exact primary brand red via hsl(var(--primary)).
          Clipped automatically by parent button overflow-hidden + rounded-full.
        */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 48"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 0 }}
        >
          <path ref={wavePathRef} fill="hsl(var(--primary))" />
        </svg>

        {/* Text + icon sit above wave with z-index: 1 */}
        <span
          ref={textRef}
          className="relative font-bold tracking-tight transition-colors"
          style={{ zIndex: 1, color: "#18181B" }}
        >
          Reserve a table
        </span>
        <span
          ref={iconRef}
          className="relative inline-flex items-center transition-colors"
          style={{ zIndex: 1, color: "#18181B" }}
        >
          <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </Link>
  );
}



export default function BookMyTableStorySection() {
  const sectionRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const textContentRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    const imageWrapper = imageWrapperRef.current;
    const textContent = textContentRef.current;

    if (!section || !path) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Calculate path length for stroke-dasharray
      const rawLength = path.getTotalLength() || 2500;
      const pathLength = Math.ceil(Math.max(rawLength, 2500));
      // Full path length for dash and gap; buffer ensures not even a subpixel cap is visible at 0%
      const dash = pathLength;
      const gap = pathLength + 50;
      const initialOffset = pathLength + 10;

      if (prefersReduced) {
        gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
        if (imageWrapper) gsap.set(imageWrapper, { opacity: 1, filter: "blur(0px)", scale: 1 });
        if (textContent) gsap.set(textContent, { opacity: 1, filter: "blur(0px)", y: 0 });
        return;
      }

      // Initial state: Exactly 0% progress (entire stroke 100% hidden)
      gsap.set(path, {
        strokeDasharray: `${dash} ${gap}`,
        strokeDashoffset: initialOffset,
      });

      if (imageWrapper) {
        gsap.set(imageWrapper, {
          opacity: 0,
          filter: "blur(14px)",
          scale: 0.98,
        });
      }

      if (textContent) {
        gsap.set(textContent, {
          opacity: 0,
          filter: "blur(10px)",
          y: 20,
        });
      }

      // Master coordinated timeline triggered on viewport entry
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 68%",
          once: true, // Line stays drawn permanently, no rewind or loop
        },
      });

      // 1. Image subtle blur -> sharp reveal
      if (imageWrapper) {
        tl.to(
          imageWrapper,
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.25,
            ease: "power2.out",
          },
          0
        );
      }

      // 2. Text subtle blur -> sharp reveal
      if (textContent) {
        tl.to(
          textContent,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.15,
            ease: "power2.out",
          },
          0.1
        );
      }

      // 3. Primary Red stroke drawn progressively along its predefined organic path
      // Delayed start: stroke begins drawing subtly later (0.55s) after content initiates reveal
      // On completion, clears strokeDasharray to ensure 100% full, unbroken line to edge
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 2.3,
          ease: "power1.inOut",
          onComplete: () => {
            gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
          },
        },
        0.55
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen py-24 md:py-32 lg:py-40 px-6 sm:px-10 md:px-14 lg:px-20 overflow-hidden flex items-center bg-[#FAF8F5] text-foreground font-sans"
    >
      {/* 
        LAYER 1 (z-[1]): The Continuous BookMyTable Primary Red Decorative SVG Stroke
        Layered BEHIND the image (z-[2]) so the stroke naturally passes underneath
        the photograph and re-emerges to the far left edge of the section.
      */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <svg
          viewBox="0 0 1440 720"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            ref={pathRef}
            d="M 1440,45 C 1320,135 1245,185 1145,185 C 1010,185 930,35 820,35 C 695,35 615,190 575,340 C 550,440 575,505 540,555 C 500,605 380,580 260,535 C 140,490 20,470 -100,470"
            stroke="hsl(var(--primary))"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              vectorEffect: "non-scaling-stroke",
              strokeDasharray: "3000 3000",
              strokeDashoffset: 3000,
            }}
          />
        </svg>
      </div>

      {/* LAYER 2 (z-[2]): Main Content Grid (Image and Text) */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
        {/* LEFT SIDE: Portrait Dining Photograph (Slightly reduced for enhanced breathing room) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div
            ref={imageWrapperRef}
            className="relative w-full max-w-[360px] rounded-[28px] overflow-hidden shadow-[0_24px_50px_-12px_rgba(40,25,15,0.12)] border border-border/40 bg-[#F0EBE1]"
            style={{ aspectRatio: "16 / 20" }}
          >
            <img
              src={editorialDiningImage}
              alt="Cinematic fine dining setup with elegant table and botanical flowers"
              className="w-full h-full object-cover select-none"
              loading="lazy"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Editorial Text Content (Strict BookMyTable Typography) */}
        <div
          ref={textContentRef}
          className="lg:col-span-7 flex flex-col justify-center max-w-2xl font-sans"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-bold tracking-tight text-foreground leading-[1.22] mb-6">
            From intimate candlelit dinners to grand celebrations, BookMyTable is your
            curated{" "}
            <span className="text-primary font-bold italic inline-block">
              360°
            </span>{" "}
            gateway with the ability to discover the city's finest tables, or to focus on
            curating tailor-made culinary moments.
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg font-normal mb-8 leading-relaxed">
            Click below to explore our handpicked collection of premier tables.
          </p>

          <div>
            <WavyReserveButton />
          </div>
        </div>
      </div>
    </section>
  );
}
