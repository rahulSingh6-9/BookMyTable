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
  //   2. BookMyTableStorySection (starts at 600vh, natural document flow, independent animation)
  //   3. TRANSITION:
  //      - 0 to 60vh: BookMyTableStorySection pins at "top top" for full viewing & hold.
  //        Content and primary red stroke complete naturally; Table3DSection is held off-screen below.
  //      - 60vh to 160vh: Table3DSection (zIndex: 20, marginTop: -100vh) physically rises upward
  //        from below the viewport, cleanly covering/overlapping the pinned Story section underneath.
  //   4. Cinematic3DTable: When Table3D reaches top of viewport (160vh), Story pin releases,
  //      and Table3DSection's own ScrollTrigger (start: "top top") takes over seamlessly.
  //
  useEffect(() => {
    const storyEl = storyWrapperRef.current;
    if (!storyEl) return;

    // Pin BookMyTableStorySection from "top top" for 160vh of scroll distance.
    // pinSpacing: true — GSAP inserts a spacer div to keep the document flow
    // intact so that Table3DSection (which follows in the DOM) stays at its
    // correct position relative to the viewport during the pin.
    const transitionST = ScrollTrigger.create({
      trigger: storyEl,
      start: "top top",
      end: "+=160%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      transitionST.kill();
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [featuredRestaurants]);

  return (
    <div className="min-h-screen">
      {/*
        1. HERO — z-index: 1
        GSAP (inside HeroCinematicCanvas) pins this element for the
        scroll range 0 → 500vh, creating a 600vh pin spacer in the doc flow.
        During the pin, the section is position:fixed at the top.
        After the pin, it restores to position:relative at its natural doc position.
      */}
      <section
        ref={heroRef}
        data-hero
        className="relative overflow-hidden w-full"
        style={{ height: "100vh", zIndex: 1 }}
      >
        <HeroCinematicCanvas triggerRef={heroRef} restaurants={featuredRestaurants} />
      </section>

      {/*
        2. BOOKMYTABLE EDITORIAL STORY SECTION — Independent section
        In natural document flow immediately after HeroCinematicCanvas.
        Has its own independent ScrollTrigger animation (blur reveal & primary red stroke).
        Pins at 'top top' for a 60vh viewing hold, then acts as the base layer
        underneath the rising Table3DSection.
      */}
      <section ref={storyWrapperRef} className="relative z-10 w-full min-h-screen">
        <BookMyTableStorySection />
      </section>

      {/*
        3. CINEMATIC 3D TABLE SECTION
        Physically rises upward from below to overlap and cover BookMyTableStorySection
        (marginTop: -100vh). When Table3D reaches the top of the viewport (top top),
        the Story pin releases, and Table3D's own internal ScrollTrigger takes over seamlessly.
      */}
      <section
        ref={table3dWrapperRef}
        className="relative z-20 shadow-[0_-30px_70px_rgba(0,0,0,0.7)]"
        style={{ marginTop: "-100vh", marginBottom: "-100vh", willChange: "transform" }}
      >
        <Table3DSection />
      </section>
    </div>
  );
}

export { Index as default };
