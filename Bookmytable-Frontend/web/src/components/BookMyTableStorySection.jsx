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

    // Continuous lightweight GSAP ticker for liquid wave motion (idle and hover)
    const onTick = () => {
      stateRef.current.phase += 0.04;
      const { t, phase } = stateRef.current;
      if (wavePathRef.current) {
        wavePathRef.current.setAttribute("d", buildWavePath(t, phase));
      }
    };

    gsap.ticker.add(onTick);

    const btn = buttonRef.current;
    if (btn) {
      btn.addEventListener("pointerenter", handleMouseEnter);
      btn.addEventListener("pointerleave", handleMouseLeave);
    }

    return () => {
      gsap.ticker.remove(onTick);
      if (hoverTlRef.current) hoverTlRef.current.kill();
      if (btn) {
        btn.removeEventListener("pointerenter", handleMouseEnter);
        btn.removeEventListener("pointerleave", handleMouseLeave);
      }
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

    gsap.to([textRef.current, iconRef.current], {
      color: "#FFFFFF",
      duration: 0.55,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    const proxy = { t: stateRef.current.t };
    hoverTlRef.current = gsap.to(proxy, {
      t: 1,
      duration: 0.55,
      ease: "power2.inOut",
      onUpdate: () => {
        stateRef.current.t = proxy.t;
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

    gsap.to([textRef.current, iconRef.current], {
      color: "#18181B",
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    const proxy = { t: stateRef.current.t };
    hoverTlRef.current = gsap.to(proxy, {
      t: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: () => {
        stateRef.current.t = proxy.t;
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
          className="relative font-bold tracking-tight"
          style={{ zIndex: 1, color: "#18181B" }}
        >
          Reserve a table
        </span>
        <span
          ref={iconRef}
          className="relative inline-flex items-center"
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
  const headingRef = useRef(null);
  const paragraphRef = useRef(null);
  const supportingRef = useRef(null);
  const buttonWrapperRef = useRef(null);
  const desktopPathRef = useRef(null);
  const mobilePathRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const dPath = desktopPathRef.current;
    const mPath = mobilePathRef.current;
    const imageWrapper = imageWrapperRef.current;
    const heading = headingRef.current;
    const paragraph = paragraphRef.current;
    const supporting = supportingRef.current;
    const buttonWrapper = buttonWrapperRef.current;

    if (!section) return;

    let refreshTimer = null;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Helper: setup stroke dash animation on a path element
      const initPath = (path) => {
        if (!path) return null;
        let pathLength = 2500;
        try {
          const l = path.getTotalLength();
          if (l && l > 0) pathLength = Math.ceil(l);
        } catch (e) {
          pathLength = 2500;
        }
        return { dash: pathLength, gap: pathLength + 50, offset: pathLength + 10 };
      };

      const animatedElements = [
        imageWrapper,
        heading,
        paragraph,
        supporting,
        buttonWrapper,
      ].filter(Boolean);

      if (prefersReduced) {
        [dPath, mPath].forEach((p) => {
          if (p) gsap.set(p, { strokeDasharray: "none", strokeDashoffset: 0 });
        });
        gsap.set(animatedElements, { opacity: 1, y: 0 });
        return;
      }

      // Initial state: start with opacity: 0 and y: 60
      gsap.set(animatedElements, { opacity: 0, y: 60 });

      // Initialise both stroke paths as completely hidden
      [dPath, mPath].forEach((p) => {
        if (!p) return;
        const v = initPath(p);
        if (v) {
          gsap.set(p, {
            strokeDasharray: `${v.dash} ${v.gap}`,
            strokeDashoffset: v.offset,
          });
        }
      });

      // ── INDEPENDENT ASYNCHRONOUS STROKE ANIMATION ─────────────────────────
      const activePaths = [dPath, mPath].filter(Boolean);
      let strokeHasAnimated = false;

      const startStrokeAnimation = () => {
        if (strokeHasAnimated || !activePaths.length) return;
        strokeHasAnimated = true;

        // Animate stroke asynchronously and independently from right-to-left
        gsap.to(activePaths, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.inOut",
          delay: 0.1, // Starts immediately after heading reveal begins
          onComplete: () => {
            gsap.set(activePaths, { strokeDasharray: "none", strokeDashoffset: 0 });
          },
        });
      };

      // ── INDIVIDUAL ELEMENT-LEVEL VIEWPORT TRIGGERS ─────────────────────────
      const elemDuration = 1.0; // 0.8–1.1s individual element duration

      // 1. Restaurant image: reveals when image enters viewport
      if (imageWrapper) {
        gsap.to(imageWrapper, {
          scrollTrigger: {
            trigger: imageWrapper,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: elemDuration,
          ease: "power3.out",
          clearProps: "transform",
        });
      }

      // 2. Heading: reveals when heading enters viewport
      // Triggers the asynchronous red stroke animation immediately when heading reveal begins
      if (heading) {
        gsap.to(heading, {
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: elemDuration,
          ease: "power3.out",
          clearProps: "transform",
          onStart: () => {
            startStrokeAnimation();
          },
        });
      } else if (imageWrapper) {
        // Fallback: if heading ref is not present, trigger via imageWrapper
        startStrokeAnimation();
      }

      // 3. Main paragraph: reveals independently only when paragraph enters viewport
      if (paragraph) {
        gsap.to(paragraph, {
          scrollTrigger: {
            trigger: paragraph,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: elemDuration,
          ease: "power3.out",
          clearProps: "transform",
        });
      }

      // 4. Supporting description: reveals independently only when description enters viewport
      if (supporting) {
        gsap.to(supporting, {
          scrollTrigger: {
            trigger: supporting,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: elemDuration,
          ease: "power3.out",
          clearProps: "transform",
        });
      }

      // 5. CTA button: reveals independently only when button enters viewport
      if (buttonWrapper) {
        gsap.to(buttonWrapper, {
          scrollTrigger: {
            trigger: buttonWrapper,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: elemDuration,
          ease: "power3.out",
          clearProps: "transform",
        });
      }
    }, section);

    // Refresh ScrollTrigger after a tick so pinned ancestors (hero) and layout are finalized
    refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen py-12 sm:py-20 md:py-28 lg:py-40 px-5 sm:px-10 md:px-14 lg:px-20 overflow-hidden flex items-center bg-[#FAF8F5] text-foreground font-sans"
    >
      {/*
        ── MOBILE STROKE (z-[1]) ─────────────────────────────────────────────
        Dedicated path for screens below sm (< 640px).
        Enters from left edge at ~55% of image height, curves upward behind the
        image, reappears near the upper-right of the image, and exits toward the
        upper-right corner — matching the reference mockup.
        Hidden on sm+ where the desktop stroke takes over.
      */}
      <div className="absolute inset-0 pointer-events-none z-[1] sm:hidden">
        <svg
          viewBox="0 0 390 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            ref={mobilePathRef}
            d="M 420,36 C 392,42 374,46 356,50 C 292,64 240,94 186,136 C 132,178 70,214 -12,212"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              vectorEffect: "non-scaling-stroke",
              strokeDasharray: "1500 1500",
              strokeDashoffset: 1500,
            }}
          />
        </svg>
      </div>

      {/*
        ── DESKTOP STROKE (z-[1]) ────────────────────────────────────────────
        Original organic path — unchanged. Visible on sm and above.
        Sits behind the photograph (z-[2]) so the curve passes underneath.
      */}
      <div className="absolute inset-0 pointer-events-none z-[1] hidden sm:block">
        <svg
          viewBox="0 0 1440 720"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            ref={desktopPathRef}
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

      {/* ── LAYER 2 (z-[2]): Main Content Grid ────────────────────────────── */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">

        {/*
          IMAGE
          Mobile: landscape 4:3, full container width, rounded-[20px]
          Desktop (lg+): portrait 16:20, max-w-[360px], rounded-[28px]
        */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div
            ref={imageWrapperRef}
            className="relative w-full lg:max-w-[360px] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-[0_24px_50px_-12px_rgba(40,25,15,0.12)] border border-border/40 bg-[#F0EBE1] aspect-[4/3] lg:aspect-[16/20]"
          >
            <img
              src={editorialDiningImage}
              alt="Cinematic fine dining setup with elegant table and botanical flowers"
              className="w-full h-full object-cover object-center select-none"
              loading="lazy"
            />
          </div>
        </div>

        {/*
          TEXT CONTENT
          ─ Heading: bold, dark navy, 28px mobile → 44px desktop, lh 1.2
          ─ Paragraph: regular, dark navy, 16px mobile → 19px desktop, lh 1.6
            "360°" is red + bold + italic inline
          ─ Supporting: muted blue-grey, 14px mobile → 15px desktop
          ─ Button: WavyReserveButton, unchanged
        */}
        <div className="lg:col-span-7 flex flex-col justify-center max-w-2xl font-sans">
          {/* Heading */}
          <h2
            ref={headingRef}
            className="font-bold tracking-tight text-[#0F172A] leading-[1.2] mb-4 sm:mb-5 lg:mb-6"
            style={{ fontSize: "clamp(28px, 5vw, 44px)" }}
          >
            From candlelit dinners to grand celebrations.
          </h2>

          {/* Main paragraph with inline 360° */}
          <p
            ref={paragraphRef}
            className="font-normal text-[#0F172A] leading-[1.6] mb-3 sm:mb-4"
            style={{ fontSize: "clamp(16px, 2vw, 19px)" }}
          >
            BookMyTable is your curated{" "}
            <span className="text-primary font-bold italic">360°</span>
            {" "}gateway to the city's finest tables and tailor-made culinary moments.
          </p>

          {/* Supporting text */}
          <p
            ref={supportingRef}
            className="text-[#64748B] leading-relaxed mb-7 sm:mb-8"
            style={{ fontSize: "clamp(14px, 1.5vw, 15px)" }}
          >
            Explore our handpicked collection of premier tables.
          </p>

          {/* Button — unchanged */}
          <div ref={buttonWrapperRef}>
            <WavyReserveButton />
          </div>
        </div>
      </div>
    </section>
  );
}

