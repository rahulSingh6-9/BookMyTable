import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import img1 from "@/assets/discover/group-people-toasting-with-wine-glasses_118124-274649.jpg";
import img2 from "@/assets/discover/joyful-dinner-party-stockcake.jpg";
import img3 from "@/assets/discover/midknightfox17_Savoring_Celebration_5_Must-Try_NYC_Dinner_Party_e8ad85e4-838e-4aec-88de-da7e7ad92c36-1024x574.webp";
import img4 from "@/assets/discover/young-indian-couple-enjoying-romantic-dinner_641503-88462.jpg";

const DISCOVER_SLIDES = [
  {
    id: "toasting",
    src: img1,
    tag: "GATHER & CELEBRATE",
    title: "Unforgettable Dining Moments",
    description: "Toast to life's special occasions at premier hand-picked culinary venues."
  },
  {
    id: "party",
    src: img2,
    tag: "VIBRANT AMBIENCE",
    title: "Joyful Dinner Gatherings",
    description: "Immerse in lively atmospheres and exceptional chef-curated creations."
  },
  {
    id: "nyc-dinner",
    src: img3,
    tag: "EDITORIAL SELECTION",
    title: "Curated Nightlife & Dining",
    description: "Explore top-rated tables and hidden gastronomic gems across the city."
  },
  {
    id: "romantic",
    src: img4,
    tag: "INTIMATE EXPERIENCES",
    title: "Candlelight & Fine Cuisine",
    description: "Reserve cozy, elegant tables crafted for unforgettable romantic evenings."
  }
];

// Cache preloaded images to avoid redundant network requests
const preloadedCache = new Set();

const preloadImage = (src) => {
  return new Promise((resolve) => {
    if (!src || preloadedCache.has(src)) {
      return resolve();
    }
    const img = new Image();
    img.src = src;
    const onDone = () => {
      preloadedCache.add(src);
      resolve();
    };
    if (img.complete) {
      if (img.decode) {
        img.decode().then(onDone).catch(onDone);
      } else {
        onDone();
      }
    } else {
      img.onload = () => {
        if (img.decode) {
          img.decode().then(onDone).catch(onDone);
        } else {
          onDone();
        }
      };
      img.onerror = () => resolve();
    }
  });
};

export function DiscoverCinematicHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const heroRef = useRef(null);
  const revealContainerRef = useRef(null);
  const lineRef = useRef(null);
  const baseImgRef = useRef(null);
  const revealImgRef = useRef(null);
  
  // Refs for tracking animation state inside GSAP context without re-renders
  const currentIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  // Sync index ref
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  // Preload and decode all slides on mount to prevent any runtime decoding hiccups
  useEffect(() => {
    DISCOVER_SLIDES.forEach((slide) => {
      preloadImage(slide.src);
    });
  }, []);

  // Main GSAP Cinematic Reveal Loop
  useEffect(() => {
    if (isReducedMotion) return;

    let isMounted = true;

    const ctx = gsap.context(() => {
      let timerId;

      const triggerNextWipe = () => {
        if (isAnimatingRef.current || !isMounted) return;
        isAnimatingRef.current = true;

        const currentIdx = currentIndexRef.current;
        const upcomingIdx = (currentIdx + 1) % DISCOVER_SLIDES.length;
        const nextSlideSrc = DISCOVER_SLIDES[upcomingIdx].src;

        // Ensure next image is preloaded and decoded before initiating wipe transition
        preloadImage(nextSlideSrc).then(() => {
          if (!isMounted || !revealContainerRef.current || !lineRef.current) {
            isAnimatingRef.current = false;
            return;
          }

          // Ensure reveal image has the expected upcoming slide
          if (revealImgRef.current && revealImgRef.current.src !== nextSlideSrc) {
            revealImgRef.current.src = nextSlideSrc;
          }

          // Make line visible at right edge (100%)
          lineRef.current.style.left = "100%";
          revealContainerRef.current.style.clipPath = "inset(0 0 0 100%)";
          
          // Fade line in smoothly
          gsap.to(lineRef.current, {
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
            onComplete: () => {
              if (!isMounted) return;
              const progressObj = { value: 100 };

              // Custom non-linear easing curve: smooth acceleration, fast middle, controlled finish
              gsap.to(progressObj, {
                value: 0,
                duration: 1.7,
                ease: "power3.inOut",
                onUpdate: () => {
                  const val = progressObj.value;
                  if (revealContainerRef.current) {
                    // Reveal from Right to Left as line moves 100% -> 0%
                    revealContainerRef.current.style.clipPath = `inset(0 0 0 ${val}%)`;
                  }
                  if (lineRef.current) {
                    lineRef.current.style.left = `${val}%`;
                  }
                },
                onComplete: () => {
                  if (!isMounted) return;
                  // Fade line out at left boundary (0%)
                  gsap.to(lineRef.current, {
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.in",
                    onComplete: async () => {
                      if (!isMounted) return;

                      // 1. Synchronously swap the base image underneath to the now-visible upcoming slide
                      if (baseImgRef.current) {
                        baseImgRef.current.src = DISCOVER_SLIDES[upcomingIdx].src;
                        if (baseImgRef.current.decode) {
                          try {
                            await baseImgRef.current.decode();
                          } catch (_) {}
                        }
                      }

                      // 2. Await animation frame to guarantee base image has completed rendering underneath
                      await new Promise((r) => requestAnimationFrame(r));
                      if (!isMounted) return;

                      // 3. Reset revealContainer clipPath to 100% and line to 100%.
                      // Because the base layer is now rendering the exact same upcomingIdx image,
                      // resetting the reveal layer produces 0 visual change (pixel-identical).
                      if (revealContainerRef.current) {
                        revealContainerRef.current.style.clipPath = "inset(0 0 0 100%)";
                      }
                      if (lineRef.current) {
                        lineRef.current.style.left = "100%";
                      }

                      // 4. Now that revealContainer is hidden at 100%, update revealImg to the next upcoming slide
                      const newCurrent = upcomingIdx;
                      const newNext = (newCurrent + 1) % DISCOVER_SLIDES.length;
                      currentIndexRef.current = newCurrent;

                      if (revealImgRef.current) {
                        revealImgRef.current.src = DISCOVER_SLIDES[newNext].src;
                      }

                      // 5. Update React state for captions and slide indices
                      setCurrentIndex(newCurrent);
                      setNextIndex(newNext);

                      isAnimatingRef.current = false;

                      // 6. Preload upcoming slide
                      preloadImage(DISCOVER_SLIDES[newNext].src);

                      // 7. Schedule next wipe after organic hold duration
                      const holdDuration = 3200 + (newCurrent % 2 === 0 ? 200 : -200);
                      timerId = setTimeout(triggerNextWipe, holdDuration);
                    }
                  });
                }
              });
            }
          });
        });
      };

      // Initial hold period before first wipe
      timerId = setTimeout(triggerNextWipe, 3400);

      return () => {
        isMounted = false;
        if (timerId) clearTimeout(timerId);
      };
    }, heroRef);

    return () => {
      isMounted = false;
      ctx.revert();
    };
  }, [isReducedMotion]);

  const currentSlide = DISCOVER_SLIDES[currentIndex];
  const nextSlide = DISCOVER_SLIDES[nextIndex];

  return (
    <div
      ref={heroRef}
      className="relative w-full h-[65vw] min-h-[280px] sm:h-[calc(100vh-4rem)] sm:min-h-[500px] md:min-h-[600px] overflow-hidden bg-black/90 group select-none"
    >
      {/* Layer 1: Base Image (Current Slide) */}
      <img
        ref={baseImgRef}
        src={currentSlide.src}
        alt={currentSlide.title}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
      />

      {/* Layer 2: Top Reveal Image (Next Slide - progressively revealed by R->L clipPath) */}
      {!isReducedMotion && (
        <div
          ref={revealContainerRef}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: "inset(0 0 0 100%)" }}
        >
          <img
            ref={revealImgRef}
            src={nextSlide.src}
            alt={nextSlide.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />
        </div>
      )}

      {/* Layer 3: Vertical Reveal Line (R -> L wipe boundary) */}
      {!isReducedMotion && (
        <div
          ref={lineRef}
          className="absolute top-0 bottom-0 w-[2px] z-20 pointer-events-none opacity-0"
          style={{
            left: "100%",
            transform: "translateX(-50%)",
            background: "linear-gradient(to bottom, transparent, #e11d48 15%, #fb7185 50%, #e11d48 85%, transparent)",
            boxShadow: "0 0 14px rgba(225, 29, 72, 0.95), 0 0 28px rgba(225, 29, 72, 0.6), 0 0 2px #ffffff"
          }}
        >
          {/* Accent Nodes at top and bottom of the line */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#e11d48]" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#e11d48]" />
        </div>
      )}

      {/* Layer 4: Cinematic Subtle Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none z-10" />

     



      {/* Bottom Text Content & Captions */}
      <div className="absolute bottom-4 left-4 sm:bottom-14 sm:left-10 md:left-14 right-4 sm:right-6 max-w-2xl z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-1.5 sm:space-y-2.5"
          >
            <div className="inline-block px-3 py-1 rounded bg-primary/30 border border-primary/50 backdrop-blur-md text-xs font-extrabold tracking-widest text-white uppercase shadow-sm">
              {currentSlide.tag}
            </div>
            <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-base md:text-lg text-white/90 line-clamp-2 max-w-xl font-medium leading-snug sm:leading-relaxed drop-shadow-md">
              {currentSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:flex flex-col items-center opacity-70 animate-bounce">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 mb-1">Scroll to explore</span>
        <div className="w-5 h-5 border-b-2 border-r-2 border-white transform rotate-45" />
      </div>
    </div>
  );
}
