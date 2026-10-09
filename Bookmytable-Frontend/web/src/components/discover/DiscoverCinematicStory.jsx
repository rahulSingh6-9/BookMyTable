import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ─── Asset imports ────────────────────────────────────────────────────────────
import img1 from "@/assets/discover2/21.webp";
import img2 from "@/assets/discover2/4afebf72f116f1acf5f1c04fd0b0021f.jpg";
import img3 from "@/assets/discover2/80611c13540ec2250285119c0a4f9031.jpg";
import img4 from "@/assets/discover2/chef-flaming-dish-stockcake.jpg";
import img5 from "@/assets/discover2/khue-decoration.jpg";
import img6 from "@/assets/discover2/Phoenix_10_cinematic_luxury_restaurant_interior_warm_lighting_3.jpg";
import img7 from "@/assets/discover2/red-salt-room-by-david.jpg";
import img8 from "@/assets/discover2/ristorante-rinuccini.jpg";
import videoSrc from "@/assets/discover2/restaurant-videoplayback.mp4";

// ─── Parallax floating image panels ──────────────────────────────────────────
// STRICT EDITORIAL SEPARATION:
// 1. Left side has 4 distinct lanes with staggered vertical anchors & delays.
// 2. Right side has 4 distinct lanes with staggered vertical anchors & delays.
// 3. The center channel (30% to 70%) is completely clear so text and video
//    remain unobstructed and background images NEVER cover or hide each other.
const PARALLAX_IMAGES = [
  // ── LEFT WING ─────────────────────────────────────────────────────────────
  // Panel 1: Upper-left outer edge
  {
    src: img2,
    className: "w-[18vw] min-w-[160px] max-w-[280px] left-[3%] top-[18%] z-[4]",
    aspectRatio: "16/9",
    delay: 4.8,
    duration: 6.8,
    yEnd: "-155vh",
  },
  // Panel 2: Mid-left flank
  {
    src: img6,
    className: "w-[16vw] min-w-[150px] max-w-[260px] left-[13%] top-[54%] z-[3]",
    aspectRatio: "4/3",
    delay: 5.6,
    duration: 6.5,
    yEnd: "-145vh",
  },
  // Panel 3: Lower-left outer edge
  {
    src: img1,
    className: "hidden md:block w-[13vw] min-w-[130px] max-w-[210px] left-[2%] top-[78%] z-[5]",
    aspectRatio: "16/9",
    delay: 6.4,
    duration: 6.2,
    yEnd: "-135vh",
  },
  // Panel 4: Lower-left inner flank
  {
    src: img5,
    className: "hidden lg:block w-[14vw] min-w-[140px] max-w-[220px] left-[16%] top-[90%] z-[2]",
    aspectRatio: "4/3",
    delay: 7.2,
    duration: 6.0,
    yEnd: "-130vh",
  },

  // ── RIGHT WING ────────────────────────────────────────────────────────────
  // Panel 5: Upper-right outer edge
  {
    src: img4,
    className: "w-[19vw] min-w-[170px] max-w-[300px] right-[3%] top-[20%] z-[6]",
    aspectRatio: "16/9",
    delay: 5.0,
    duration: 6.8,
    yEnd: "-155vh",
  },
  // Panel 6: Mid-right flank
  {
    src: img7,
    className: "w-[16vw] min-w-[150px] max-w-[260px] right-[12%] top-[56%] z-[4]",
    aspectRatio: "4/3",
    delay: 5.8,
    duration: 6.5,
    yEnd: "-145vh",
  },
  // Panel 7: Lower-right outer edge
  {
    src: img3,
    className: "hidden md:block w-[14vw] min-w-[140px] max-w-[220px] right-[2%] top-[80%] z-[5]",
    aspectRatio: "16/9",
    delay: 6.6,
    duration: 6.2,
    yEnd: "-135vh",
  },
  // Panel 8: Lower-right inner flank
  {
    src: img8,
    className: "hidden lg:block w-[15vw] min-w-[150px] max-w-[240px] right-[16%] top-[92%] z-[2]",
    aspectRatio: "4/3",
    delay: 7.4,
    duration: 6.0,
    yEnd: "-130vh",
  },
];

export function DiscoverCinematicStory() {
  const containerRef    = useRef(null);
  const bgRef           = useRef(null);
  const textRef         = useRef(null);   // outer text wrapper
  const headingRef      = useRef(null);   // h2 element — for color animation
  const subtitleRef     = useRef(null);   // p element — for color animation
  const videoRef        = useRef(null);
  const videoWrapperRef = useRef(null);
  const imgRefs         = useRef([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // ── Detect prefers-reduced-motion ─────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const onChange = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // ── Main GSAP scroll-driven animation ─────────────────────────────────────
  useEffect(() => {
    if (isReducedMotion) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Central Video Initial Setup (STRICT 16:9 LANDSCAPE) ───────────────
      // Anchored at top 50% / left 50%.
      // Uniform scaling ensures 100% locked 16:9 aspect ratio at all times.
      gsap.set(videoWrapperRef.current, {
        xPercent: -50,
        yPercent: -50,
        y: "130vh",
        scale: 1,
        opacity: 0,
        borderRadius: "20px",
      });

      // ── Text Initial State: 100% VISIBLE FROM FRAME 0 ─────────────────────
      // "Every table has a story..." is the primary visual entry point of the section.
      // It is fully visible on the bright cream background as the user reaches it,
      // creating ZERO blank empty space after the restaurant cards.
      gsap.set(textRef.current, {
        opacity: 1,
        y: 0,
      });

      // ── Master Scroll Timeline (pinned, scrub) ───────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=500%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onUpdate(self) {
            // Video playback starts when approaching fullscreen dominance
            if (self.progress > 0.92) {
              if (videoRef.current?.paused) videoRef.current.play().catch(() => {});
            } else {
              if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
            }
          },
        },
      });

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 1 — Text is PRESENT & subtly settles (tl 0.0 → 0.8)
      //           Text is 100% visible from scroll 0.
      //           As user begins scrolling, it gently anchors in place.
      // ═══════════════════════════════════════════════════════════════════
      tl.fromTo(
        textRef.current,
        { y: 12 },
        { y: 0, ease: "power2.out", duration: 0.8 },
        0
      );

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 2 — Bright → Dark environment transition (tl 0.6 → 3.6)
      //           Background darkens AROUND the visible text.
      //           Heading & subtitle transition from dark to crisp white.
      //           Red "has a story" accent remains bright red throughout.
      // ═══════════════════════════════════════════════════════════════════
      tl.to(
        bgRef.current,
        {
          backgroundColor: "#080808",
          ease: "power2.inOut",
          duration: 3.0,
        },
        0.6
      );

      tl.to(
        headingRef.current,
        {
          color: "#ffffff",
          ease: "power1.inOut",
          duration: 2.5,
        },
        0.6
      );

      tl.to(
        subtitleRef.current,
        {
          color: "rgba(255, 255, 255, 0.85)",
          ease: "power1.inOut",
          duration: 2.5,
        },
        0.6
      );

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 3 — Parallax background panels float through wings (tl 4.8 → 8.5)
      //           Images enter AFTER dark environment is established.
      //           Staggered across left and right sides with clear center.
      // ═══════════════════════════════════════════════════════════════════
      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        const cfg = PARALLAX_IMAGES[i];
        tl.fromTo(
          el,
          { y: "150vh", opacity: 0, scale: 0.92 },
          {
            y: cfg.yEnd,
            opacity: Math.max(0.35, 0.90 - (i % 4) * 0.08),
            scale: 1,
            ease: "none",
            duration: cfg.duration,
          },
          cfg.delay
        );
      });

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 4 — 16:9 Video rises cleanly behind text (tl 7.2 → 9.0)
      //           Maintains exact 16:9 landscape aspect ratio.
      // ═══════════════════════════════════════════════════════════════════
      tl.to(
        videoWrapperRef.current,
        {
          y: "0vh",
          opacity: 1,
          ease: "power2.out",
          duration: 1.8,
        },
        7.2
      );

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 5 — Video holds in center / composition breathes (tl 9.0 → 9.6)
      // ═══════════════════════════════════════════════════════════════════
      tl.to(
        videoWrapperRef.current,
        {
          y: "0vh",
          duration: 0.6,
        },
        9.0
      );

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 6 — Text fades as video expands to fullscreen (tl 9.4 → 10.2)
      // ═══════════════════════════════════════════════════════════════════
      tl.to(
        textRef.current,
        {
          opacity: 0,
          y: -28,
          ease: "power2.in",
          duration: 0.8,
        },
        9.4
      );

      // ═══════════════════════════════════════════════════════════════════
      // PHASE 7 — Video expands to Fullscreen Viewport (tl 9.6 → 11.5)
      //           Uniform scaling covers viewport with zero 9:16 glitch.
      // ═══════════════════════════════════════════════════════════════════
      tl.to(
        videoWrapperRef.current,
        {
          scale: 2.8,
          borderRadius: "0px",
          ease: "power3.inOut",
          duration: 1.9,
        },
        9.6
      );

    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  // ── Reduced-motion fallback ────────────────────────────────────────────────
  if (isReducedMotion) {
    return (
      <section className="relative w-full py-24 bg-[#080808] text-white flex flex-col items-center justify-center gap-12 overflow-hidden">
        <div className="text-center max-w-4xl px-4">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            Every table
            <br />
            <span className="text-primary/90 italic font-serif">has a story</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80">
            Discover moments worth sharing. Taste the unexpected.
          </p>
        </div>
        <div className="w-[90vw] max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <video src={videoSrc} muted playsInline controls className="w-full h-full object-cover" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      aria-label="Cinematic dining story"
    >
      {/* ── Layer 0: Background (starts as page background color, darkens via GSAP) */}
      <div ref={bgRef} className="absolute inset-0 bg-background z-0" />

      {/* ── Layer 2–9: Floating Editorial Dining Images ────────────────────────
          Separated into distinct left/right wings with intentional spacing.
          Center channel is 100% clear. No images overlap or hide each other. */}
      {PARALLAX_IMAGES.map(({ src, className, aspectRatio }, idx) => (
        <img
          key={idx}
          ref={el => { imgRefs.current[idx] = el; }}
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`absolute object-cover shadow-[0_12px_44px_rgba(0,0,0,0.55)] rounded-2xl opacity-0 ${className}`}
          style={{
            aspectRatio,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ── Layer 10: Central 16:9 Cinematic Video ────────────────────────────
          Maintains strict 16:9 aspect-video geometry with zero distortion.
          Scales uniformly into fullscreen without ever turning into 9:16. */}
      <div
        ref={videoWrapperRef}
        className="absolute top-1/2 left-1/2 z-10 overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.85)] w-[75vw] sm:w-[58vw] md:w-[48vw] max-w-[780px] aspect-video rounded-2xl"
        style={{
          willChange: "transform, border-radius",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          loop
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Layer 30: Central Editorial Text ──────────────────────────────────
          PART OF INITIAL VISUAL STATE: Crisp, visible, and immediately readable
          on the bright cream background as soon as the user reaches the section.
          Heading & subtitle animate from dark to pure white as environment darkens.
          Red "has a story" accent is untouched. */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-4">
        <div ref={textRef} className="text-center">

          {/* Heading (h2): starts dark (#111111), animates to #ffffff */}
          <h2
            ref={headingRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-4"
            style={{ color: "#111111" }}
          >
            Every table
            <br />
            <span
              className="text-primary italic font-serif tracking-normal"
            >
              has a story
            </span>
          </h2>

          {/* Subtitle: starts dark (#555555), animates to white/85 */}
          <p
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-2xl font-medium max-w-xl mx-auto"
            style={{ color: "#555555" }}
          >
            Discover moments worth sharing.&nbsp;Taste the unexpected.
          </p>

        </div>
      </div>
    </section>
  );
}
