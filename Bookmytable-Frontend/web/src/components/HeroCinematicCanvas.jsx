import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { restaurants as fallbackRestaurants } from "@/lib/data.js";

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
const POOL_SIZE = 7;
const CARD_WIDTH = 210;
const CARD_GAP = 20;
const PITCH = CARD_WIDTH + CARD_GAP; // 230px
const STREAM_SPEED = 60; // px/sec

function HeroRestaurantStream({ restaurants, isActive }) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const dataPtrRef = useRef(POOL_SIZE);

  const poolRef = useRef(
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      x: i * PITCH,
      rIndex: i % Math.max(1, restaurants.length),
    }))
  );

  useEffect(() => {
    let animId = null;
    let lastTime = performance.now();

    function loop(time) {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isActive || isHoveredRef.current) return;

      const container = containerRef.current;
      const W = container ? container.clientWidth : window.innerWidth;
      const pool = poolRef.current;
      const cards = cardsRef.current;

      for (let i = 0; i < POOL_SIZE; i++) {
        const item = pool[i];
        const elem = cards[i];
        if (!elem) continue;

        item.x -= STREAM_SPEED * dt;

        // When a card moves beyond left boundary, recycle to right
        if (item.x < -PITCH - 40) {
          let maxX = -Infinity;
          for (let j = 0; j < POOL_SIZE; j++) {
            if (j !== i && pool[j].x > maxX) {
              maxX = pool[j].x;
            }
          }
          item.x = maxX + PITCH;
          item.rIndex = dataPtrRef.current % Math.max(1, restaurants.length);
          dataPtrRef.current++;

          // Update card DOM in place
          const r = restaurants[item.rIndex];
          if (r) {
            const img = elem.querySelector(".stream-card-img");
            if (img && (r.coverImage || r.image)) img.src = r.coverImage || r.image;
            const title = elem.querySelector(".stream-card-title");
            if (title) title.textContent = r.name || "Curated Dining";
            const meta = elem.querySelector(".stream-card-meta");
            if (meta) meta.textContent = `${r.city || "Mumbai"} · ${r.cuisine || "Fine Dining"}`;
            const rating = elem.querySelector(".stream-card-rating");
            if (rating) rating.textContent = r.averageRating?.toFixed(1) || r.rating || "4.8";
            const price = elem.querySelector(".stream-card-price");
            if (price) price.textContent = r.priceRange || "$$$";
            const link = elem.querySelector(".stream-card-link");
            if (link) link.href = `/restaurant/${r.slug || r.restaurantId || r.id}`;
          }
        }

        // Full opacity throughout horizontal journey — zero right/left edge fading
        elem.style.transform = `translate3d(${item.x}px, 0px, 0)`;
        elem.style.opacity = "1";
      }
    }

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isActive, restaurants]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[155px] overflow-hidden select-none pointer-events-auto"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      {poolRef.current.map((item, i) => {
        const r = restaurants[item.rIndex] || restaurants[0] || {};
        return (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${CARD_WIDTH}px`,
              willChange: "transform, opacity",
            }}
          >
            <a
              href={`/restaurant/${r.slug || r.restaurantId || r.id}`}
              className="stream-card-link block group rounded-xl overflow-hidden bg-white backdrop-blur-md border border-[#c8a46e]/30 hover:border-[#c8a46e] shadow-lg hover:shadow-[0_8px_25px_rgba(200,164,110,0.3)] transition-all duration-300"
            >
              <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-neutral-200">
                <img
                  src={r.coverImage || r.image}
                  alt={r.name}
                  className="stream-card-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="stream-card-price absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm text-[10px] font-medium text-[#c8a46e]">
                  {r.priceRange || "$$$"}
                </div>
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm text-[10px] font-medium text-neutral-800 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#c8a46e] text-[#c8a46e]" />
                  <span className="stream-card-rating">{r.averageRating?.toFixed(1) || r.rating || "4.8"}</span>
                </div>
              </div>
              <div className="p-2.5 text-left">
                <h4 className="stream-card-title text-xs font-semibold text-neutral-900 truncate group-hover:text-[#c8a46e] transition-colors">
                  {r.name}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500 truncate mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-[#c8a46e]" />
                  <span className="stream-card-meta truncate">{r.city || "Mumbai"} · {r.cuisine || "Fine Dining"}</span>
                </div>
              </div>
            </a>
          </div>
        );
      })}
    </div>
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
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);
  const cardsContainerRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const allRestaurants = (propRestaurants && propRestaurants.length > 0)
    ? [...propRestaurants, ...fallbackRestaurants]
    : fallbackRestaurants;

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

    // ── RAF lerp loop ─────────────────────────────────────────────────────────
    function startRaf() {
      function loop() {
        s.rafId = requestAnimationFrame(loop);
        const diff = s.targetFrame - s.currentFrame;
        s.currentFrame = Math.abs(diff) < SNAP_THRESHOLD
          ? s.targetFrame
          : s.currentFrame + diff * LERP_FACTOR;
        const rounded = Math.round(s.currentFrame);
        if (rounded !== s.lastPainted) paintFrame(rounded);
      }
      loop();
    }

    // ── Image preloader ───────────────────────────────────────────────────────
    let loadAborted = false;

    function loadOne(i) {
      if (loadState[i] !== 0) return Promise.resolve();
      loadState[i] = 1;
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          const finish = () => {
            if (!loadAborted) { imgCache[i] = img; loadState[i] = 2; }
            resolve();
          };
          typeof img.decode === "function"
            ? img.decode().then(finish).catch(finish)
            : finish();
        };
        img.onerror = () => { loadState[i] = 0; resolve(); };
        img.src = frameSrc(i);
        imgCache[i] = img;
      });
    }

    async function preload() {
      // Phase 1: first 5 frames sequential for instantaneous first paint
      for (let i = 0; i < Math.min(5, FRAME_COUNT) && !loadAborted; i++) {
        await loadOne(i);
        if (i === 0) paintFrame(0);
      }
      // Phase 2: next 25 in parallel
      if (!loadAborted) {
        await Promise.all(Array.from({ length: 25 }, (_, k) => loadOne(5 + k)));
      }
      // Phase 3: remainder in batches of 30
      for (let b = 30; b < FRAME_COUNT && !loadAborted; b += 30) {
        await Promise.all(
          Array.from({ length: Math.min(30, FRAME_COUNT - b) }, (_, k) => loadOne(b + k))
        );
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
    startRaf();
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
        cancelAnimationFrame(s.rafId);
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    // ── Initial setup of text states ─────────────────────────────────────────
    // State 1 starts fully visible by default
    if (s1Ref.current) gsap.set(s1Ref.current, { autoAlpha: 1, y: 0 });
    // States 2, 3, 4 start hidden below
    if (s2Ref.current) gsap.set(s2Ref.current, { autoAlpha: 0, y: 26 });
    if (s3Ref.current) gsap.set(s3Ref.current, { autoAlpha: 0, y: 26 });
    if (s4Ref.current) gsap.set(s4Ref.current, { autoAlpha: 0, y: 26 });
    if (cardsContainerRef.current) gsap.set(cardsContainerRef.current, { autoAlpha: 0, y: 25 });

    let hasRevealedCards = false;

    // ── SINGLE MASTER GSAP TIMELINE + SCROLLTRIGGER ──────────────────────────
    // Controls both the camera frame progress and the 4 text states seamlessly.
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
          // Camera frames advance during 0.00 – 0.58, then clamp to final frame for cards & transition
          const cinematicProgress = Math.max(0, Math.min(1, self.progress / 0.58));
          s.targetFrame = Math.round(cinematicProgress * (FRAME_COUNT - 1));
          // Nav stays dark until nav actually leaves HeroCinematicCanvas
          const isComplete = self.progress >= 1.0;

          // ── One-Time Card Reveal (Unscrubbed) ──────────────────────────────────
          // When scroll reaches trigger point (0.58), play a smooth reveal tween ONCE.
          // Cards reach opacity: 1 and stay there permanently — not continuously scrubbed by scroll.
          if (self.progress >= 0.58) {
            setIsStreamActive(true);
            if (!hasRevealedCards) {
              hasRevealedCards = true;
              if (cardsContainerRef.current) {
                gsap.to(cardsContainerRef.current, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              }
            }
          }

          window.dispatchEvent(
            new CustomEvent("cinematic-scroll-progress", {
              detail: { isComplete, progress: self.progress },
            })
          );
        },
        onLeave() {
          setIsStreamActive(false);
          window.dispatchEvent(
            new CustomEvent("cinematic-scroll-progress", {
              detail: { isComplete: true, progress: 1.0 },
            })
          );
        },
        onEnterBack() {
          setIsStreamActive(true);
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
    // 0.00 – 0.12: holds fully visible
    // 0.12 – 0.17: fades & moves up gracefully
    if (s1Ref.current) {
      master.to(
        s1Ref.current,
        { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.05 },
        0.12
      );
    }

    // ── STATE 2: LOWER-LEFT / DISCOVER ───────────────────────────────────────
    // 0.18 – 0.23: enters from bottom
    // 0.23 – 0.29: holds visible
    // 0.29 – 0.34: exits upward
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
    // 0.35 – 0.40: enters from bottom
    // 0.40 – 0.46: holds visible
    // 0.46 – 0.51: exits upward
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
    // 0.51 – 0.55: enters from bottom
    // 0.55 – 0.57: holds visible
    // 0.57 – 0.60: exits upward as restaurant card stream emerges
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

    return () => {
      loadAborted = true;
      if (cardsContainerRef.current) gsap.killTweensOf(cardsContainerRef.current);
      master.scrollTrigger?.kill();
      master.kill();
      cancelAnimationFrame(s.rafId);
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
            <span style={eyStyle}>BookMyTable</span>
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
    fontWeight:    500,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color:         "#c8a46e", // Warm brass/gold from reference image
    marginBottom:  "clamp(10px, 1.5vh, 18px)",
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

  return (
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
            <span style={eyStyle}>BookMyTable</span>
            <h1 style={{ ...headStyle, fontSize: lgHead }}>
              Discover your next<br />
              <em style={{ fontStyle: "italic" }}>dining experience</em>
            </h1>
            <p
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
          <div className="text-center mb-8 px-4">
            <span style={eyStyle}>BookMyTable &nbsp;·&nbsp; Featured Discoveries</span>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
