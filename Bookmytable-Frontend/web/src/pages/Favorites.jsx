import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";
import { EmptyState } from "@/components/common/EmptyState";

export default function Favorites() {
  const favorites = restaurants.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Favorites</h1>
          <p className="mb-6 text-muted-foreground">Your saved restaurants</p>

          {favorites.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
            </div>
          ) : (
            <EmptyState icon={Heart} title="No favorites yet" description="Save restaurants you love to find them quickly later." actionLabel="Discover Restaurants" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
