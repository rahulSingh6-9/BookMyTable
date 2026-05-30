import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Modular Components
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { BookingSidebar } from "@/components/restaurant/BookingSidebar";
import { RestaurantMenuTabs } from "@/components/restaurant/RestaurantMenuTabs";
import { RestaurantReviews } from "@/components/restaurant/RestaurantReviews";
import { RestaurantDetails } from "@/components/restaurant/RestaurantDetails";
import { RestaurantSettings } from "@/components/restaurant/RestaurantSettings";

// Services
import { getRestaurantDetails, getRestaurantMenu } from "@/services/discovery.service";

export default function RestaurantDetail() {
  const { id } = useParams();

  // 1. Fetch Restaurant Details (Hero, Settings, Address)
  const { data: detailsRes, isLoading: detailsLoading, error: detailsErr } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurantDetails(id),
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  // 2. Fetch Menu Data (Lazy/Parallel)
  const { data: menuRes, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", id],
    queryFn: () => getRestaurantMenu(id),
    staleTime: 5 * 60 * 1000,
  });

  // Loading State
  if (detailsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading restaurant details...</p>
      </div>
    );
  }

  // Error State
  if (detailsErr || !detailsRes?.data?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-background px-4 text-center">
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

  const restaurant = detailsRes.data.data;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Hero Section */}
      <RestaurantHero restaurant={restaurant} />

      <div className="container mx-auto px-4 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 relative items-start">
          
          {/* Main Content (Left Side - 2/3 width) */}
          <div className="lg:col-span-2 space-y-12">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* 3. Menu Section */}
              <section id="menu" className="scroll-mt-24">
                <RestaurantMenuTabs menuRes={menuRes} menuLoading={menuLoading} />
              </section>

              <hr className="border-border" />

              {/* 4. Reviews & Ratings Section */}
              <section id="reviews" className="scroll-mt-24">
                <RestaurantReviews restaurant={restaurant} />
              </section>

              <hr className="border-border" />

              {/* 5. Address & Maps Section */}
              <section id="location" className="scroll-mt-24">
                <RestaurantDetails restaurant={restaurant} />
              </section>

              <hr className="border-border" />

              {/* 6. Settings & Operational Info Section */}
              <section id="policies" className="scroll-mt-24">
                <RestaurantSettings settings={restaurant.settings} />
              </section>

            </motion.div>
          </div>

          {/* 2. Booking Sidebar (Right Side - 1/3 width, Sticky) */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <BookingSidebar restaurant={restaurant} />
          </div>

        </div>
      </div>
    </div>
  );
}
