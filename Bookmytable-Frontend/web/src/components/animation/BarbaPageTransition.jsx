import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BarbaPageTransition({ children }) {
  const location = useLocation();

  // Manage locations for incoming and outgoing route layers
  const [displayLocation, setDisplayLocation] = useState(location);
  const [outgoingLocation, setOutgoingLocation] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const prevPathnameRef = useRef(location.pathname);
  const incomingRef = useRef(null);
  const outgoingRef = useRef(null);
  const timelineRef = useRef(null);
  const barbaRef = useRef(null);

  // Synchronous route change detection during render phase
  if (location.pathname !== prevPathnameRef.current) {
    prevPathnameRef.current = location.pathname;
    setOutgoingLocation(displayLocation); // Retain previous route location for background
    setDisplayLocation(location);         // Set new route location for incoming layer
    setIsTransitioning(true);
  }

  // Initialize Barba.js core lifecycle hooks
  useEffect(() => {
    let isMounted = true;
    import("@barba/core")
      .then((barbaModule) => {
        if (!isMounted) return;
        const barba = barbaModule.default || barbaModule;
        barbaRef.current = barba;
        try {
          barba.init({
            preventRunning: true,
            transitions: [
              {
                name: "incoming-page-slide-up",
                async leave() {
                  return true;
                },
                async enter() {
                  return true;
                },
              },
            ],
          });
        } catch (e) {
          // Ignore if already initialized
        }
      })
      .catch((err) => {
        console.warn("Barba.js core active with route transition controller:", err);
      });

    return () => {
      isMounted = false;
      if (barbaRef.current) {
        try {
          barbaRef.current.destroy();
        } catch (e) {
          // ignore cleanup
        }
      }
    };
  }, []);

  // Synchronous layout effect: Trigger GSAP slide-up animation BEFORE browser paint
  useLayoutEffect(() => {
    if (!isTransitioning) return;

    const incomingEl = incomingRef.current;
    if (!incomingEl) return;

    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsTransitioning(false);
      setOutgoingLocation(null);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // Clean up GSAP ScrollTrigger instances from outgoing page
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Scroll window to top for incoming page view
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Kill any active timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Animate incoming page from translateY(100vh) to translateY(0vh)
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        setOutgoingLocation(null);

        // Reset inline styles on incoming container so it flows naturally in relative layout
        if (incomingEl) {
          gsap.set(incomingEl, { clearProps: "all" });
        }

        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
      },
    });

    timelineRef.current.fromTo(
      incomingEl,
      {
        y: "100vh",
        willChange: "transform",
      },
      {
        y: "0vh",
        duration: 0.65,
        ease: "power3.inOut",
      }
    );

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isTransitioning, displayLocation.pathname]);

  // Render helper: Evaluates function child with location prop if render prop is provided
  const renderContent = (loc) => {
    if (typeof children === "function") {
      return children(loc);
    }
    return children;
  };

  return (
    <div data-barba="wrapper" className="relative min-h-screen w-full overflow-x-hidden bg-background">
      {/* OUTGOING PAGE LAYER (Strictly renders previous location stationary in background) */}
      {isTransitioning && outgoingLocation && (
        <div
          ref={outgoingRef}
          className="fixed inset-0 z-10 w-full h-full overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {renderContent(outgoingLocation)}
        </div>
      )}

      {/* INCOMING PAGE LAYER (Renders display location starting off-screen at translateY(100vh)) */}
      <main
        ref={incomingRef}
        data-barba="container"
        data-barba-namespace={displayLocation.pathname}
        className={
          isTransitioning
            ? "fixed inset-0 z-20 w-full h-full overflow-y-auto bg-background shadow-2xl"
            : "relative w-full min-h-screen bg-background"
        }
        style={isTransitioning ? { transform: "translateY(100vh)", willChange: "transform" } : {}}
      >
        {renderContent(displayLocation)}
      </main>
    </div>
  );
}
