import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroCinematicCanvas from "@/components/HeroCinematicCanvas";
import BookMyTableStorySection from "@/components/BookMyTableStorySection";
import Table3DSection from "@/components/Table3DSection";
import { useLocationStore } from "@/store/useLocationStore";
import { getHomepageSections } from "@/services/discovery.service";

gsap.registerPlugin(ScrollTrigger);

function Index() {
  const { location, autoDetectLocation } = useLocationStore();

  useEffect(() => {
    if (!location.isAutoDetected && !location.lat) {
      autoDetectLocation();
    }
  }, [location, autoDetectLocation]);

  const { data: response } = useQuery({
    queryKey: ["homepage-sections", location.city, location.area, location.lat, location.lng],
    queryFn: () =>
      getHomepageSections({
        city: location.city,
        area: location.area,
        lat: location.lat,
        lng: location.lng,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const heroRef = useRef(null);
  const storyWrapperRef = useRef(null);
  const table3dWrapperRef = useRef(null);

  const sections = response?.data?.data || [];
  const featuredRestaurants = sections
    .flatMap((s) => s.items || [])
    .filter(Boolean)
    .slice(0, 3);

  // ─── Scroll-over transition: BookMyTableStorySection → Cinematic3DTable ───
  //
  // SEQUENCE:
  //   1. HeroCinematicCanvas (pinned 0 → 500vh, pin spacer 600vh total)
  //   2. BookMyTableStorySection (starts at 600vh, natural document flow)
  //   3. TRANSITION:
  //      - storyEl pins at "top top" for 100vh with pinSpacing: false.
  //      - Table3DSection (zIndex: 20) naturally scrolls upward from below to overlap
  //        and cover storyEl completely.
  //   4. Cinematic3DTable: When Table3D reaches top of viewport (700vh total scroll),
  //      storyEl pin releases, and Table3DSection's own ScrollTrigger takes over seamlessly.
  //
  useEffect(() => {
    const storyEl = storyWrapperRef.current;
    if (!storyEl) return;

    const transitionST = ScrollTrigger.create({
      trigger: storyEl,
      start: "top top",
      end: "+=100%",
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      transitionST.kill();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. HERO */}
      <section
        ref={heroRef}
        data-hero
        className="relative overflow-hidden w-full"
        style={{ height: "100vh", zIndex: 1 }}
      >
        <HeroCinematicCanvas triggerRef={heroRef} restaurants={featuredRestaurants} />
      </section>

      {/* 2. BOOKMYTABLE EDITORIAL STORY SECTION */}
      <section ref={storyWrapperRef} className="relative z-10 w-full min-h-screen">
        <BookMyTableStorySection />
      </section>

      {/* 3. CINEMATIC 3D TABLE SECTION */}
      {/*
      <section
        ref={table3dWrapperRef}
        className="relative z-20 shadow-[0_-30px_70px_rgba(0,0,0,0.7)]"
      >
        <Table3DSection />
      </section>
      */}
    </div>
  );
}

export { Index as default };
