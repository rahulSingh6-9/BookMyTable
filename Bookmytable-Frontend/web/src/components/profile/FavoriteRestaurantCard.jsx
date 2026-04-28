import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FavoriteRestaurantCard({ restaurant, index = 0, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden shadow-card transition-shadow duration-300 group-hover:shadow-elevated">
        <div className="relative h-44 overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-medium text-foreground">{restaurant.rating}</span>
            <span className="text-muted-foreground">({restaurant.reviewCount})</span>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-semibold text-card-foreground">{restaurant.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{restaurant.cuisine}</span>
                {restaurant.priceRange ? (
                  <Badge variant="secondary" className="h-5 px-2 text-[11px]">
                    {restaurant.priceRange}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2">
              <Link to={`/book/${restaurant.id}`}>Book now</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/restaurant/${restaurant.id}`}>View</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove?.(restaurant)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

