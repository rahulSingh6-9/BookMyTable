import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroCinematicCanvas from "@/components/HeroCinematicCanvas";
import BookMyTableStorySection from "@/components/BookMyTableStorySection";

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

  const sections = response?.data?.data || [];
  const featuredRestaurants = sections
    .flatMap((s) => s.items || [])
    .filter(Boolean)
    .slice(0, 3);



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


    </div>
  );
}

export { Index as default };
