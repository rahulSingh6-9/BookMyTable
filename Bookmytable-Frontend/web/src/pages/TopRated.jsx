import { motion } from "framer-motion";
import { Star, Trophy, Award } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";

export default function TopRated() {
  // Sort by rating descending
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 8);

  return (
    <div className="container mx-auto py-12 px-4 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Top Rated Diners' Picks</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most loved restaurants in the community, verified by thousands of genuine reviews and bookings.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topRated.map((restaurant, i) => (
            <div key={restaurant.id} className="relative">
               <div className="absolute -top-3 -left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold shadow-lg border-2 border-background">
                 #{i + 1}
               </div>
               <RestaurantCard restaurant={restaurant} index={i} />
            </div>
          ))}
        </div>

        <div className="rounded-[2.5rem] bg-secondary/30 p-12 text-center">
           <Award className="mx-auto h-12 w-12 text-primary mb-4" />
           <h2 className="text-2xl font-bold text-foreground">Our Selection Criteria</h2>
           <p className="text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
             We compute our rankings based on average rating, total number of successful bookings, and recent customer feedback to ensure you always get the most current and reliable recommendations.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
