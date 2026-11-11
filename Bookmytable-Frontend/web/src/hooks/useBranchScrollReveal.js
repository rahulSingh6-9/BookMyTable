import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Checks if an element or any of its ancestors should be excluded from scroll reveal.
 * Excludes modals, dialogs, popovers, dropdowns, tooltips, toasts, loading spinners,
 * interactive floor designer canvases, and sticky/fixed headers.
 */
function isExcluded(el) {
  if (!el || !(el instanceof HTMLElement)) return true;

  // Exclude hidden elements (display: none or 0 dimensions with no client rects)
  if (el.offsetWidth === 0 && el.offsetHeight === 0 && !el.getClientRects().length) {
    return true;
  }

  // Exclude interactive floor designer canvases or Konva stages
  if (
    el.tagName === "CANVAS" ||
    el.classList.contains("konvajs-content") ||
    el.closest(".konvajs-content") ||
    el.closest("canvas") ||
    el.closest("[data-floor-designer]") ||
    el.closest(".floor-designer")
  ) {
    return true;
  }

  // Exclude overlays, portals, dialogs, popovers, and toasts
  if (
    el.closest('[role="dialog"]') ||
    el.closest('[role="alertdialog"]') ||
    el.closest('[role="popover"]') ||
    el.closest('[role="tooltip"]') ||
    el.closest("[data-radix-popper-content-wrapper]") ||
    el.closest("[data-radix-portal]") ||
    el.closest(".sonner-toast") ||
    el.closest("[data-sonner-toaster]") ||
    el.closest(".toaster")
  ) {
    return true;
  }

  // Exclude standalone loading spinners or elements marked loading
  if (
    el.classList.contains("animate-spin") ||
    (el.querySelector(".animate-spin") && el.children.length === 1) ||
    el.getAttribute("data-loading") === "true"
  ) {
    return true;
  }

  // Exclude explicit opt-out or custom-managed reveal sections
  if (
    el.getAttribute("data-no-reveal") === "true" ||
    el.getAttribute("data-custom-reveal") === "true" ||
    el.closest('[data-custom-reveal="true"]') ||
    el.closest('[data-no-reveal="true"]')
  ) {
    return true;
  }

  // Exclude fixed/sticky navigation headers and action bars
  if (
    el.tagName === "HEADER" ||
    el.classList.contains("sticky") ||
    el.classList.contains("fixed") ||
    el.closest("header")
  ) {
    return true;
  }

  return false;
}

/**
 * Detects whether the active scrolling container is the `<main>` element or the browser window.
 */
function getActiveScroller(container) {
  if (!container || typeof window === "undefined") return window;

  const isMainScrollable =
    container.scrollHeight > container.clientHeight &&
    (container.clientHeight < document.documentElement.clientHeight ||
      container.clientHeight < window.innerHeight);

  const style = window.getComputedStyle(container);
  if (isMainScrollable && (style.overflowY === "auto" || style.overflowY === "scroll" || style.overflow === "auto" || style.overflow === "scroll")) {
    return container;
  }

  return window;
}

/**
 * Collects candidate reveal elements inside a root container without double-animating nested elements.
 */
function collectCandidatesFrom(root, candidates, visited) {
  if (!root || !root.children) return;

  const directChildren = Array.from(root.children);

  // If root only has 1 or 2 wrapper children (e.g. motion.div, div.container, div.w-full), delve into it:
  if (
    directChildren.length === 1 &&
    (root.classList.contains("container") ||
      root.classList.contains("w-full") ||
      root.tagName === "DIV")
  ) {
    collectCandidatesFrom(directChildren[0], candidates, visited);
    return;
  }

  directChildren.forEach((child) => {
    if (isExcluded(child) || visited.has(child)) return;

    // Check if child is a wrapper div holding major sections (e.g. space-y-6, space-y-8, space-y-4)
    if (
      (child.classList.contains("space-y-6") ||
        child.classList.contains("space-y-8") ||
        child.classList.contains("space-y-4")) &&
      !child.classList.contains("border") &&
      !child.classList.contains("card")
    ) {
      collectCandidatesFrom(child, candidates, visited);
      return;
    }

    // Case 1: Grid container (KPI stats, metric cards, table cards, menu cards, etc.)
    const grid = child.classList.contains("grid")
      ? child
      : child.querySelector(":scope > .grid") || child.querySelector(".grid");

    if (grid && grid.children.length > 0) {
      // If there is a section header preceding the grid inside child, add it first
      const heading = child.querySelector("h1, h2, h3, h4");
      if (heading && heading.parentElement !== grid && !visited.has(heading.parentElement)) {
        candidates.push(heading.parentElement);
        visited.add(heading.parentElement);
      }

      Array.from(grid.children).forEach((gridItem) => {
        if (!isExcluded(gridItem) && !visited.has(gridItem)) {
          candidates.push(gridItem);
          visited.add(gridItem);
        }
      });
      return;
    }

    // Case 2: Tabs container (TabsList + active TabsContent items)
    if (child.querySelector('[role="tablist"]')) {
      const tabList = child.querySelector('[role="tablist"]');
      if (tabList && !isExcluded(tabList) && !visited.has(tabList)) {
        candidates.push(tabList);
        visited.add(tabList);
      }

      const activePanel =
        child.querySelector('[role="tabpanel"][data-state="active"]') ||
        child.querySelector('[role="tabpanel"]:not([hidden])') ||
        child.querySelector('[role="tabpanel"]') ||
        child.querySelector(".tabs-content");

      if (activePanel) {
        collectCandidatesFrom(activePanel, candidates, visited);
      }
      return;
    }

    // Case 3: Table container
    const table = child.querySelector("table") || (child.tagName === "TABLE" ? child : null);
    if (table) {
      candidates.push(child);
      visited.add(child);
      return;
    }

    // Case 4: Standard cohesive block (Header, Standalone Card, Section, Form, EmptyState)
    candidates.push(child);
    visited.add(child);
  });
}

/**
 * Discovers the logical reveal units inside the branch panel.
 * Groups content into cohesive blocks while strictly preventing nested double-animations.
 */
function findRevealTargets(container) {
  if (!container) return [];

  const candidates = [];
  const visited = new Set();

  // Explicitly marked reveal targets
  const explicit = container.querySelectorAll("[data-reveal]:not([data-gsap-init])");
  explicit.forEach((el) => {
    if (!isExcluded(el)) {
      candidates.push(el);
      visited.add(el);
    }
  });

  // Find page roots inside the container
  const pageRoots = container.querySelectorAll(
    ".p-4, .p-6, .p-8, .space-y-6, .space-y-8, .container, [data-branch-page]"
  );

  const roots = pageRoots.length > 0 ? Array.from(pageRoots) : [container];

  roots.forEach((root) => {
    collectCandidatesFrom(root, candidates, visited);
  });

  // Filter out any element that is an ancestor or descendant of another selected element
  const finalTargets = candidates.filter((el) => {
    if (el.getAttribute("data-gsap-init") === "true") return false;
    for (const other of candidates) {
      if (other !== el && other.contains(el)) {
        return false;
      }
    }
    return true;
  });

  return finalTargets;
}

/**
 * Custom hook implementing global, fail-safe GSAP Scroll-Reveal animation across
 * all Branch & Brand Dashboard views.
 *
 * Guarantees:
 * - Content is NEVER permanently hidden (automatic 2.5s fallback failsafe on all targets).
 * - Client-side sidebar navigation works smoothly without blank screens or reload requirements.
 * - Card grids reveal row-by-row with subtle staggers.
 * - Viewport-based sequential reveal for initially visible elements.
 * - Below-the-fold elements wait for ScrollTrigger threshold (top 88%).
 * - Dynamic and asynchronous content (APIs, query caches, tabs) detected automatically.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the `<main>` scroll/content area
 */
export function useBranchScrollReveal(containerRef) {
  const location = useLocation();
  const ctxRef = useRef(null);
  const observerRef = useRef(null);
  const safetyTimersRef = useRef([]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    // 1. Instantly reset scroll to top on route change
    container.scrollTop = 0;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // 2. Clear any active safety timers from previous route
    safetyTimersRef.current.forEach(clearTimeout);
    safetyTimersRef.current = [];

    // 3. Clean up previous GSAP context and active ScrollTriggers
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }

    // 4. Clean up previous MutationObserver
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // 5. Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 6. Create dedicated GSAP context for the active route
    const ctx = gsap.context(() => {
      const scroller = getActiveScroller(container);

      const processNewTargets = () => {
        try {
          const targets = findRevealTargets(container);
          if (!targets || targets.length === 0) return;

          // If reduced motion is requested, immediately clear any styles and mark visible
          if (prefersReducedMotion) {
            targets.forEach((el) => {
              el.setAttribute("data-gsap-init", "true");
              el.setAttribute("data-gsap-revealed", "true");
              gsap.set(el, { clearProps: "all" });
            });
            return;
          }

          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const triggerThreshold = viewportHeight * 0.88;

          // Group targets into visual rows based on bounding top offset
          const rows = [];
          targets.forEach((el) => {
            el.setAttribute("data-gsap-init", "true");
            const rect = el.getBoundingClientRect();

            // FAIL-SAFE: Every element gets a safety timeout.
            // If ScrollTrigger or GSAP fails to complete, clearProps is guaranteed within 2.5s!
            const timer = setTimeout(() => {
              if (el && el.getAttribute("data-gsap-revealed") !== "true") {
                gsap.to(el, {
                  opacity: 1,
                  y: 0,
                  duration: 0.3,
                  clearProps: "all",
                  overwrite: "auto",
                  onComplete: () => {
                    el.setAttribute("data-gsap-revealed", "true");
                  },
                });
              }
            }, 2500);
            safetyTimersRef.current.push(timer);

            const existingRow = rows.find((r) => Math.abs(r.top - rect.top) < 28);
            if (existingRow) {
              existingRow.items.push({ el, rect });
            } else {
              rows.push({ top: rect.top, items: [{ el, rect }] });
            }
          });

          // Sort rows vertically
          rows.sort((a, b) => a.top - b.top);

          // Process each row
          rows.forEach((row, rowIndex) => {
            // Sort items inside this row horizontally (left to right)
            row.items.sort((a, b) => a.rect.left - b.rect.left);
            const rowElements = row.items.map((i) => i.el);

            const isRowVisible = row.top < triggerThreshold && (row.top + 60) > 0;

            if (isRowVisible) {
              // 1. Initial visible row: reveal with sequential stagger
              const initialDelay = 0.12 + rowIndex * 0.14;
              gsap.fromTo(
                rowElements,
                { opacity: 0, y: 65 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1.0,
                  ease: "power3.out",
                  stagger: 0.12,
                  delay: initialDelay,
                  clearProps: "all",
                  overwrite: "auto",
                  onComplete: () => {
                    rowElements.forEach((el) =>
                      el.setAttribute("data-gsap-revealed", "true")
                    );
                  },
                }
              );
            } else {
              // 2. Below-the-fold row: set initial state and bind ScrollTrigger
              gsap.set(rowElements, { opacity: 0, y: 65 });

              ScrollTrigger.create({
                trigger: rowElements[0],
                scroller,
                start: "top 88%",
                once: true,
                invalidateOnRefresh: true,
                onEnter: () => {
                  gsap.to(rowElements, {
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    ease: "power3.out",
                    stagger: 0.12,
                    clearProps: "all",
                    overwrite: "auto",
                    onComplete: () => {
                      rowElements.forEach((el) =>
                        el.setAttribute("data-gsap-revealed", "true")
                      );
                    },
                  });
                },
              });
            }
          });

          ScrollTrigger.refresh();
        } catch (err) {
          console.warn("GSAP branch scroll-reveal warning:", err);
          // Fail-safe: on any error, ensure all targets remain visible
          if (container) {
            const allElements = container.querySelectorAll("[data-gsap-init]");
            gsap.set(allElements, { clearProps: "all", opacity: 1, y: 0 });
          }
        }
      };

      // Initial execution after microtask tick so paint and DOM settle
      const rafId = requestAnimationFrame(() => {
        processNewTargets();
      });

      // Observer for async API data (TanStack React Query) and tab changes
      let debounceTimer = null;
      const observer = new MutationObserver((mutations) => {
        let hasRelevantAdditions = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            for (const node of m.addedNodes) {
              if (node instanceof HTMLElement && !isExcluded(node)) {
                hasRelevantAdditions = true;
                break;
              }
            }
          }
          if (hasRelevantAdditions) break;
        }

        if (hasRelevantAdditions) {
          if (debounceTimer) cancelAnimationFrame(debounceTimer);
          debounceTimer = requestAnimationFrame(() => {
            processNewTargets();
          });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      observerRef.current = observer;
    }, container);

    ctxRef.current = ctx;

    return () => {
      safetyTimersRef.current.forEach(clearTimeout);
      safetyTimersRef.current = [];
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, [location.pathname]);
}
