import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, MapPin, Star, HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { getFavorites } from "@/services/user.service";

gsap.registerPlugin(ScrollTrigger);

/**
 * Detects the active scrolling container for the favorites grid.
 */
function getActiveScroller(container) {
  if (!container || typeof window === "undefined") return window;
  let parent = container.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if ((style.overflowY === "auto" || style.overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

export default function CustomerFavorites() {
  const navigate = useNavigate();
  const [fullFavorites, setFullFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const ctxRef = useRef(null);
  const safetyTimersRef = useRef([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        setLoading(true);
        const res = await getFavorites();
        if (res.data && Array.isArray(res.data.data)) {
          setFullFavorites(res.data.data);
        } else if (Array.isArray(res.data)) {
          setFullFavorites(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch full favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  // Filter full favorites based on store (enables optimistic removal)
  const renderFavorites = fullFavorites.filter((r) =>
    favoriteIds.includes(r._id || r.id || r.restaurantId)
  );

  const handleRemoveRestaurant = (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, name);
  };

  // Dedicated Row-Wise GSAP Scroll-Reveal for Restaurant Cards
  useEffect(() => {
    if (loading || renderFavorites.length === 0) return;

    const grid = gridRef.current;
    if (!grid) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Clear previous safety timers
    safetyTimersRef.current.forEach(clearTimeout);
    safetyTimersRef.current = [];

    // Revert previous GSAP context
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }

    const scroller = getActiveScroller(grid);

    const ctx = gsap.context(() => {
      // 1. Reveal page header if not yet revealed
      if (headerRef.current && !headerRef.current.getAttribute("data-revealed")) {
        headerRef.current.setAttribute("data-revealed", "true");
        if (prefersReducedMotion) {
          gsap.set(headerRef.current, { clearProps: "all", opacity: 1, y: 0 });
        } else {
          gsap.fromTo(
            headerRef.current,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              delay: 0.1,
              clearProps: "all",
            }
          );
        }
      }

      // 2. Identify restaurant cards inside the grid
      const cards = Array.from(grid.children).filter(
        (child) => child instanceof HTMLElement && child.classList.contains("favorite-card-item")
      );

      if (cards.length === 0) return;

      if (prefersReducedMotion) {
        cards.forEach((card) => {
          card.setAttribute("data-revealed", "true");
          gsap.set(card, { clearProps: "all", opacity: 1, y: 0 });
        });
        return;
      }

      // 3. Dynamic row grouping based on actual rendered card vertical offsets (offsetTop)
      const rows = [];
      let currentRow = [];
      let currentRowTop = null;

      cards.forEach((card) => {
        const top = card.offsetTop;
        if (currentRowTop === null || Math.abs(top - currentRowTop) < 25) {
          currentRow.push(card);
          currentRowTop = top;
        } else {
          if (currentRow.length > 0) rows.push(currentRow);
          currentRow = [card];
          currentRowTop = top;
        }
      });
      if (currentRow.length > 0) rows.push(currentRow);

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const triggerThreshold = viewportHeight * 0.88;

      // 4. Register row-wise viewport reveals
      rows.forEach((row, rowIndex) => {
        const unrevealedInRow = row.filter((c) => c.getAttribute("data-revealed") !== "true");
        if (unrevealedInRow.length === 0) return;

        unrevealedInRow.forEach((c) => c.setAttribute("data-revealed", "true"));

        // Fail-safe: ensure cards become visible even if trigger is somehow bypassed
        const timer = setTimeout(() => {
          gsap.to(unrevealedInRow, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            clearProps: "all",
            overwrite: "auto",
          });
        }, 3000);
        safetyTimersRef.current.push(timer);

        const rowTopRect = row[0].getBoundingClientRect();
        const isFirstRowInView = rowIndex === 0 && rowTopRect.top < triggerThreshold;

        if (isFirstRowInView) {
          // First row enters immediately with subtle horizontal stagger
          gsap.fromTo(
            unrevealedInRow,
            { opacity: 0, y: 65 },
            {
              opacity: 1,
              y: 0,
              duration: 1.0,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.18,
              clearProps: "transform",
              overwrite: "auto",
            }
          );
        } else {
          // Second and subsequent rows stay hidden until their individual viewport threshold is reached
          gsap.set(unrevealedInRow, { opacity: 0, y: 65 });

          ScrollTrigger.create({
            trigger: row[0],
            scroller,
            start: "top 88%",
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => {
              gsap.to(unrevealedInRow, {
                opacity: 1,
                y: 0,
                duration: 1.0,
                ease: "power3.out",
                stagger: 0.12,
                clearProps: "transform",
                overwrite: "auto",
              });
            },
          });
        }
      });

      // Recalculate ScrollTrigger geometry
      ScrollTrigger.refresh();
    }, containerRef);

    ctxRef.current = ctx;

    return () => {
      safetyTimersRef.current.forEach(clearTimeout);
      safetyTimersRef.current = [];
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, [loading, renderFavorites.length]);

  return (
    <div
      ref={containerRef}
      data-custom-reveal="true"
      className="p-4 md:p-6 lg:p-8 space-y-6 pb-12 select-none"
    >
      {/* HEADER SECTION */}
      <div ref={headerRef}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          My Favorites
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Your curated collection of fine dining restaurants
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <p className="text-muted-foreground text-sm py-8">
            Loading your favorite restaurants...
          </p>
        </div>
      ) : renderFavorites.length > 0 ? (
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {renderFavorites.map((r) => (
            <div
              key={r._id || r.id || r.restaurantId}
              className="favorite-card-item relative group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <Link
                to={`/restaurant/${r.slug || r._id || r.id || r.restaurantId}`}
                className="block relative aspect-[4/3] overflow-hidden"
              >
                <img
                  src={r.coverImage || r.image}
                  alt={r.name}
                  className="h-full w-full object-cover group-hover:scale-102 transition duration-500"
                  loading="lazy"
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) =>
                    handleRemoveRestaurant(r._id || r.id || r.restaurantId, r.name, e)
                  }
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition z-10"
                  title="Remove from favorites"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </button>

                <div className="absolute top-3 left-3 bg-black/60 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  {Array.isArray(r.cuisines)
                    ? r.cuisines[0]
                    : r.cuisine || "Cuisine"}
                </div>
              </Link>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 truncate text-sm md:text-base">
                    {r.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {r.address?.area || r.area || r.city || "Kota"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-t border-slate-50 pt-3">
                  {r.totalReviews > 0 && r.averageRating > 0 ? (
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{Number(r.averageRating).toFixed(1)}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({r.totalReviews})
                      </span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      New
                    </span>
                  )}
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/95 text-white rounded-xl h-8 text-[11px] font-bold shadow-sm"
                    onClick={() =>
                      navigate(`/book/${r._id || r.id || r.restaurantId}`)
                    }
                  >
                    Book Table
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HeartCrack}
          title="No favorite restaurants"
          description="Browse through fine dining spots and add them to quickly book next time."
          actionLabel="Explore catalog"
          onAction={() => navigate("/discover")}
        />
      )}
    </div>
  );
}
