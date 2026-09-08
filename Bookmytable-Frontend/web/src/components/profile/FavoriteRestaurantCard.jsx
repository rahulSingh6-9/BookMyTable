import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Trash2, Heart, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";

export function FavoriteRestaurantCard({ restaurant, index = 0, onRemove }) {
  const { location: userLocation } = useUserLocation();
  const id = restaurant._id || restaurant.restaurantId || restaurant.id;

  const getPriceRange = (costForTwo) => {
    if (!costForTwo) return "₹₹";
    if (costForTwo <= 500) return "₹";
    if (costForTwo <= 1500) return "₹₹";
    if (costForTwo <= 3000) return "₹₹₹";
    return "₹₹₹₹";
  };

  // Calculate dynamic distance
  let distanceInMeters = restaurant.distance || null;
  if (!distanceInMeters && userLocation && restaurant.location?.coordinates) {
    const [lng, lat] = restaurant.location.coordinates;
    distanceInMeters = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
  }

  let formattedDistance = null;
  if (distanceInMeters) {
    if (distanceInMeters < 1000) {
      formattedDistance = `${Math.round(distanceInMeters)} m`;
    } else {
      formattedDistance = `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden rounded-lg bg-card shadow-card transition-shadow duration-300 group-hover:shadow-elevated">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={restaurant.coverImage || restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove?.(restaurant);
            }}
            className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </button>
          <div className="absolute top-3 right-3">
            <Badge className="bg-card/90 text-foreground backdrop-blur-sm border-0 text-xs font-medium">
              {restaurant.priceRange || getPriceRange(restaurant.costForTwo)}
            </Badge>
          </div>
          {restaurant.isOpenNow && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                <Clock className="mr-1 h-3 w-3" />
                Available Now
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground truncate pr-2">{restaurant.name}</h3>
            <div className="flex items-center gap-1 text-sm shrink-0">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-medium text-card-foreground">{restaurant.averageRating?.toFixed(1) || restaurant.rating || "New"}</span>
              <span className="text-muted-foreground">({restaurant.totalReviews || restaurant.reviewCount || 0})</span>
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground truncate">
            {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : (restaurant.cuisine || "Multi-Cuisine")}
          </p>

          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1 truncate pr-2">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {restaurant.area || restaurant.city || restaurant.address?.area || restaurant.address?.city || restaurant.address}
                {(restaurant.area || restaurant.address?.area) && (restaurant.city || restaurant.address?.city) ? `, ${restaurant.city || restaurant.address.city}` : ""}
              </span>
            </div>
            {formattedDistance && (
              <span className="shrink-0 font-medium">
                {formattedDistance}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2">
              <Link to={`/book/${id}`}>Book now</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/restaurant/${restaurant.slug || restaurant.id}`}>View</Link>
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

