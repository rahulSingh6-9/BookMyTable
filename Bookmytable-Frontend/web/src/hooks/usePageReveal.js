import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fail-safe GSAP scroll-reveal hook for public-facing pages.
 *
 * Solves the timing conflict with BarbaPageTransition which globally kills
 * all ScrollTrigger instances during route transitions. This hook:
 *
 * 1. Uses `useEffect` (not `useLayoutEffect`) — runs after DOM commit + paint.
 * 2. Defers GSAP initialisation by one rAF + 150ms so BarbaPageTransition's
 *    cleanup (`ScrollTrigger.getAll().forEach(t => t.kill())`) and its
 *    `onComplete` (`ScrollTrigger.refresh()`) have both completed.
 * 3. Adds a 2 s safety-timeout per element: if ScrollTrigger never fires
 *    (e.g. it was killed), the element is force-revealed with a fast tween.
 * 4. Marks revealed elements with `data-page-revealed` to prevent
 *    double-animation on re-renders.
 * 5. Scoped GSAP context + cleanup prevents stale references and duplicates.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - ref to the page wrapper
 * @param {any[]} deps - extra dependencies (e.g. [restaurant, checkoutStep])
 * @param {string} [attrName="data-reveal"] - the attribute selector to find targets
 */
export function usePageReveal(containerRef, deps = [], attrName = "data-reveal") {
  const ctxRef = useRef(null);
  const safetyTimersRef = useRef([]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    // Clean up previous run
    safetyTimersRef.current.forEach(clearTimeout);
    safetyTimersRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Defer initialisation so BarbaPageTransition's global cleanup is done
    const rafId = requestAnimationFrame(() => {
      const timerId = setTimeout(() => {
        if (!container || !container.isConnected) return;

        const ctx = gsap.context(() => {
          const delayAttr =
            attrName === "data-reveal-step" ? "data-reveal-step" : "data-reveal-delay";

          const els = container.querySelectorAll(`[${attrName}]`);
          if (!els.length) return;

          els.forEach((el) => {
            // Skip already-revealed elements
            if (el.getAttribute("data-page-revealed") === "true") return;

            const delay = parseFloat(el.getAttribute(delayAttr) || "0");

            if (prefersReduced) {
              // Immediately visible, no animation
              gsap.set(el, { clearProps: "all" });
              el.setAttribute("data-page-revealed", "true");
              return;
            }

            // Safety timeout: force-reveal after 2s if ScrollTrigger never fires
            const safetyTimer = setTimeout(() => {
              if (el && el.getAttribute("data-page-revealed") !== "true") {
                gsap.to(el, {
                  opacity: 1,
                  y: 0,
                  duration: 0.3,
                  clearProps: "all",
                  overwrite: "auto",
                  onComplete: () => {
                    el.setAttribute("data-page-revealed", "true");
                  },
                });
              }
            }, 2000);
            safetyTimersRef.current.push(safetyTimer);

            // Animate with ScrollTrigger
            gsap.fromTo(
              el,
              { opacity: 0, y: 65 },
              {
                opacity: 1,
                y: 0,
                duration: 1.0,
                ease: "power3.out",
                delay,
                clearProps: "all",
                overwrite: "auto",
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  once: true,
                },
                onComplete: () => {
                  el.setAttribute("data-page-revealed", "true");
                },
              }
            );
          });
        }, container);

        ctxRef.current = ctx;
      }, 150); // 150ms delay after rAF — enough for Barba's transition + 50ms refresh

      // Store timerId for cleanup
      safetyTimersRef.current.push(timerId);
    });

    return () => {
      cancelAnimationFrame(rafId);
      safetyTimersRef.current.forEach(clearTimeout);
      safetyTimersRef.current = [];
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
