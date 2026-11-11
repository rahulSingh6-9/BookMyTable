import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Checks if an element or any of its ancestors should be excluded from scroll reveal.
 * Excludes modals, popovers, dropdowns, tooltips, toasts, loading spinners, and fixed headers.
 */
function isExcluded(el) {
  if (!el || !(el instanceof HTMLElement)) return true;

  // Exclude hidden elements (display: none or 0 dimensions with no client rects)
  if (el.offsetWidth === 0 && el.offsetHeight === 0 && !el.getClientRects().length) {
    return true;
  }

  // Exclude overlays, portals, dialogs, popovers, and toasts
  if (
    el.closest('[role="dialog"]') ||
    el.closest('[role="alertdialog"]') ||
    el.closest('[role="popover"]') ||
    el.closest('[role="tooltip"]') ||
    el.closest('[data-radix-popper-content-wrapper]') ||
    el.closest('[data-radix-portal]') ||
    el.closest('.sonner-toast') ||
    el.closest('[data-sonner-toaster]') ||
    el.closest('.toaster')
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

  // Exclude fixed/sticky navigation headers and mobile bottom bars
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
  if (isMainScrollable && (style.overflowY === "auto" || style.overflowY === "scroll")) {
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

  directChildren.forEach((child) => {
    if (isExcluded(child) || visited.has(child)) return;

    // Case 1: Grid container (booking cards, favorite cards, reward scoreboard, etc.)
    const grid = child.classList.contains("grid")
      ? child
      : child.querySelector(":scope > .grid") || child.querySelector(".grid");

    if (grid && grid.children.length > 0) {
      // If there is a section header preceding the grid inside `child`, add it first
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
        const panelGrid = activePanel.querySelector(".grid");
        if (panelGrid && panelGrid.children.length > 0) {
          Array.from(panelGrid.children).forEach((item) => {
            if (!isExcluded(item) && !visited.has(item)) {
              candidates.push(item);
              visited.add(item);
            }
          });
        } else {
          Array.from(activePanel.children).forEach((panelChild) => {
            if (!isExcluded(panelChild) && !visited.has(panelChild)) {
              candidates.push(panelChild);
              visited.add(panelChild);
            }
          });
        }
      }
      return;
    }

    // Case 3: Canvas wrapper containing nested routes (e.g., CustomerSettings canvas with nested Outlet)
    const nestedSubpage = child.querySelector(":scope > .space-y-8, :scope > .space-y-6, :scope > div > .space-y-8, :scope > div > .space-y-6");
    if (nestedSubpage) {
      collectCandidatesFrom(nestedSubpage, candidates, visited);
      return;
    }

    // Case 4: Timeline items list (CustomerActivity)
    const timelineItems = child.querySelectorAll(".flex.flex-col.sm\\:flex-row.gap-4");
    if (timelineItems.length > 0) {
      timelineItems.forEach((item) => {
        if (!isExcluded(item) && !visited.has(item)) {
          candidates.push(item);
          visited.add(item);
        }
      });
      return;
    }

    // Case 5: Notification items list (CustomerNotifications)
    const notifItems = child.querySelectorAll(".divide-y > *");
    if (notifItems.length > 0) {
      const filterBar = child.querySelector(".flex.flex-wrap.items-center.gap-2");
      if (filterBar && !visited.has(filterBar)) {
        candidates.push(filterBar);
        visited.add(filterBar);
      }
      notifItems.forEach((item) => {
        if (!isExcluded(item) && !visited.has(item)) {
          candidates.push(item);
          visited.add(item);
        }
      });
      return;
    }

    // Case 6: Standard top-level block (Header, Standalone Card, Section, Form, EmptyState)
    candidates.push(child);
    visited.add(child);
  });
}

/**
 * Discovers the logical reveal units inside the customer panel.
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

  // Find page roots inside the container (e.g. content containers rendered under Outlet)
  const pageRoots = container.querySelectorAll(
    ".p-4, .p-6, .p-8, .space-y-6, .space-y-8, [data-customer-page]"
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
 * all Customer/User Panel views.
 *
 * Guarantees:
 * - Content is NEVER permanently hidden (automatic 2.5s fallback failsafe on all targets).
 * - Client-side sidebar navigation works smoothly without blank screens or reload requirements.
 * - Viewport-based sequential reveal for initially visible elements.
 * - Below-the-fold elements wait for ScrollTrigger threshold.
 * - Dynamic and asynchronous content (APIs, tabs) detected automatically.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the `<main>` scroll/content area
 */
export function useCustomerScrollReveal(containerRef) {
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

    // 2. Clear any active safety timers from previous page
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
          const triggerThreshold = viewportHeight * 0.85;

          const initialTargets = [];
          const belowFoldTargets = [];

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

            // Determine if element is in the initial visible viewport
            if (rect.top < triggerThreshold && rect.bottom > 0) {
              initialTargets.push({ el, rect });
            } else {
              belowFoldTargets.push({ el, rect });
            }
          });

          // Sort initially visible targets in natural visual reading order
          initialTargets.sort((a, b) => {
            const rowDiff = Math.abs(a.rect.top - b.rect.top);
            if (rowDiff > 35) {
              return a.rect.top - b.rect.top;
            }
            return a.rect.left - b.rect.left;
          });

          // 1. Reveal initially visible elements progressively
          initialTargets.forEach((item, index) => {
            const el = item.el;
            const initialDelay = 0.15 + index * 0.13;

            gsap.fromTo(
              el,
              { opacity: 0, y: 65 },
              {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: "power3.out",
                delay: initialDelay,
                clearProps: "all",
                overwrite: "auto",
                onComplete: () => {
                  el.setAttribute("data-gsap-revealed", "true");
                },
              }
            );
          });

          // 2. Attach individual ScrollTriggers for below-the-fold elements
          belowFoldTargets.forEach((item) => {
            const el = item.el;

            const colIndex = Math.max(0, Math.round(item.rect.left / Math.max(item.rect.width, 250)));
            const colStagger = Math.min(colIndex * 0.12, 0.36);

            // Only set hidden state when ScrollTrigger is being registered
            gsap.set(el, { opacity: 0, y: 65 });

            ScrollTrigger.create({
              trigger: el,
              scroller,
              start: "top 85%",
              once: true,
              invalidateOnRefresh: true,
              onEnter: () => {
                gsap.to(el, {
                  opacity: 1,
                  y: 0,
                  duration: 1.1,
                  ease: "power3.out",
                  delay: colStagger,
                  clearProps: "all",
                  overwrite: "auto",
                  onComplete: () => {
                    el.setAttribute("data-gsap-revealed", "true");
                  },
                });
              },
            });
          });

          ScrollTrigger.refresh();
        } catch (err) {
          console.warn("GSAP scroll-reveal warning:", err);
          // Fail-safe: on any error, ensure all targets remain visible
          if (container) {
            const allElements = container.querySelectorAll("[data-gsap-init]");
            gsap.set(allElements, { clearProps: "all", opacity: 1, y: 0 });
          }
        }
      };

      // Run initial pass after a microtask tick so route paint and scroll position are fully settled
      const rafId = requestAnimationFrame(() => {
        processNewTargets();
      });

      // Observer for async API data and tab switching
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
