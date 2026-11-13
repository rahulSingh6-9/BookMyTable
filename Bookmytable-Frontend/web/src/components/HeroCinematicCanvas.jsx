import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { restaurants as fallbackRestaurants } from "@/lib/data.js";
import { dummyRestaurants } from "@/lib/dummyRestaurants";
import { DemoRestaurantModal } from "@/components/common/DemoRestaurantModal";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame sequence config ─────────────────────────────────────────────────────
const FRAME_COUNT  = 199;
const FRAME_BASE   = "/frames/";
const FRAME_PREFIX = "0922(1)_";
const FRAME_EXT    = ".jpg";
const MAX_DPR      = 2;

// Lerp smoothing
const LERP_FACTOR    = 0.12;
const SNAP_THRESHOLD = 0.08;

function frameSrc(i) {
  return `${FRAME_BASE}${FRAME_PREFIX}${String(i).padStart(3, "0")}${FRAME_EXT}`;
}

// Module-level image cache
const imgCache  = new Array(FRAME_COUNT).fill(null);
const loadState = new Array(FRAME_COUNT).fill(0); // 0=idle, 1=loading, 2=ready

// ─── Continuous Looping Restaurant Card Stream ────────────────────────────────
const DESKTOP_CARD_WIDTH = 210;
const DESKTOP_CARD_GAP = 20;
const MOBILE_CARD_WIDTH = 160;
const MOBILE_CARD_GAP = 14;
const STREAM_SPEED = 60; // px/sec
const RESUME_DELAY = 2500; // ms idle before auto-scroll resumes after manual interaction

function getStreamDimensions() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      cardWidth: DESKTOP_CARD_WIDTH,
      cardGap: DESKTOP_CARD_GAP,
      pitch: DESKTOP_CARD_WIDTH + DESKTOP_CARD_GAP,
    };
  }
  const isMobile = window.innerWidth < 640;
  const cardWidth = isMobile ? MOBILE_CARD_WIDTH : DESKTOP_CARD_WIDTH;
  const cardGap = isMobile ? MOBILE_CARD_GAP : DESKTOP_CARD_GAP;
  return { isMobile, cardWidth, cardGap, pitch: cardWidth + cardGap };
}

/**
 * HeroRestaurantStream — High-Performance Seamless Infinite Carousel
 *
 * Architecture:
 * - Contiguous 3-cycle flex track (Cycle 0, Cycle 1, Cycle 2).
 * - Total cycle width W dynamically ensures 1 cycle exceeds viewport width + 600px.
 * - Single track transform `translate3d(trackOffset, 0, 0)` updated directly
 *   via RAF during auto-scrolling and direct pointer move during drag.
 * - Seamless wrapping: when trackOffset <= -2W, trackOffset += W (0 visual jump).
 * - When trackOffset >= 0, trackOffset -= W (0 visual jump).
 * - Drag delta directly updates trackOffset without competing CSS transitions or RAF lag.
 * - Smooth resume after 2.5s idle delay, hover-pause preserved.
 * - Draggable/selectable defaults disabled to prevent ghosting.
 * - Click vs drag detection preserves click navigation while preventing accidental link triggers on drag.
 */
function HeroRestaurantStream({ restaurants, isActive, onDemoClick }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isHoveredRef = useRef(false);
  const manualPauseRef = useRef(false);
  const idleTimerRef = useRef(null);
  const clickBlockTimerRef = useRef(null);

  const [dims, setDims] = useState(getStreamDimensions);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const baseList = restaurants && restaurants.length > 0 ? restaurants : fallbackRestaurants;

  // Build 3 seamless cycles of cards
  const { allCards, cycleWidth } = useMemo(() => {
    const pitch = dims.pitch;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const minW = Math.max(vw + 600, 2400);
    const singlePassWidth = Math.max(1, baseList.length * pitch);
    const repeats = Math.max(1, Math.ceil(minW / singlePassWidth));

    const oneCycle = [];
    for (let r = 0; r < repeats; r++) {
      for (let i = 0; i < baseList.length; i++) {
        oneCycle.push(baseList[i]);
      }
    }

    return {
      allCards: [...oneCycle, ...oneCycle, ...oneCycle],
      cycleWidth: oneCycle.length * pitch,
    };
  }, [baseList, dims.pitch]);

  const cycleWidthRef = useRef(cycleWidth);
  const offsetRef = useRef(-cycleWidth);

  const dragStateRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    didDrag: false,
  });

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const next = getStreamDimensions();
      if (next.isMobile !== dimsRef.current.isMobile || next.pitch !== dimsRef.current.pitch) {
        setDims(next);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync track offset when cycle width changes
  useEffect(() => {
    const oldW = cycleWidthRef.current;
    const newW = cycleWidth;
    cycleWidthRef.current = newW;

    if (oldW && oldW > 0 && offsetRef.current !== 0) {
      const phase = (((-offsetRef.current) % oldW) + oldW) % oldW / oldW;
      offsetRef.current = -(newW + phase * newW);
    } else {
      offsetRef.current = -newW;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0px, 0px)`;
    }
  }, [cycleWidth]);

  // Pointer drag gestures (mouse + touch)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      dragStateRef.current = {
        isDown: true,
        isDragging: false,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        didDrag: false,
      };

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const onPointerMove = (e) => {
      const ds = dragStateRef.current;
      if (!ds.isDown) return;

      const dx = e.clientX - ds.lastX;
      ds.lastX = e.clientX;

      const totalX = Math.abs(e.clientX - ds.startX);
      const totalY = Math.abs(e.clientY - ds.startY);

      if (!ds.isDragging) {
        if (totalX > 4 && totalX > totalY) {
          ds.isDragging = true;
          ds.didDrag = true;
          manualPauseRef.current = true;
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          if (containerRef.current) {
            containerRef.current.style.cursor = "grabbing";
          }
        } else {
          return;
        }
      }

      if (ds.isDragging) {
        offsetRef.current += dx;
        const W = cycleWidthRef.current;
        while (offsetRef.current <= -2 * W) {
          offsetRef.current += W;
        }
        while (offsetRef.current >= 0) {
          offsetRef.current -= W;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0px, 0px)`;
        }
      }
    };

    const onPointerUp = () => {
      const ds = dragStateRef.current;
      if (!ds.isDown) return;

      ds.isDown = false;
      ds.isDragging = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = "";
      }

      if (ds.didDrag) {
        if (clickBlockTimerRef.current) clearTimeout(clickBlockTimerRef.current);
        clickBlockTimerRef.current = setTimeout(() => {
          ds.didDrag = false;
        }, 150);
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        manualPauseRef.current = false;
      }, RESUME_DELAY);
    };

    // ── Two-Finger Trackpad / Wheel Horizontal Scrolling ─────────────────────
    const onWheel = (e) => {
      // If user is actively dragging with pointer, ignore wheel
      if (dragStateRef.current.isDown) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // If no horizontal delta, or if the gesture is predominantly vertical,
      // allow normal vertical page scrolling to proceed undisturbed
      if (absX <= 0 || absX <= absY) {
        return;
      }

      // Predominantly horizontal gesture: handle carousel scroll & prevent browser history back/forward navigation
      e.preventDefault();

      let delta = e.deltaX;
      if (e.deltaMode === 1) {
        delta *= 20; // line scroll
      } else if (e.deltaMode === 2) {
        delta *= window.innerWidth; // page scroll
      }

      manualPauseRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Two-finger swipe left (deltaX > 0) advances track (decreases offset).
      // Two-finger swipe right (deltaX < 0) reverses track (increases offset).
      offsetRef.current -= delta;
      const W = cycleWidthRef.current;
      while (offsetRef.current <= -2 * W) {
        offsetRef.current += W;
      }
      while (offsetRef.current >= 0) {
        offsetRef.current -= W;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0px, 0px)`;
      }

      // Resume auto-scroll after idle delay
      idleTimerRef.current = setTimeout(() => {
        manualPauseRef.current = false;
      }, RESUME_DELAY);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (clickBlockTimerRef.current) clearTimeout(clickBlockTimerRef.current);
    };
  }, []);

  // Continuous auto-scrolling animation loop
  useEffect(() => {
    let animId = null;
    let lastTime = performance.now();

    function loop(time) {
      if (!isActive) {
        lastTime = time;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Auto-scroll when not hovered and not manually paused
      if (!isHoveredRef.current && !manualPauseRef.current) {
        offsetRef.current -= STREAM_SPEED * dt;
        const W = cycleWidthRef.current;
        while (offsetRef.current <= -2 * W) {
          offsetRef.current += W;
        }
        while (offsetRef.current >= 0) {
          offsetRef.current -= W;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0px, 0px)`;
        }
      }

      animId = requestAnimationFrame(loop);
    }

    lastTime = performance.now();
    animId = requestAnimationFrame(loop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[132px] sm:h-[155px] overflow-hidden select-none pointer-events-auto cursor-grab active:cursor-grabbing"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      style={{ userSelect: "none", touchAction: "pan-y" }}
    >
      <div
        ref={trackRef}
        className="flex items-center h-full will-change-transform"
        style={{
          gap: `${dims.cardGap}px`,
          width: "max-content",
          transform: `translate3d(${offsetRef.current}px, 0px, 0px)`,
        }}
      >
        {allCards.map((r, index) => {
          const cardContent = (
            <>
              <div className="relative h-16 sm:h-24 w-full overflow-hidden bg-neutral-200">
                <img
                  src={r.coverImage || r.image}
                  alt={r.name}
                  className="stream-card-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                  loading="lazy"
                  draggable={false}
                />
                {r.isDemo && (
                  <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                    DEMO
                  </div>
                )}
                {!r.isDemo && (
                  <div className="stream-card-price absolute top-1 sm:top-1.5 left-1 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm text-[9px] sm:text-[10px] font-medium text-[#c8a46e]">
                    {r.priceRange || "$$$"}
                  </div>
                )}
                <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm text-[9px] sm:text-[10px] font-medium text-neutral-800 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#c8a46e] text-[#c8a46e]" />
                  <span className="stream-card-rating">
                    {r.totalReviews > 0 && r.averageRating
                      ? Number(r.averageRating).toFixed(1)
                      : (r.rating || "New")}
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-2.5 text-left">
                <h4 className="stream-card-title text-[11px] sm:text-xs font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
                  {r.name}
                </h4>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-neutral-500 truncate mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-[#c8a46e]" />
                  <span className="stream-card-meta truncate">
                    {r.city || "Mumbai"} · {r.cuisine || "Fine Dining"}
                  </span>
                </div>
              </div>
            </>
          );

          return (
            <div
              key={index}
              style={{ width: `${dims.cardWidth}px`, flexShrink: 0 }}
            >
              {r.isDemo ? (
                <button
                  type="button"
                  className="stream-card-link block group rounded-xl overflow-hidden bg-white backdrop-blur-md border border-[#c8a46e]/30 hover:border-primary shadow-lg hover:shadow-[0_8px_25px_hsl(var(--primary)/0.35)] transition-all duration-300 w-full text-left cursor-pointer"
                  draggable={false}
                  onClick={() => {
                    if (dragStateRef.current.didDrag) return;
                    onDemoClick && onDemoClick(r.name || r.branchName || "Demo Restaurant");
                  }}
                >
                  {cardContent}
                </button>
              ) : (
                <Link
                  to={`/restaurant/${r.slug || r.restaurantId || r.id}`}
                  className="stream-card-link block group rounded-xl overflow-hidden bg-white backdrop-blur-md border border-[#c8a46e]/30 hover:border-primary shadow-lg hover:shadow-[0_8px_25px_hsl(var(--primary)/0.35)] transition-all duration-300"
                  draggable={false}
                  onClick={(e) => {
                    if (dragStateRef.current.didDrag) {
                      e.preventDefault();
                    }
                  }}
                >
                  {cardContent}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



function BrandName() {
  return (
    <span className="inline-block tracking-normal">
      <span style={{ color: "#ffffff" }}>Book</span>
      <span style={{ color: "hsl(var(--primary))" }}>My</span>
      <span style={{ color: "#ffffff" }}>Table</span>
    </span>
  );
}

/**
 * HeroCinematicCanvas
 *
 * Combines the 199-frame high-performance canvas player with the 4-state
 * cinematic storytelling text overlay and the continuous restaurant card stream
 * under a SINGLE unified ScrollTrigger.
 */
export default function HeroCinematicCanvas({ triggerRef, restaurants: propRestaurants }) {
  const canvasRef = useRef(null);
  const s1Ref = useRef(null);
  const s1BadgeRef = useRef(null);
  const s1HeadRef = useRef(null);
  const s1DescRef = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);
  const cardsContainerRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [demoModal, setDemoModal] = useState({ isOpen: false, restaurantName: "" });

  // ── Mix real + demo restaurants (interleaved) ─────────────────────────────
  const allRestaurants = useMemo(() => {
    const realList = (propRestaurants && propRestaurants.length > 0)
      ? propRestaurants
      : fallbackRestaurants;

    // Mark demo restaurants clearly
    const demoList = dummyRestaurants.map(d => ({ ...d, isDemo: true }));

    // Interleave: insert 1 demo every 2 real cards
    const mixed = [];
    let di = 0;
    for (let ri = 0; ri < realList.length; ri++) {
      mixed.push(realList[ri]);
      if ((ri + 1) % 2 === 0 && di < demoList.length) {
        mixed.push(demoList[di++]);
      }
    }
    // Append remaining demo restaurants
    while (di < demoList.length) {
      mixed.push(demoList[di++]);
    }

    return mixed;
  }, [propRestaurants]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    const targetSection = triggerRef?.current || canvas?.closest("section");
    if (!canvas || !targetSection) return;

    // ── Animation state for RAF loop ─────────────────────────────────────────
    const s = {
      ctx:          null,
      canvasW:      0,
      canvasH:      0,
      dpr:          1,
      currentFrame: 0.0,
      targetFrame:  0,
      lastPainted:  -1,
      rafId:        null,
      isAnimating:  false,
    };

    // ── Canvas sizing ─────────────────────────────────────────────────────────
    function sizeCanvas() {
      s.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const pw = Math.round(w * s.dpr);
      const ph = Math.round(h * s.dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width  = pw;
        canvas.height = ph;
      }
      s.canvasW = canvas.width;
      s.canvasH = canvas.height;
      s.ctx = canvas.getContext("2d", { alpha: false });
      s.ctx.imageSmoothingEnabled = true;
      s.ctx.imageSmoothingQuality = "high";
    }

    // ── Object-fit cover draw ─────────────────────────────────────────────────
    function paintFrame(index) {
      if (!s.ctx || s.canvasW === 0) return;
      const idx = Math.max(0, Math.min(FRAME_COUNT - 1, index));

      let img = imgCache[idx];
      if (!img || loadState[idx] !== 2) {
        let lo = idx - 1, hi = idx + 1;
        while (lo >= 0 || hi < FRAME_COUNT) {
          if (lo >= 0 && loadState[lo] === 2) { img = imgCache[lo]; break; }
          if (hi < FRAME_COUNT && loadState[hi] === 2) { img = imgCache[hi]; break; }
          lo--; hi++;
        }
        if (!img) return;
      }

      const imgAR = img.naturalWidth / img.naturalHeight;
      const canAR = s.canvasW / s.canvasH;
      let sx, sy, sw, sh;
      if (canAR > imgAR) {
        sw = img.naturalWidth; sh = sw / canAR;
        sx = 0;               sy = (img.naturalHeight - sh) * 0.5;
      } else {
        sh = img.naturalHeight; sw = sh * canAR;
        sy = 0;                sx = (img.naturalWidth - sw) * 0.5;
      }
      s.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, s.canvasW, s.canvasH);
      s.lastPainted = idx;
    }

    // ── On-demand RAF lerp loop (Pauses when stationary) ──────────────────────
    function requestFrameUpdate() {
      if (!s.isAnimating) {
        s.isAnimating = true;
        s.rafId = requestAnimationFrame(loop);
      }
    }

    function loop() {
      const diff = s.targetFrame - s.currentFrame;
      if (Math.abs(diff) < SNAP_THRESHOLD) {
        s.currentFrame = s.targetFrame;
        s.isAnimating = false;
      } else {
        s.currentFrame += diff * LERP_FACTOR;
        s.rafId = requestAnimationFrame(loop);
      }
      const rounded = Math.round(s.currentFrame);
      if (rounded !== s.lastPainted) paintFrame(rounded);
    }

    // ── Bounded Progressive Image Preloader ────────────────────────────────────
    let loadAborted = false;

    function loadOne(i) {
      if (loadState[i] !== 0) return Promise.resolve();
      loadState[i] = 1;
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (!loadAborted) {
            imgCache[i] = img;
            loadState[i] = 2;
          }
          resolve();
        };
        img.onerror = () => {
          loadState[i] = 0;
          resolve();
        };
        img.src = frameSrc(i);
        imgCache[i] = img;
      });
    }

    async function preload() {
      // Phase 1: first 10 frames sequential for immediate first paint
      for (let i = 0; i < Math.min(10, FRAME_COUNT) && !loadAborted; i++) {
        await loadOne(i);
        if (i === 0) paintFrame(0);
      }

      // Phase 2: key frames (every 3rd frame) in small batches of 6 for rapid initial scroll coverage
      const keyFrames = [];
      for (let i = 10; i < FRAME_COUNT; i += 3) {
        keyFrames.push(i);
      }
      for (let b = 0; b < keyFrames.length && !loadAborted; b += 6) {
        const batch = keyFrames.slice(b, b + 6);
        await Promise.all(batch.map((i) => loadOne(i)));
        await new Promise((r) => setTimeout(r, 20));
      }

      // Phase 3: remaining missing frames in small idle batches
      for (let i = 0; i < FRAME_COUNT && !loadAborted; i++) {
        if (loadState[i] === 0) {
          await loadOne(i);
          if (i % 6 === 0) {
            await new Promise((r) => setTimeout(r, 30));
          }
        }
      }
    }

    // ── Resize handler ────────────────────────────────────────────────────────
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
        paintFrame(Math.round(s.currentFrame));
      }, 80);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Boot canvas
    sizeCanvas();
    paintFrame(0);
    preload();

    if (prefersReduced) {
      // Keep state 1 visible, others hidden
      if (s1Ref.current) gsap.set(s1Ref.current, { autoAlpha: 1 });
      if (s2Ref.current) gsap.set(s2Ref.current, { autoAlpha: 0 });
      if (s3Ref.current) gsap.set(s3Ref.current, { autoAlpha: 0 });
      if (s4Ref.current) gsap.set(s4Ref.current, { autoAlpha: 0 });
      if (cardsContainerRef.current) gsap.set(cardsContainerRef.current, { autoAlpha: 1, y: 0 });
      return () => {
        loadAborted = true;
        if (s.rafId) cancelAnimationFrame(s.rafId);
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    // ── Initial setup of text states ─────────────────────────────────────────
    if (s1Ref.current) gsap.set(s1Ref.current, { autoAlpha: 1, y: 0 });
    if (s2Ref.current) gsap.set(s2Ref.current, { autoAlpha: 0, y: 26 });
    if (s3Ref.current) gsap.set(s3Ref.current, { autoAlpha: 0, y: 26 });
    if (s4Ref.current) gsap.set(s4Ref.current, { autoAlpha: 0, y: 26 });
    if (cardsContainerRef.current) gsap.set(cardsContainerRef.current, { autoAlpha: 0, y: 25 });

    // ── Viewport Reveal Animation for Hero Introduction Text ─────────────────
    const s1Elements = [s1BadgeRef.current, s1HeadRef.current, s1DescRef.current].filter(Boolean);
    const s1Triggers = [];

    if (!prefersReduced && s1Elements.length > 0) {
      gsap.set(s1Elements, { opacity: 0, y: 60 });

      // 1. Badge / Eyebrow ("BOOK MY TABLE")
      if (s1BadgeRef.current) {
        const tween = gsap.to(s1BadgeRef.current, {
          scrollTrigger: {
            trigger: s1BadgeRef.current,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: 1.0,
          delay: 0.15,
          ease: "power3.out",
          clearProps: "transform",
        });
        if (tween.scrollTrigger) s1Triggers.push(tween.scrollTrigger);
      }

      // 2. Main Heading ("Discover your next dining experience")
      if (s1HeadRef.current) {
        const tween = gsap.to(s1HeadRef.current, {
          scrollTrigger: {
            trigger: s1HeadRef.current,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.28,
          ease: "power3.out",
          clearProps: "transform",
        });
        if (tween.scrollTrigger) s1Triggers.push(tween.scrollTrigger);
      }

      // 3. Supporting Description ("Every great meal begins...")
      if (s1DescRef.current) {
        const tween = gsap.to(s1DescRef.current, {
          scrollTrigger: {
            trigger: s1DescRef.current,
            start: "top 85%",
            once: true,
            invalidateOnRefresh: true,
          },
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.42,
          ease: "power3.out",
          clearProps: "transform",
        });
        if (tween.scrollTrigger) s1Triggers.push(tween.scrollTrigger);
      }
    } else if (s1Elements.length > 0) {
      gsap.set(s1Elements, { opacity: 1, y: 0 });
    }

    // ── SINGLE MASTER GSAP TIMELINE + SCROLLTRIGGER ──────────────────────────
    const master = gsap.timeline({
      scrollTrigger: {
        trigger:             targetSection,
        start:               "top top",
        end:                 "+=500%",
        pin:                 true,
        scrub:               0.8,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const cinematicProgress = Math.max(0, Math.min(1, self.progress / 0.58));
          s.targetFrame = Math.round(cinematicProgress * (FRAME_COUNT - 1));
          requestFrameUpdate();

          const isComplete = self.progress >= 1.0;
          setIsStreamActive(self.progress >= 0.58);

          window.dispatchEvent(
            new CustomEvent("cinematic-scroll-progress", {
              detail: { isComplete, progress: self.progress },
            })
          );
        },
        onLeave() {
          loadAborted = true;
          setIsStreamActive(false);
          window.dispatchEvent(
            new CustomEvent("cinematic-scroll-progress", {
              detail: { isComplete: true, progress: 1.0 },
            })
          );
        },
        onEnterBack() {
          setIsStreamActive(true);
          if (loadAborted) {
            loadAborted = false;
            preload();
          }
          window.dispatchEvent(
            new CustomEvent("cinematic-scroll-progress", {
              detail: { isComplete: false, progress: 0.95 },
            })
          );
        },
      },
    });

    // Anchor: ensures duration is normalized to 1.0
    master.to({}, { duration: 1 }, 0);

    // ── STATE 1: CENTER / INTRODUCTION ───────────────────────────────────────
    if (s1Ref.current) {
      master.to(
        s1Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.05 },
        0.12
      );
    }

    // ── STATE 2: LOWER-LEFT / DISCOVER ───────────────────────────────────────
    if (s2Ref.current) {
      master.fromTo(
        s2Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.05 },
        0.18
      ).to(
        s2Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.05 },
        0.29
      );
    }

    // ── STATE 3: LOWER-LEFT / CHOOSE ─────────────────────────────────────────
    if (s3Ref.current) {
      master.fromTo(
        s3Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.05 },
        0.35
      ).to(
        s3Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.05 },
        0.46
      );
    }

    // ── STATE 4: LOWER-RIGHT / BOOK & CTA ────────────────────────────────────
    if (s4Ref.current) {
      master.fromTo(
        s4Ref.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.04 },
        0.51
      ).to(
        s4Ref.current,
        { autoAlpha: 0, y: -20, ease: "power1.in", duration: 0.03 },
        0.57
      );
    }

    // ── FINAL MOMENT: FEATURED DISCOVERIES & STREAM (0.58 – 1.00) ────────────
    // Fully reversible with scroll: reveals at 0.58 on scroll down, disappears on reverse scroll up
    if (cardsContainerRef.current) {
      master.fromTo(
        cardsContainerRef.current,
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.06 },
        0.58
      );
    }

    return () => {
      loadAborted = true;
      s1Triggers.forEach((st) => st?.kill());
      if (cardsContainerRef.current) gsap.killTweensOf(cardsContainerRef.current);
      if (s1BadgeRef.current) gsap.killTweensOf(s1BadgeRef.current);
      if (s1HeadRef.current) gsap.killTweensOf(s1HeadRef.current);
      if (s1DescRef.current) gsap.killTweensOf(s1DescRef.current);
      master.scrollTrigger?.kill();
      master.kill();
      if (s.rafId) cancelAnimationFrame(s.rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reduced-motion fallback ───────────────────────────────────────────────
  if (prefersReduced) {
    return (
      <div className="relative w-full h-full">
        <img
          src={frameSrc(0)}
          alt="Restaurant ambiance"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 bg-black/40">
          <div>
            <span style={eyStyle}><BrandName /></span>
            <h1 style={{ ...headStyle, fontSize: "clamp(34px, 5vw, 68px)" }}>
              Discover your next <em style={{ fontStyle: "italic" }}>dining experience</em>
            </h1>
            <p style={{ ...bodyStyle, margin: "16px auto 0" }}>
              Every great meal begins with finding the right place.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared Typography Styles (analyzed from reference image) ──────────────
  const eyStyle = {
    display:       "block",
    fontFamily:    "'Public Sans', system-ui, -apple-system, sans-serif",
    fontSize:      "clamp(10px, 1.05vw, 12px)",
    fontWeight:    600,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color:         "#e8ca98", // Luminous warm champagne-gold with clear accessible contrast
    marginBottom:  "clamp(10px, 1.5vh, 18px)",
    textShadow:    "0 1px 8px rgba(0,0,0,0.75)",
  };

  const headStyle = {
    fontFamily:    "'Newsreader', 'Cormorant Garamond', 'Libre Baskerville', Georgia, serif",
    fontWeight:    500,
    lineHeight:    1.08,
    margin:        0,
    color:         "#ffffff",
    letterSpacing: "-0.015em",
    textShadow:    "0 2px 28px rgba(0,0,0,0.65)",
  };

  const bodyStyle = {
    fontFamily:    "'Public Sans', system-ui, -apple-system, sans-serif",
    fontWeight:    300,
    fontSize:      "clamp(13px, 1.25vw, 15px)",
    lineHeight:    1.68,
    color:         "rgba(255,255,255,0.76)",
    marginTop:     "clamp(12px, 1.8vh, 22px)",
    letterSpacing: "0.01em",
    textShadow:    "0 1px 12px rgba(0,0,0,0.55)",
    maxWidth:      "40ch",
  };

  const lgHead = "clamp(36px, 5.2vw, 72px)";
  const smHead = "clamp(28px, 4.2vw, 54px)";

  return ( <>
    <div className="relative w-full h-full overflow-hidden">
      {/* ── 1. CINEMATIC CANVAS ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display:    "block",
          width:      "100%",
          height:     "100%",
          background: "#0a0806",
        }}
      />

      {/* ── 2. SUBTLE BOTTOM VIGNETTE OVERLAY (Readability without crushing image) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.15) 35%, transparent 65%)",
          zIndex: 5,
        }}
      />

      {/* ── 3. FOUR SCROLL-DRIVEN STORYTELLING TEXT STATES ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* ── STATE 1: CENTER / INTRODUCTION (0.00 – 0.25) ── */}
        <div
          style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            pointerEvents:  "none",
          }}
        >
          <div
            ref={s1Ref}
            style={{
              textAlign:    "center",
              width:        "min(88vw, 680px)",
              marginBottom: "5vh",
            }}
          >
            <span ref={s1BadgeRef} style={eyStyle}><BrandName /></span>
            <h1 ref={s1HeadRef} style={{ ...headStyle, fontSize: lgHead }}>
              Discover your next<br />
              <em style={{ fontStyle: "italic" }}>dining experience</em>
            </h1>
            <p
              ref={s1DescRef}
              style={{
                ...bodyStyle,
                maxWidth: "42ch",
                margin:   "clamp(14px, 2vh, 22px) auto 0",
              }}
            >
              Every great meal begins with finding the right place.
              Explore the city's finest tables — curated, available, right now.
            </p>
          </div>
        </div>

        {/* ── STATE 2: LOWER-LEFT / DISCOVER (0.27 – 0.44) ── */}
        <div
          ref={s2Ref}
          style={{
            position: "absolute",
            bottom:   "clamp(36px, 7vh, 76px)",
            left:     "clamp(24px, 5.5vw, 80px)",
            width:    "min(88vw, 440px)",
            textAlign: "left",
          }}
        >
          <span style={eyStyle}>01 &nbsp;—&nbsp; Discover</span>
          <h2 style={{ ...headStyle, fontSize: smHead }}>
            Find a place<br />
            <em style={{ fontStyle: "italic" }}>worth discovering</em>
          </h2>
          <p style={bodyStyle}>
            From neighbourhood bistros to celebrated chef's tables —
            explore restaurants by cuisine, occasion, or neighbourhood.
          </p>
        </div>

        {/* ── STATE 3: LOWER-LEFT / CHOOSE (0.53 – 0.70) ── */}
        <div
          ref={s3Ref}
          style={{
            position: "absolute",
            bottom:   "clamp(36px, 7vh, 76px)",
            left:     "clamp(24px, 5.5vw, 80px)",
            width:    "min(88vw, 440px)",
            textAlign: "left",
          }}
        >
          <span style={eyStyle}>02 &nbsp;—&nbsp; Choose</span>
          <h2 style={{ ...headStyle, fontSize: smHead }}>
            Find the table<br />
            <em style={{ fontStyle: "italic" }}>that feels right</em>
          </h2>
          <p style={bodyStyle}>
            Real-time availability across every setting.
            Choose the atmosphere and the seat that matches the moment.
          </p>
        </div>

        {/* ── STATE 4: LOWER-RIGHT / BOOK & CTA (0.79 – 1.00) ── */}
        <div
          ref={s4Ref}
          style={{
            position:      "absolute",
            bottom:        "clamp(36px, 7vh, 76px)",
            right:         "clamp(24px, 5.5vw, 80px)",
            width:         "min(88vw, 390px)",
            textAlign:     "left",
            pointerEvents: "auto",
          }}
        >
          <span style={eyStyle}>03 &nbsp;—&nbsp; Book</span>
          <h2 style={{ ...headStyle, fontSize: smHead }}>
            Your table<br />
            <em style={{ fontStyle: "italic" }}>is waiting</em>
          </h2>
          <p style={bodyStyle}>
            Instant confirmation. Zero calls. Zero waiting.
            Reserve your table in seconds.
          </p>
        </div>

        {/* ── FINAL MOMENT: CONTINUOUS LOOPING RESTAURANT STREAM (0.83 – 1.00) ── */}
        <div
          ref={cardsContainerRef}
          className="absolute inset-x-0 bottom-2 sm:bottom-4 md:bottom-6 z-20 flex flex-col items-center justify-end pointer-events-auto overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 px-4">
            <span style={eyStyle}>
              <BrandName />
              <span style={{ color: "#e8ca98" }}>&nbsp;·&nbsp;Featured Discoveries</span>
            </span>
            <h3
              style={{
                ...headStyle,
                fontSize: "clamp(20px, 2.3vw, 32px)",
                textAlign: "center",
              }}
            >
              Explore tonight's <em style={{ fontStyle: "italic" }}>curated tables</em>
            </h3>
          </div>

          {/* Continuous Right-to-Left Stream */}
          <div className="w-full">
            <HeroRestaurantStream
              restaurants={allRestaurants}
              isActive={isStreamActive}
              onDemoClick={(name) => setDemoModal({ isOpen: true, restaurantName: name })}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Demo Restaurant Modal */}
    <DemoRestaurantModal
      isOpen={demoModal.isOpen}
      onClose={() => setDemoModal({ isOpen: false, restaurantName: "" })}
      restaurantName={demoModal.restaurantName}
    />
    </> );
}
