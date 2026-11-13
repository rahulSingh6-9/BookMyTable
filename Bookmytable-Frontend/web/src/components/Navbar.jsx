import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Search, Menu, X, MapPin, ChevronDown, Check, ArrowLeft, Building2, Loader2, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { navLinks } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { useLocationStore } from "@/store/useLocationStore";
import { useQuery } from "@tanstack/react-query";
import { getCities, getAreas } from "@/services/discovery.service";
import { useBrand } from "@/context/BrandContext";

function Navbar({ children }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
  const isAuthenticated = Boolean(user || (authLoading && hasToken));
  const navigate = useNavigate();

  // Brand context for mobile "For Restaurants" conditional navigation
  const { brands, isLoading: brandLoading } = useBrand();
  const hasBrands = !brandLoading && brands && brands.length > 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

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

  // Prevent background page scrolling while the mobile full-screen navigation is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Support Escape key to close the full-screen mobile navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

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

  // cmdk stores pointer highlight as data-selected and keeps it after mouse leave.
  // Neutralize that persistent highlight; use CSS :hover for the green effect.
  const locationItemClass = (...classes) =>
    cn(
      "cursor-pointer rounded-md",
      "data-[selected=true]:!bg-transparent data-[selected='true']:!bg-transparent",
      "data-[selected=true]:!text-foreground data-[selected='true']:!text-foreground",
      "hover:!bg-accent hover:!text-accent-foreground",
      "data-[selected=true]:hover:!bg-accent data-[selected='true']:hover:!bg-accent",
      "data-[selected=true]:hover:!text-accent-foreground data-[selected='true']:hover:!text-accent-foreground",
      ...classes
    );

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
    <>
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
        <div className="flex flex-1 items-center gap-2 sm:gap-6 min-w-0">
          <Link ref={logoRef} to="/" className="flex items-center gap-2 shrink-0">
            <BrandLogo className="h-8 sm:h-9 w-auto max-w-[90px] sm:max-w-[120px] rounded-md" />
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

          {/* Searchable Location Selector / City Switcher */}
          <div ref={locationRef} className="flex items-center min-w-0">
            <Popover open={openLocation} onOpenChange={setOpenLocation}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`group gap-1 sm:gap-2 h-7 sm:h-9 px-1.5 sm:px-3 flex items-center max-w-[105px] xs:max-w-[130px] sm:max-w-[200px] lg:max-w-[300px] transition-colors duration-300 ${
                    isTransparent
                      ? "text-white hover:text-white hover:bg-white/10"
                      : "text-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={{
                    textShadow: isTransparent ? "0 1px 8px rgba(0,0,0,0.75)" : undefined,
                  }}
                  aria-label="Select city or area"
                >
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                  <span className={`text-[11px] sm:text-sm truncate ${isTransparent ? "text-white group-hover:text-white" : "text-foreground group-hover:text-foreground"}`}>
                    <span className="sm:hidden font-medium">{storedLocation.city || "Select City"}</span>
                    <span className="hidden sm:inline font-medium">{displayLocation}</span>
                  </span>
                  <ChevronDown className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 shrink-0 transition-transform duration-200 ${openLocation ? "rotate-180" : ""} ${isTransparent ? "text-white/80 group-hover:text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-[260px] xs:w-[285px] sm:w-[320px] max-w-[calc(100vw-24px)] p-0 shadow-xl border-border z-[110]" align="start" sideOffset={6}>
              {/* Segmented View Switcher */}
              <div className="flex items-center p-1.5 sm:p-2 border-b bg-muted/30 gap-1">
                <button
                  type="button"
                  onClick={() => setView("city")}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 rounded-md font-medium transition-all ${
                    view === "city"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="truncate">Cities ({cities.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => storedLocation.city && setView("area")}
                  disabled={!storedLocation.city}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 rounded-md font-medium transition-all truncate ${
                    view === "area"
                      ? "bg-background text-foreground shadow-sm"
                      : storedLocation.city
                      ? "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      : "opacity-40 cursor-not-allowed text-muted-foreground"
                  }`}
                >
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="truncate">
                    {storedLocation.city ? `Areas (${storedLocation.city})` : "Areas"}
                  </span>
                </button>
              </div>

              <Command>
                <CommandInput 
                  className="h-8 sm:h-11 py-1.5 sm:py-3 text-xs sm:text-sm"
                  placeholder={view === "city" ? "Search cities..." : `Search areas in ${storedLocation.city}...`} 
                />
                
                <CommandList className="max-h-[210px] sm:max-h-[300px]">
                  <CommandEmpty className="py-4 text-xs sm:text-sm text-center">
                    {view === "city" ? "No cities found." : `No areas found in ${storedLocation.city}.`}
                  </CommandEmpty>
                  
                  {view === "city" && (
                    <CommandGroup heading="Available Cities" className="[&_[cmdk-group-heading]]:text-[10px] sm:[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:py-1">
                      {loadingCities ? (
                        <div className="p-3 text-xs sm:text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
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
                              className={locationItemClass(
                                "group flex items-center justify-between py-1.5 px-2.5 sm:py-2 sm:px-3"
                              )}
                            >
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <Check className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${isSelected ? "opacity-100 text-primary group-hover:text-accent-foreground" : "opacity-0"}`} />
                                <span className={`text-xs sm:text-sm truncate group-hover:text-accent-foreground ${isSelected ? "font-semibold text-primary" : "font-medium text-foreground"}`}>
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
                                className="text-[10px] sm:text-[11px] text-muted-foreground group-hover:text-accent-foreground/90 hover:text-primary flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded hover:bg-black/10 shrink-0"
                                title={`Explore areas in ${city}`}
                              >
                                Areas <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </button>
                            </CommandItem>
                          );
                        })
                      ) : (
                        <div className="p-3 text-xs sm:text-sm text-center text-muted-foreground">
                          No cities available currently.
                        </div>
                      )}
                    </CommandGroup>
                  )}

                  {view === "area" && (
                    <CommandGroup heading={`Areas in ${storedLocation.city}`} className="[&_[cmdk-group-heading]]:text-[10px] sm:[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:py-1">
                      <CommandItem
                        value={`all-${storedLocation.city}`}
                        onSelect={() => {
                          setArea("");
                          setOpenLocation(false);
                        }}
                        className={locationItemClass(
                          "group py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center"
                        )}
                      >
                        <Check className={`mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${!storedLocation.area ? "opacity-100 text-primary group-hover:text-accent-foreground" : "opacity-0"}`} />
                        <span className={`font-semibold text-xs sm:text-sm group-hover:text-accent-foreground ${!storedLocation.area ? "text-primary" : "text-foreground"}`}>
                          All of {storedLocation.city}
                        </span>
                      </CommandItem>

                      {loadingAreas ? (
                        <div className="p-3 text-xs sm:text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
                          Loading areas...
                        </div>
                      ) : areas.length > 0 ? (
                        areas.map((area) => {
                          const isSelected = storedLocation.area?.toLowerCase() === area.toLowerCase();
                          return (
                          <CommandItem
                            key={area}
                            value={area}
                            onSelect={() => {
                              setArea(area);
                              setOpenLocation(false);
                            }}
                            className={locationItemClass(
                              "group py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center"
                            )}
                          >
                            <Check className={`mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${isSelected ? "opacity-100 text-primary group-hover:text-accent-foreground" : "opacity-0"}`} />
                            <span className={`text-xs sm:text-sm truncate group-hover:text-accent-foreground ${isSelected ? "font-semibold text-primary" : ""}`}>
                              {area}
                            </span>
                          </CommandItem>
                          );
                        })
                      ) : (
                        <div className="p-2.5 text-[11px] sm:text-xs text-center text-muted-foreground">
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
        <div className="hidden md:flex flex-1 justify-center px-4">
           {children || (
             <div ref={linksRef} className="flex items-center gap-8">
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
          onClick={() => setMobileOpen(true)}
          className={`md:hidden shrink-0 ml-auto p-1.5 transition-colors duration-300 ${isTransparent ? "text-white" : "text-foreground"}`}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        </div>{/* end pill */}
      </div>{/* end container */}
    </nav>

    {/* Premium Full-Screen Mobile Navigation Overlay (100vw × 100dvh) */}
    {typeof document !== "undefined" && createPortal(
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[200] w-screen h-[100dvh] flex flex-col justify-between overflow-hidden md:hidden select-none"
            style={{
              background: "linear-gradient(180deg, #18110c 0%, #120d09 50%, #0a0705 100%)",
            }}
          >
            {/* Ambient Warm & Signature Red Lighting */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25"
                style={{ background: "radial-gradient(circle, #e11d48 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
              />
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            {/* Top Header */}
            <header className="relative z-10 flex items-center justify-between px-6 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 border-b border-[#f5efe6]/10">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <BrandLogo className="h-8 w-auto max-w-[100px] rounded-md transition-transform duration-300 group-hover:scale-105" />
                <span className="text-xl font-bold tracking-tight text-[#f5efe6]">
                  Book<span className="text-primary">My</span>Table
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="flex items-center justify-center h-10 w-10 rounded-full text-[#f5efe6]/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
              >
                <X className="h-6 w-6 stroke-[2.2]" />
              </button>
            </header>

            {/* Navigation Options: Dynamically reflects authentication state */}
            <motion.nav
              key={isAuthenticated ? "auth-nav-in" : "auth-nav-out"}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1,
                  },
                },
              }}
              className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-4 overflow-y-auto min-h-0"
            >
              <div className="flex flex-col items-center justify-center w-full max-w-sm my-auto">
                {/* 1. Discover Restaurants */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="w-full text-center"
                >
                  <Link
                    to="/discover"
                    onClick={() => setMobileOpen(false)}
                    className="group inline-block py-2 text-3xl sm:text-4xl font-serif text-[#f5efe6] hover:text-primary transition-colors duration-200 tracking-tight"
                  >
                    <span>Discover Restaurants</span>
                  </Link>
                </motion.div>

                {/* 2. Profile (When User Is Logged In) */}
                {isAuthenticated && (
                  <>
                    <div className="h-5 sm:h-7" />
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                      className="w-full text-center"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="group inline-block py-2 text-3xl sm:text-4xl font-serif text-[#f5efe6] hover:text-primary transition-colors duration-200 tracking-tight"
                      >
                        <span>Profile</span>
                      </Link>
                    </motion.div>
                  </>
                )}

                <div className="h-5 sm:h-7" />

                {/* For Restaurants — same flow as desktop: /brand → BrandSync handles redirect */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="w-full text-center"
                >
                  {isAuthenticated && brandLoading ? (
                    /* Still loading brand data — show disabled state, do not navigate prematurely */
                    <span className="group inline-flex items-center justify-center gap-2 py-2 text-3xl sm:text-4xl font-serif text-[#f5efe6]/50 tracking-tight cursor-wait">
                      <span>For Restaurants</span>
                      <Loader2 className="h-5 w-5 mt-1 animate-spin" />
                    </span>
                  ) : hasBrands ? (
                    /* User owns a restaurant — navigate to /brand, BrandSync redirects correctly */
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/brand");
                      }}
                      className="group inline-block py-2 text-3xl sm:text-4xl font-serif text-[#f5efe6] hover:text-primary transition-colors duration-200 tracking-tight"
                    >
                      <span>For Restaurants</span>
                    </button>
                  ) : (
                    /* No brands (new partner) or logged out → /partner-with-us */
                    <Link
                      to="/partner-with-us"
                      onClick={() => setMobileOpen(false)}
                      className="group inline-block py-2 text-3xl sm:text-4xl font-serif text-[#f5efe6] hover:text-primary transition-colors duration-200 tracking-tight"
                    >
                      <span>For Restaurants</span>
                    </Link>
                  )}
                </motion.div>

                {/* Subtle Divider */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scaleX: 0 },
                    visible: {
                      opacity: 1,
                      scaleX: 1,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="flex justify-center w-full my-6 sm:my-8"
                >
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#f5efe6]/25 to-transparent" />
                </motion.div>

                {/* 3. Log in / Sign up (When User Is Logged Out) */}
                {!isAuthenticated && (
                  <>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                      className="w-full"
                    >
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="w-full block text-center py-3.5 px-6 rounded-full font-medium text-base sm:text-lg text-[#f5efe6] border border-[#f5efe6]/35 hover:bg-[#f5efe6]/10 active:scale-[0.99] transition-all"
                      >
                        Log in / Sign up
                      </Link>
                    </motion.div>
                    <div className="h-3.5 sm:h-4" />
                  </>
                )}

                {/* Book a Table (Primary CTA in signature red) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="w-full"
                >
                  <Link
                    to="/search"
                    onClick={() => setMobileOpen(false)}
                    className="w-full block text-center py-3.5 px-6 rounded-full font-medium text-base sm:text-lg text-white bg-primary hover:bg-primary/90 shadow-[0_8px_25px_rgba(225,29,72,0.4)] hover:shadow-[0_12px_28px_rgba(225,29,72,0.5)] active:scale-[0.99] transition-all"
                  >
                    Book a Table
                  </Link>
                </motion.div>
              </div>
            </motion.nav>

            {/* Bottom Bar: Anchored at bottom-left */}
            <div className="relative z-10 px-6 sm:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 min-h-[3.5rem] flex items-center justify-start">
              {isAuthenticated && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleLogout}
                  className="group flex items-center gap-2 text-sm font-medium text-[#f5efe6]/70 hover:text-white active:scale-95 transition-all py-1.5 focus:outline-none"
                >
                  <LogOut className="h-4 w-4 text-[#f5efe6]/60 group-hover:text-primary transition-colors" />
                  <span>Log out</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}

export { Navbar };
