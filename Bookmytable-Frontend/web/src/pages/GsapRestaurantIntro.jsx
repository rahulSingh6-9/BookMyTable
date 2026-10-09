import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame sequence configuration ─────────────────────────────────────────────
const FRAME_COUNT  = 199;
const FRAME_BASE   = "/frames/";
const FRAME_PREFIX = "0922(1)_";
const FRAME_EXT    = ".jpg";

// Cap DPR at 2 – beyond that the extra resolution costs GPU with no visible gain
const MAX_DPR = 2;

// Lerp factor: how quickly currentFrame chases targetFrame (per RAF tick at 60 fps).
// 0.10 = silky inertia; 0.18 = responsive but smooth; 0.25 = snappy.
// Keep at 0.12 – feels like a high-end steadicam that tracks the user closely.
const LERP_FACTOR = 0.12;

// Snap to integer when we're within this sub-frame distance (avoids oscillation).
const SNAP_THRESHOLD = 0.08;

function frameSrc(index) {
  return `${FRAME_BASE}${FRAME_PREFIX}${String(index).padStart(3, "0")}${FRAME_EXT}`;
}

// ─── Module-level image cache ─────────────────────────────────────────────────
// Kept outside the component so the cache survives hot-reload in development.
const imgCache  = new Array(FRAME_COUNT).fill(null);  // Image objects
const loadState = new Array(FRAME_COUNT).fill(0);     // 0=idle, 1=loading, 2=ready

export default function GsapRestaurantIntro() {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);

  // Animation state kept entirely in a ref – zero React re-renders during scroll
  const s = useRef({
    ctx:           null,
    dpr:           1,
    // Sub-frame float position of what is currently drawn on screen
    currentFrame:  0.0,
    // Integer target set directly by ScrollTrigger.onUpdate
    targetFrame:   0,
    // The integer we last painted; avoids redundant drawImage calls
    lastPainted:   -1,
    rafId:         null,
    scrollProgress: 0,   // raw 0–1 from ScrollTrigger
  }).current; // .current once so `s` is the plain object, stable across renders

  /* ── reduced-motion guard ── */
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── Canvas resize ─────────────────────────────────────────────────────────
  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;

    // Only re-allocate the canvas buffer if dimensions actually changed
    const newW = Math.round(vw * dpr);
    const newH = Math.round(vh * dpr);
    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width  = newW;
      canvas.height = newH;
    }
    canvas.style.width  = `${vw}px`;
    canvas.style.height = `${vh}px`;

    // Always re-apply context settings after resize (resize resets them)
    s.dpr = dpr;
    s.ctx = canvas.getContext("2d", { alpha: false });
    s.ctx.imageSmoothingEnabled  = true;
    s.ctx.imageSmoothingQuality  = "high";

    // Re-paint the current frame at the new size immediately
    paintFrame(Math.round(s.currentFrame));
  }

  // ─── Object-fit cover draw ─────────────────────────────────────────────────
  function paintFrame(index) {
    const ctx = s.ctx;
    if (!ctx) return;

    // Clamp to valid range
    const idx = Math.max(0, Math.min(FRAME_COUNT - 1, index));

    let img = imgCache[idx];
    if (!img || loadState[idx] !== 2) {
      // Fall back to the nearest frame that IS ready
      let lo = idx - 1, hi = idx + 1;
      while (lo >= 0 || hi < FRAME_COUNT) {
        if (lo >= 0 && loadState[lo] === 2) { img = imgCache[lo]; break; }
        if (hi < FRAME_COUNT && loadState[hi] === 2) { img = imgCache[hi]; break; }
        lo--;
        hi++;
      }
      if (!img) return; // nothing at all loaded yet
    }

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // object-fit: cover – crop the image centre
    const imgAR = img.naturalWidth / img.naturalHeight;
    const canAR = cw / ch;
    let sx, sy, sw, sh;
    if (canAR > imgAR) {
      sw = img.naturalWidth;
      sh = sw / canAR;
      sx = 0;
      sy = (img.naturalHeight - sh) * 0.5;
    } else {
      sh = img.naturalHeight;
      sw = sh * canAR;
      sy = 0;
      sx = (img.naturalWidth - sw) * 0.5;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    s.lastPainted = idx;
  }

  // ─── RAF loop – lerps currentFrame → targetFrame ───────────────────────────
  function startRaf() {
    function loop() {
      s.rafId = requestAnimationFrame(loop);

      const target  = s.targetFrame;   // integer set by ScrollTrigger
      const current = s.currentFrame;  // float tracked here
      const diff    = target - current;

      let next;
      if (Math.abs(diff) < SNAP_THRESHOLD) {
        // Already at target – snap and stop wasting CPU on tiny deltas
        next = target;
      } else {
        // Exponential ease: approaches target asymptotically
        next = current + diff * LERP_FACTOR;
      }

      s.currentFrame = next;

      const rounded = Math.round(next);
      if (rounded !== s.lastPainted) {
        paintFrame(rounded);
      }
    }
    loop();
  }

  // ─── Load a single frame ───────────────────────────────────────────────────
  function loadFrame(i) {
    if (loadState[i] !== 0) return Promise.resolve(); // already loading or done
    loadState[i] = 1; // loading

    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";

      img.onload = () => {
        // Use img.decode() if available so the browser fully decodes before we
        // need to drawImage – eliminates the brief stutter from lazy GPU upload.
        const finish = () => {
          imgCache[i]   = img;
          loadState[i]  = 2; // ready
          resolve();
        };
        if (typeof img.decode === "function") {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };
      img.onerror = () => {
        loadState[i] = 0; // allow retry
        resolve();
      };
      img.src = frameSrc(i);
      imgCache[i] = img;
    });
  }

  // ─── Progressive preload ───────────────────────────────────────────────────
  // Strategy:
  //  Phase 1 – frames 0-4 sequentially (so frame 0 paints immediately)
  //  Phase 2 – frames 5-29 in a small batch (cover the opening act fast)
  //  Phase 3 – all remaining frames in parallel batches of 20
  function preloadFrames() {
    async function run() {
      // Phase 1: absolutely first few frames, sequential so we can paint ASAP
      for (let i = 0; i < Math.min(5, FRAME_COUNT); i++) {
        await loadFrame(i);
        if (i === 0) {
          s.currentFrame = 0;
          s.targetFrame  = 0;
          paintFrame(0);
        }
      }

      // Phase 2: next 25 frames in a batch so opening scroll is fluid
      await Promise.all(
        Array.from({ length: Math.min(25, FRAME_COUNT - 5) }, (_, k) => loadFrame(5 + k))
      );

      // Phase 3: the rest in parallel batches of 20
      const BATCH = 20;
      for (let b = 30; b < FRAME_COUNT; b += BATCH) {
        await Promise.all(
          Array.from(
            { length: Math.min(BATCH, FRAME_COUNT - b) },
            (_, k) => loadFrame(b + k)
          )
        );
      }
    }
    run();
  }

  // ─── Main effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) {
      loadFrame(0).then(() => {
        resizeCanvas();
        paintFrame(0);
      });
      return;
    }

    resizeCanvas();
    startRaf();
    preloadFrames();

    // Debounced resize – don't thrash canvas buffer on every pixel of resize
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 80);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // GSAP ScrollTrigger
    // scrub: false – we handle ALL smoothing ourselves in the RAF lerp.
    // This means scroll → targetFrame is instantaneous (no GSAP lag layer),
    // and the RAF lerp provides the single, tunable inertia layer.
    const trigger = ScrollTrigger.create({
      trigger:           containerRef.current,
      start:             "top top",
      end:               "+=400%",          // 400 vh scroll track
      pin:               canvasRef.current,
      scrub:             true,              // true = 0-lag scrub (raw progress)
      anticipatePin:     1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        // Store raw float progress; derive target frame as a float, then round.
        // Keeping it as a float here gives the lerp more resolution to work with.
        s.scrollProgress = self.progress;
        s.targetFrame = Math.round(self.progress * (FRAME_COUNT - 1));
      },
    });

    return () => {
      trigger.kill();
      cancelAnimationFrame(s.rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reduced-motion fallback ───────────────────────────────────────────────
  if (prefersReduced) {
    return (
      <div className="w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <img
          src={frameSrc(0)}
          alt="BookMyTable – The Table, Mumbai"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ height: "500vh", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        aria-label="BookMyTable cinematic restaurant journey – Mumbai city to The Table interior"
        style={{
          display:        "block",
          position:       "sticky",
          top:            0,
          left:           0,
          width:          "100vw",
          height:         "100vh",
          background:     "#000",
          imageRendering: "auto",
          zIndex:         0,
        }}
      />
    </div>
  );
}
