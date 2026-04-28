import { motion } from "framer-motion";
import { MapPin, Navigation, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";

export default function NearMe() {
  // Mock data/filtering logic
  const nearbyRestaurants = restaurants.slice(0, 4);

  return (
    <div className="container mx-auto py-12 px-4 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
               <Navigation className="h-4 w-4" />
               Current Location Detected
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Restaurants Near You</h1>
             <p className="text-muted-foreground">Discover the best dining spots in your immediate vicinity.</p>
          </div>
          <Button variant="outline" className="rounded-full gap-2 shrink-0">
            <MapIcon className="h-4 w-4" /> View Map
          </Button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nearbyRestaurants.map((restaurant, i) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
          ))}
        </div>

        <div className="rounded-2xl border-2 border-dashed border-border/50 py-16 text-center bg-card shadow-inner">
           <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
           <h3 className="text-xl font-bold text-foreground">Want to see more?</h3>
           <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
             Adjust your location settings to find even more amazing restaurants in your area.
           </p>
           <Button variant="outline" className="rounded-full px-8">Change Location</Button>
        </div>
      </motion.div>
    </div>
  );
}
