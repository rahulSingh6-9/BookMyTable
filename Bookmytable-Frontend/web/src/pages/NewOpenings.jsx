import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";
import { dummyRestaurants } from "@/lib/dummyRestaurants";

export default function NewOpenings() {
  // Use last few real restaurants + demo entries as "new openings"
  const realNew = restaurants.slice(-6).reverse();
  const demoNew = dummyRestaurants.slice(20, 36); // pick from later entries to give variety
  const newOpenings = [...realNew, ...demoNew].slice(0, 20);

  return (
    <div className="container mx-auto py-12 px-4 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary">Just Arrived</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">New Openings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Be the first to experience the freshest dining concepts. From trendy cafes to fine-dining debuts.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newOpenings.map((restaurant, i) => (
            <div key={restaurant.restaurantId || restaurant._id || restaurant.id} className="group relative">
               <div className="absolute top-2 right-2 z-10 flex h-6 w-16 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-tighter shadow-sm animate-pulse">
                 New
               </div>
               <RestaurantCard restaurant={restaurant} index={i} />
            </div>
          ))}
        </div>

        <section className="rounded-[2rem] bg-card border border-border p-8 lg:p-12">
           <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                 <h2 className="text-3xl font-bold text-foreground leading-tight">Opening a new restaurant soon?</h2>
                 <p className="text-muted-foreground text-lg leading-relaxed">
                   Get your restaurant listed on BookMyTable before your grand opening and start taking reservations from day one. Build anticipation and fill your tables from the moment you open your doors.
                 </p>
                 <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="rounded-full px-8">Partner With Us</Button>
                    <Button variant="outline" size="lg" className="rounded-full px-8">Learn More</Button>
                 </div>
              </div>
              <div className="flex-1 w-full max-w-sm">
                 <div className="aspect-square rounded-3xl bg-secondary/30 flex items-center justify-center p-8 text-center text-primary/40">
                    <Sparkles className="h-24 w-24" />
                 </div>
              </div>
           </div>
        </section>
      </motion.div>
    </div>
  );
}

// Simple Badge component
function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
