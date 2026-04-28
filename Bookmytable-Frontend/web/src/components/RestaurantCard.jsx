import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function RestaurantCard({ restaurant, index = 0 }) {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = (e) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success(`${restaurant.name} added to favorites!`);
    }
  };

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4 }}
    className="group"
  >
      <Link to={`/restaurant/${restaurant.id}`}>
        <div className="overflow-hidden rounded-lg bg-card shadow-card transition-shadow duration-300 group-hover:shadow-elevated">
          {
    /* Image */
  }
          <div className="relative h-48 overflow-hidden">
            <img
    src={restaurant.image}
    alt={restaurant.name}
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    loading="lazy"
  />
            <button
              onClick={toggleLike}
              className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} 
              />
            </button>
            <div className="absolute top-3 right-3">
              <Badge className="bg-card/90 text-foreground backdrop-blur-sm border-0 text-xs font-medium">
                {restaurant.priceRange}
              </Badge>
            </div>
            {restaurant.availableSlots.length > 0 && <div className="absolute bottom-3 left-3">
                <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  Available Now
                </Badge>
              </div>}
          </div>

          {
    /* Content */
  }
          <div className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold text-card-foreground">{restaurant.name}</h3>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-medium text-card-foreground">{restaurant.rating}</span>
                <span className="text-muted-foreground">({restaurant.reviewCount})</span>
              </div>
            </div>

            <p className="mb-3 text-sm text-muted-foreground">{restaurant.cuisine}</p>

            <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{restaurant.distance}</span>
              <span className="mx-1">·</span>
              <span>{restaurant.address}</span>
            </div>

            {
    /* Available time slots */
  }
            <div className="flex flex-wrap gap-1.5">
              {restaurant.availableSlots.slice(0, 3).map((slot) => <span
    key={slot}
    className="rounded-sm bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
  >
                  {slot}
                </span>)}
              {restaurant.availableSlots.length > 3 && <span className="rounded-sm bg-secondary px-2 py-1 text-xs text-muted-foreground">
                  +{restaurant.availableSlots.length - 3} more
                </span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>;
}
export {
  RestaurantCard
};
