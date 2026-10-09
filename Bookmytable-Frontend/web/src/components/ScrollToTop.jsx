import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * Mounts once inside <BrowserRouter>.
 * Watches for pathname changes and instantly resets scroll to (0, 0).
 *
 * - Uses "instant" (not "smooth") so the new page never flickers from a mid-page position.
 * - Only fires on pathname change, not on same-route re-renders or search/hash updates.
 * - Does not interfere with GSAP ScrollTrigger — the scroll reset happens before the new
 *   page's useEffect runs, so ScrollTrigger calculates its trigger positions from y=0.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
