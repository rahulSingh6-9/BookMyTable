import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Modular Components
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { ReservationSection } from "@/components/restaurant/ReservationSection";
import { RestaurantReviews } from "@/components/restaurant/RestaurantReviews";
import { RestaurantDetails } from "@/components/restaurant/RestaurantDetails";
import { RestaurantSettings } from "@/components/restaurant/RestaurantSettings";
import { RestaurantMenuTabs } from "@/components/restaurant/RestaurantMenuTabs";

// Services
import { getRestaurantDetails, getRestaurantMenu } from "@/services/discovery.service";

export default function RestaurantDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Book a Table");

  // 1. Fetch Restaurant Details (Hero, Settings, Address)
  const { data: detailsRes, isLoading: detailsLoading, error: detailsErr } = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => getRestaurantDetails(slug),
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  const restaurant = detailsRes?.data?.data;

  // 2. Fetch Menu for the Menu Tab
  const { data: menuRes, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", slug],
    queryFn: () => getRestaurantMenu(slug),
    staleTime: 5 * 60 * 1000,
  });

  // Handle old ObjectId URL redirect
  useEffect(() => {
    if (restaurant && restaurant.slug && restaurant.slug !== slug) {
      navigate(`/restaurant/${restaurant.slug}`, { replace: true });
    }
  }, [restaurant, slug, navigate]);

  // Demo slug boundary guard
  useEffect(() => {
    if (slug && slug.startsWith("demo-")) {
      import("sonner").then(({ toast }) => {
        toast.info("Demo Restaurant — booking not available for demonstration entries.");
      });
      navigate("/discover", { replace: true });
    }
  }, [slug, navigate]);


  // Loading State
  if (detailsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading restaurant details...</p>
      </div>
    );
  }

  // Error State
  if (detailsErr || !detailsRes?.data?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Restaurant Not Found</h2>
        <p className="text-muted-foreground mb-6">The restaurant you are looking for does not exist or has been removed.</p>
        <Link to="/search">
          <Button variant="default">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const TABS = ["Book a Table", "Overview", "Review", "Menu"];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Hero Section */}
      <RestaurantHero restaurant={restaurant} />

      {/* 2. Sticky Tab Navigation */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-8 md:gap-16 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 px-2 text-sm md:text-lg font-bold whitespace-nowrap border-b-[3px] transition-all",
                    activeTab === tab 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Content Area */}
      <div className="container mx-auto px-4 lg:px-8 mt-6">
        <div className="max-w-5xl mx-auto min-h-[400px]">
          
          {activeTab === "Book a Table" && (
            <motion.div key="book" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ReservationSection restaurant={restaurant} />
            </motion.div>
          )}

          {activeTab === "Overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-12">
              <section>
                <RestaurantDetails restaurant={restaurant} />
              </section>
              <hr className="border-border" />
              <section>
                <RestaurantSettings settings={restaurant.settings} />
              </section>
            </motion.div>
          )}

          {activeTab === "Review" && (
            <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <RestaurantReviews restaurant={restaurant} />
            </motion.div>
          )}

          {activeTab === "Menu" && (
            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <RestaurantMenuTabs menuRes={menuRes} menuLoading={menuLoading} isViewOnly={true} />
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
