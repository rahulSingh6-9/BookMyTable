import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useEffect } from "react";
import { DemoRestaurantModal } from "@/components/common/DemoRestaurantModal";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";


function RestaurantCard({ restaurant, index = 0 }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();
  const { location: userLocation } = useUserLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const id = restaurant.restaurantId || restaurant._id || restaurant.id;
  const isLiked =
    favoriteIds.includes(id) ||
    (restaurant._id && favoriteIds.includes(String(restaurant._id))) ||
    (restaurant.restaurantId && favoriteIds.includes(String(restaurant.restaurantId)));

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, restaurant.name || restaurant.branchName);
  };

  const handleCardClick = (e) => {
    if (restaurant.isDemo) {
      e.preventDefault();
      e.stopPropagation();
      setIsDemoModalOpen(true);
    }
  };

  const getPriceRange = (costForTwo) => {
    if (!costForTwo) return "₹₹";
    if (costForTwo <= 500) return "₹";
    if (costForTwo <= 1500) return "₹₹";
    if (costForTwo <= 3000) return "₹₹₹";
    return "₹₹₹₹";
  };

  // Calculate dynamic distance if backend hasn't provided one
  let distanceInMeters = restaurant.distance || null;
  if (!distanceInMeters && userLocation && restaurant.location?.coordinates) {
    const [lng, lat] = restaurant.location.coordinates;
    distanceInMeters = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
  }

  let formattedDistance = null;
  if (distanceInMeters) {
    if (typeof distanceInMeters === "string") {
      formattedDistance = distanceInMeters;
    } else if (distanceInMeters < 1000) {
      formattedDistance = `${Math.round(distanceInMeters)} m`;
    } else {
      formattedDistance = `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="group w-full h-full flex flex-col"
      >
        <Link
          to={restaurant.isDemo ? "#" : `/restaurant/${restaurant.slug || restaurant.restaurantId || restaurant.id}`}
          onClick={handleCardClick}
          className="block w-full h-full flex-1 flex flex-col"
        >
          <div className="w-full h-full flex-1 flex flex-col overflow-hidden rounded-lg bg-card shadow-card transition-shadow duration-300 group-hover:shadow-elevated border border-border/40">
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
              <img
                src={restaurant.coverImage || restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"}
                alt={restaurant.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <button
                onClick={toggleLike}
                className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background z-10"
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} 
                />
              </button>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                {restaurant.isDemo && (
                  <Badge className="bg-amber-500 text-white font-extrabold border-0 text-[10px] tracking-wider uppercase shadow-sm">
                    DEMO
                  </Badge>
                )}
                <Badge className="bg-card/90 text-foreground backdrop-blur-sm border-0 text-xs font-medium">
                  {restaurant.priceRange || getPriceRange(restaurant.costForTwo)}
                </Badge>
              </div>
              {(restaurant.availableSlots?.length > 0 || restaurant.isOpenNow) && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Available Now
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-card-foreground truncate">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-medium text-card-foreground">{restaurant.averageRating?.toFixed ? restaurant.averageRating.toFixed(1) : restaurant.averageRating || restaurant.rating || "New"}</span>
                    <span className="text-muted-foreground">({restaurant.totalReviews || restaurant.reviewCount || 0})</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground truncate">
                  {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : (restaurant.cuisine || "Multi-Cuisine")}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-1 truncate min-w-0">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {restaurant.area || restaurant.city || restaurant.address?.area || restaurant.address?.city || restaurant.address}
                      {(restaurant.area || restaurant.address?.area) && (restaurant.city || restaurant.address?.city) ? `, ${restaurant.city || restaurant.address.city}` : ""}
                    </span>
                  </div>
                  {formattedDistance && (
                    <span className="shrink-0 font-medium text-primary">
                      {formattedDistance}
                    </span>
                  )}
                </div>

                {/* Available time slots */}
                <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                  {restaurant.availableSlots?.slice(0, 3).map((slot) => (
                    <span
                      key={slot}
                      onClick={(e) => {
                        if (restaurant.isDemo) {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDemoModalOpen(true);
                        }
                      }}
                      className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    >
                      {slot}
                    </span>
                  ))}
                  {restaurant.availableSlots?.length > 3 && (
                    <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      +{restaurant.availableSlots.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <DemoRestaurantModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        restaurantName={restaurant.name}
      />
    </>
  );
}
export {
  RestaurantCard
};
