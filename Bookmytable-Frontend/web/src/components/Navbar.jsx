import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Search, Menu, X, MapPin, ChevronDown, Check, ArrowLeft, Building2, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { navLinks } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { useLocationStore } from "@/store/useLocationStore";
import { useQuery } from "@tanstack/react-query";
import { getCities, getAreas } from "@/services/discovery.service";

function Navbar({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  
  // Dynamic Location Selector State
  const { location: storedLocation, setCity, setArea } = useLocationStore();
  const [view, setView] = useState("city"); // "city" | "area"

  // Always default to "city" view whenever the popover opens so available cities are visible
  useEffect(() => {
    if (openLocation) {
      setView("city");
    }
  }, [openLocation]);

  const { data: citiesRes, isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 5 * 60 * 1000,
  });

  const { data: areasRes, isLoading: loadingAreas } = useQuery({
    queryKey: ["areas", storedLocation.city],
    queryFn: () => getAreas(storedLocation.city),
    enabled: !!storedLocation.city,
    staleTime: 5 * 60 * 1000,
  });

  const cities = citiesRes?.data?.data || [];
  const areas = areasRes?.data?.data || [];
  
  const displayLocation = storedLocation.area 
    ? `${storedLocation.area}, ${storedLocation.city}`
    : storedLocation.city || "Select Location";

  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isNavOnHero, setIsNavOnHero] = useState(isHome);

  // Route-based active detection for navigation items
  const isLinkActive = (link) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;

    if (link.label === "Discover") {
      return currentPath === "/discover" || currentPath.startsWith("/discover");
    }
    if (link.label === "How it Works") {
      return currentPath === "/how-it-works" || currentHash === "#how-it-works";
    }
    if (link.label === "For Restaurants") {
      return (
        currentPath === "/for-restaurants" ||
        currentPath === "/brand" ||
        currentPath.startsWith("/brand") ||
        currentPath === "/partner-with-us"
      );
    }

    if (link.href === "/") {
      return currentPath === "/";
    }
    return currentPath === link.href;
  };

  useEffect(() => {
    if (!isHome) {
      setIsNavOnHero(false);
      return;
    }

    const checkNavPosition = () => {
      const heroEl = document.querySelector("[data-hero]");
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      // Nav pill is fixed at top: 0, height ~60-70px.
      // Nav is on Hero if Hero's bottom extends below 60px and top is at or above 60px.
      const onHero = rect.bottom > 60 && rect.top <= 60;
      setIsNavOnHero(onHero);
    };

    // Run check immediately on mount and on next frame
    checkNavPosition();
    const rafId = requestAnimationFrame(checkNavPosition);

    // Primary signal from HeroCinematicCanvas ScrollTrigger
    const handleProgress = (e) => {
      if (typeof e.detail?.isComplete === "boolean") {
        if (!e.detail.isComplete) {
          setIsNavOnHero(true);
        } else {
          // Double-check physical position in case hero is still scrolling away
          checkNavPosition();
        }
      }
    };
    window.addEventListener("cinematic-scroll-progress", handleProgress);

    // Throttled scroll & resize listener to track physical position continuously
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkNavPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("cinematic-scroll-progress", handleProgress);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  const isTransparent = isHome && isNavOnHero;

  // GSAP pill entry animation on mount
  const navRef   = useRef(null);  // Root <nav> — targeted by scroll-direction hide/show
  const pillRef  = useRef(null);  // Inner pill — targeted by center-outward reveal only
  const linksRef = useRef(null);
  const logoRef = useRef(null);
  const locationRef = useRef(null);
  const actionsRef = useRef(null);
  const mobileToggleRef = useRef(null);

  useEffect(() => {
    if (!pillRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      gsap.set(pillRef.current, { clearProps: "clipPath,willChange" });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Clear clip-path so standard CSS border-radius and shadows take over cleanly
        if (pillRef.current) {
          gsap.set(pillRef.current, { clearProps: "clipPath,willChange" });
        }
      },
    });

    // ── True Center-Outward Reveal ──────────────────────────────────────────
    // Begins at exact horizontal center (50% left, 50% right = 0px width).
    // Expands outward symmetrically toward the left and right at the exact same rate.
    // Center point remains completely fixed throughout.
    // "round 28px" mathematically ensures semicircular ends at every single frame.
    // Content inside (logo, links, location, buttons) stays at its final layout and position.
    tl.fromTo(
      pillRef.current,
      {
        clipPath: "inset(0% 50% 0% 50% round 28px)",
      },
      {
        clipPath: "inset(0% 0% 0% 0% round 28px)",
        duration: 0.75,
        ease: "power3.out",
        delay: 0.05,
      }
    );

    return () => {
      tl.kill();
    };
  }, []);

  // ─── Scroll-Direction Hide / Show ────────────────────────────────────────────
  //
  // Targets navRef (the root <nav>) with GSAP translateY(-100%) / translateY(0).
  // Completely independent from the center-outward reveal on pillRef.
  //
  // Rules:
  //   • Scroll DOWN  → hide nav upward  (translateY -100%)
  //   • Scroll UP    → show nav          (translateY 0)
  //   • Near top (scrollY < TOP_THRESHOLD) → always visible (translateY 0)
  //   • Requires a meaningful direction change before triggering opposite animation
  //     (avoids jitter at slow/micro scroll reversals)
  //   • Mobile menu open → never hide the nav
  //   • One active GSAP tween at a time (overwrite: "auto")
  //   • prefers-reduced-motion → skip animation, keep visible
  //
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const TOP_THRESHOLD   = 80;   // px — below this Y, header is always visible
    const DOWN_THRESHOLD  = 6;    // px — minimum downward delta to trigger hide
    const UP_THRESHOLD    = 4;    // px — minimum upward delta to trigger show

    let prevScrollY    = window.scrollY;
    let isHidden       = false;
    let ticking        = false;
    let accumulated    = 0;       // tracks accumulated delta in current direction

    const showNav = () => {
      if (!isHidden) return;
      isHidden = false;
      if (prefersReduced) {
        gsap.set(nav, { yPercent: 0 });
      } else {
        gsap.to(nav, {
          yPercent: 0,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const hideNav = () => {
      if (isHidden) return;
      isHidden = true;
      if (prefersReduced) {
        gsap.set(nav, { yPercent: -100 });
      } else {
        gsap.to(nav, {
          yPercent: -100,
          duration: 0.32,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta    = currentY - prevScrollY;

        // ── Always visible at top of page ───────────────────────────────────
        if (currentY < TOP_THRESHOLD) {
          accumulated = 0;
          showNav();
          prevScrollY = currentY;
          ticking = false;
          return;
        }

        // ── Mobile menu open: never hide ────────────────────────────────────
        // mobileOpen is captured via closure — reads current value each frame
        if (mobileOpen) {
          showNav();
          prevScrollY = currentY;
          ticking = false;
          return;
        }

        // ── Direction tracking with threshold ───────────────────────────────
        if (delta > 0) {
          // Scrolling DOWN
          if (accumulated < 0) accumulated = 0; // reset on direction flip
          accumulated += delta;
          if (accumulated > DOWN_THRESHOLD) {
            hideNav();
          }
        } else if (delta < 0) {
          // Scrolling UP
          if (accumulated > 0) accumulated = 0; // reset on direction flip
          accumulated += delta;
          if (accumulated < -UP_THRESHOLD) {
            showNav();
          }
        }

        prevScrollY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [mobileOpen]); // re-run if mobile menu state changes

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="container mx-auto px-4 lg:px-8 pt-3">
        {/* Pill-shaped floating navbar capsule — GSAP animates this */}
        <div
          ref={pillRef}
          className={`pointer-events-auto flex h-14 items-center justify-between px-4 lg:px-6 rounded-full transition-[background-color,border-color,box-shadow] duration-300 ${
            isTransparent
              ? "shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              : "glass shadow-card"
          }`}
          style={{
            background: isTransparent
              ? "rgba(20,20,20,0.55)"
              : undefined,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: isTransparent
              ? "1px solid rgba(255,255,255,0.12)"
              : undefined,
            clipPath: "inset(0% 50% 0% 50% round 28px)",
            WebkitClipPath: "inset(0% 50% 0% 50% round 28px)",
            willChange: "clip-path",
          }}
        >
        {/* Left Side (Logo & Location) */}
        <div className="flex flex-1 items-center gap-6">
          <Link ref={logoRef} to="/" className="flex items-center gap-2">
            <BrandLogo className="h-9 w-auto max-w-[120px] rounded-md" />
            <span
              className={`text-lg font-bold tracking-tight hidden sm:inline-block transition-colors duration-300 ${
                isTransparent ? "text-white" : "text-foreground"
              }`}
              style={{
                textShadow: isTransparent ? "0 1px 10px rgba(0,0,0,0.75)" : undefined,
              }}
            >
              Book<span className="text-primary">My</span>Table
            </span>
          </Link>

          {/* Searchable Location Selector */}
          <div ref={locationRef} className="hidden sm:flex items-center">
            <Popover open={openLocation} onOpenChange={setOpenLocation}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`gap-2 h-9 px-3 flex max-w-[200px] lg:max-w-[300px] transition-colors duration-300 ${
                    isTransparent
                      ? "text-white hover:text-white hover:bg-white/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                  style={{
                    textShadow: isTransparent ? "0 1px 8px rgba(0,0,0,0.75)" : undefined,
                  }}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{displayLocation}</span>
                  <ChevronDown className={`h-3 w-3 shrink-0 ${isTransparent ? "text-white/80" : "text-muted-foreground"}`} />
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 shadow-lg border-border" align="start">
              {/* Segmented View Switcher */}
              <div className="flex items-center p-2 border-b bg-muted/30 gap-1">
                <button
                  type="button"
                  onClick={() => setView("city")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 px-3 rounded-md font-medium transition-all ${
                    view === "city"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Cities ({cities.length})
                </button>
                <button
                  type="button"
                  onClick={() => storedLocation.city && setView("area")}
                  disabled={!storedLocation.city}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 px-3 rounded-md font-medium transition-all truncate ${
                    view === "area"
                      ? "bg-background text-foreground shadow-sm"
                      : storedLocation.city
                      ? "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      : "opacity-40 cursor-not-allowed text-muted-foreground"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {storedLocation.city ? `Areas (${storedLocation.city})` : "Areas"}
                  </span>
                </button>
              </div>

              <Command>
                <CommandInput 
                  placeholder={view === "city" ? "Search cities on BookMyTable..." : `Search areas in ${storedLocation.city}...`} 
                />
                
                <CommandList>
                  <CommandEmpty>
                    {view === "city" ? "No cities found with available restaurants." : `No areas found in ${storedLocation.city}.`}
                  </CommandEmpty>
                  
                  {view === "city" && (
                    <CommandGroup heading="Available Cities with Restaurants">
                      {loadingCities ? (
                        <div className="p-4 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Loading cities...
                        </div>
                      ) : cities.length > 0 ? (
                        cities.map((city) => {
                          const isSelected = storedLocation.city?.toLowerCase() === city.toLowerCase();
                          return (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => {
                                setCity(city);
                                setArea("");
                                setOpenLocation(false);
                              }}
                              className="cursor-pointer flex items-center justify-between py-2 px-3"
                            >
                              <div className="flex items-center gap-2">
                                <Check className={`h-4 w-4 ${isSelected ? "opacity-100 text-primary" : "opacity-0"}`} />
                                <span className={`text-sm ${isSelected ? "font-semibold text-primary" : "font-medium text-foreground"}`}>
                                  {city}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCity(city);
                                  setView("area");
                                }}
                                className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-muted"
                                title={`Explore areas in ${city}`}
                              >
                                Areas <ChevronRight className="h-3 w-3" />
                              </button>
                            </CommandItem>
                          );
                        })
                      ) : (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                          No cities available currently.
                        </div>
                      )}
                    </CommandGroup>
                  )}

                  {view === "area" && (
                    <CommandGroup heading={`Areas in ${storedLocation.city}`}>
                      <CommandItem
                        value={`all-${storedLocation.city}`}
                        onSelect={() => {
                          setArea("");
                          setOpenLocation(false);
                        }}
                        className="cursor-pointer py-2 px-3 flex items-center"
                      >
                        <Check className={`mr-2 h-4 w-4 ${!storedLocation.area ? "opacity-100 text-primary" : "opacity-0"}`} />
                        <span className="font-semibold text-foreground">All of {storedLocation.city}</span>
                      </CommandItem>

                      {loadingAreas ? (
                        <div className="p-4 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Loading areas...
                        </div>
                      ) : areas.length > 0 ? (
                        areas.map((area) => (
                          <CommandItem
                            key={area}
                            value={area}
                            onSelect={() => {
                              setArea(area);
                              setOpenLocation(false);
                            }}
                            className="cursor-pointer py-2 px-3 flex items-center"
                          >
                            <Check className={`mr-2 h-4 w-4 ${storedLocation.area?.toLowerCase() === area.toLowerCase() ? "opacity-100 text-primary" : "opacity-0"}`} />
                            <span className="text-sm">{area}</span>
                          </CommandItem>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-center text-muted-foreground">
                          No specific sub-areas listed. Showing all restaurants in {storedLocation.city}.
                        </div>
                      )}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          </div>
        </div>

        {/* Center Side (Nav Links or Children) */}
        <div className="flex-1 flex justify-center px-4">
           {children || (
             <div ref={linksRef} className="hidden items-center gap-8 md:flex">
               {navLinks.map((link) => {
                 const active = isLinkActive(link);
                 return (
                   <Link
                     key={link.href}
                     to={link.href}
                     className={`text-sm font-medium transition-colors duration-200 ${
                       active
                         ? "text-primary"
                         : isTransparent
                         ? "text-white hover:text-primary"
                         : "text-muted-foreground hover:text-primary"
                     }`}
                     style={{
                       textShadow: isTransparent ? "0 1px 8px rgba(0,0,0,0.85)" : undefined,
                     }}
                   >
                     {link.label}
                   </Link>
                 );
               })}
             </div>
           )}
        </div>

        {/* Right Side (Profile / Auth) */}
        <div ref={actionsRef} className="flex flex-1 items-center justify-end gap-3 hidden md:flex">
          {user ? ( 
            <div>
              <Link to="/profile" className="flex justify-center items-center gap-2.5">
                <Avatar className={`h-10 w-10 border shadow-sm transition-colors duration-300 ${isTransparent ? "border-white/40 ring-1 ring-white/20" : "border-border"}`}>
                  <AvatarImage src={user.avatar || ""} className="object-cover" />
                  <AvatarFallback className="text-xl font-bold bg-muted text-foreground">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isTransparent ? "text-white" : "text-foreground"
                  }`}
                  style={{
                    textShadow: isTransparent ? "0 1px 8px rgba(0,0,0,0.85)" : undefined,
                  }}
                >
                  Hi, {user.name}
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/login">
              <Button
                variant="default"
                className={isTransparent ? "shadow-[0_4px_14px_rgba(225,29,72,0.4)]" : ""}
              >
                Log in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          ref={mobileToggleRef}
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>{/* end pill */}

        {/* Mobile menu — floats below the pill */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2 rounded-2xl border border-white/10 md:hidden"
              style={{
                background: "rgba(20,20,20,0.80)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <div className="flex flex-col gap-4 px-4 py-6">
                {navLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`text-sm font-medium transition-colors duration-200 ${
                        active
                          ? "text-primary"
                          : "text-white/80 hover:text-primary"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="default" size="sm" className="w-full shadow-[0_4px_14px_rgba(225,29,72,0.4)]">Log in</Button>
                </Link>
                <Link to="/search" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Book a Table</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>{/* end container */}
    </nav>
  );
}

export { Navbar };
