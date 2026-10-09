import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Loader2,
  MapPinOff,
  RotateCcw,
  WifiOff,
  Search,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getNearbyRestaurants } from "@/services/discovery.service";
import { dummyRestaurants } from "@/lib/dummyRestaurants";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DEFAULT_NEARBY_RADIUS = 10000; // 10 km in meters

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "50 km", value: 50000 },
];

const CUISINE_FILTERS = [
  "All",
  "Indian",
  "Chinese",
  "Italian",
  "Fast Food",
  "North Indian",
  "Mughlai",
  "Continental",
  "Thai",
  "Mexican",
];

const SORT_OPTIONS = [
  { label: "Nearest First", value: "nearest" },
  { label: "Highest Rated", value: "rating" },
];

// ─────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────
function RestaurantCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card shadow-card w-full h-full flex flex-col border border-border/40">
      <Skeleton className="h-48 w-full shrink-0" />
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-28" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-12 rounded-sm" />
          <Skeleton className="h-5 w-14 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOCATION DENIED STATE
// ─────────────────────────────────────────────────────────────
function LocationDeniedState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <MapPinOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Location Access Required
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        To find restaurants near you, we need access to your location.
        Please allow location access in your browser and try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRetry} className="rounded-full gap-2 px-6">
          <Navigation className="h-4 w-4" />
          Allow Location
        </Button>
        <Button variant="outline" asChild className="rounded-full px-6">
          <Link to="/discover">Browse All Restaurants</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOCATION ERROR STATE
// ─────────────────────────────────────────────────────────────
function LocationErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Could Not Detect Location
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {message || "We could not determine your current location. Please try again."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRetry} className="rounded-full gap-2 px-6">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild className="rounded-full px-6">
          <Link to="/discover">Browse All Restaurants</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOCATING STATE
// ─────────────────────────────────────────────────────────────
function LocatingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-background rounded-full flex items-center justify-center shadow-sm">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </span>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Detecting your location...
      </h2>
      <p className="text-muted-foreground text-sm">
        Finding restaurants near you
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY RESULTS STATE
// ─────────────────────────────────────────────────────────────
function EmptyState({ radius, onIncreaseRadius }) {
  const radiusKm = Math.round(radius / 1000);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-border/50 py-16 text-center bg-card shadow-inner"
    >
      <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold text-foreground">
        No restaurants found nearby
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
        No BookMyTable restaurants found within {radiusKm} km of your location.
        Try increasing the search radius or explore other areas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {radius < 50000 && (
          <Button
            onClick={onIncreaseRadius}
            variant="outline"
            className="rounded-full px-8"
          >
            Increase Search Radius
          </Button>
        )}
        <Button variant="outline" asChild className="rounded-full px-8">
          <Link to="/discover">Explore Other Cities</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// API ERROR STATE
// ─────────────────────────────────────────────────────────────
function ApiErrorState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-destructive/20 bg-destructive/5 py-16 text-center"
    >
      <WifiOff className="mx-auto h-12 w-12 text-destructive/40 mb-4" />
      <h3 className="text-xl font-bold text-foreground">
        Couldn't load nearby restaurants
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
        Something went wrong while fetching restaurants. Please check your
        connection and try again.
      </p>
      <Button onClick={onRetry} className="rounded-full px-8">
        <RotateCcw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN NEAR ME PAGE
// ─────────────────────────────────────────────────────────────
export default function NearMe() {
  const { location, status, isLocating, error, requestLocation } = useUserLocation();

  const [radius, setRadius] = useState(DEFAULT_NEARBY_RADIUS);
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [sort, setSort] = useState("nearest");

  // Round coordinates to 3 decimal places (~110m) to stabilize query keys
  const lat = location ? Math.round(location.lat * 1000) / 1000 : null;
  const lng = location ? Math.round(location.lng * 1000) / 1000 : null;

  const {
    data: nearbyRes,
    isLoading: restaurantsLoading,
    isError: restaurantsError,
    refetch: refetchRestaurants,
  } = useQuery({
    queryKey: ["nearby-restaurants", lat, lng, radius, activeCuisine, sort],
    queryFn: () =>
      getNearbyRestaurants({
        lat,
        lng,
        radius,
        limit: 20,
        cuisine: activeCuisine !== "All" ? activeCuisine : undefined,
        sort,
      }),
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  const realRestaurants = nearbyRes?.data?.data || [];
  // Pad real results with demo restaurants so the page is never empty
  const restaurants = realRestaurants.length >= 8
    ? realRestaurants
    : [...realRestaurants, ...dummyRestaurants.slice(0, Math.max(8, 16 - realRestaurants.length))];
  const resultCount = nearbyRes?.data?.count ?? realRestaurants.length;

  const handleRefreshLocation = useCallback(() => {
    requestLocation(true);
  }, [requestLocation]);

  const handleIncreaseRadius = useCallback(() => {
    const current = RADIUS_OPTIONS.findIndex((r) => r.value === radius);
    if (current < RADIUS_OPTIONS.length - 1) {
      setRadius(RADIUS_OPTIONS[current + 1].value);
    }
  }, [radius]);

  // ── Render states ──────────────────────────────────────────

  if (status === "idle" || isLocating) {
    return (
      <div className="container mx-auto py-12 px-4 lg:px-8">
        <LocatingState />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="container mx-auto py-12 px-4 lg:px-8">
        <LocationDeniedState onRetry={() => requestLocation(true)} />
      </div>
    );
  }

  if (status === "unavailable" || status === "timeout" || status === "unsupported") {
    return (
      <div className="container mx-auto py-12 px-4 lg:px-8">
        <LocationErrorState message={error} onRetry={() => requestLocation(true)} />
      </div>
    );
  }

  // Location is granted — render the full discovery UI
  return (
    <div className="container mx-auto py-12 px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
              <Navigation className="h-4 w-4" />
              Current Location Detected
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Restaurants Near You
            </h1>
            {!restaurantsLoading && status === "granted" && (
              <p className="text-muted-foreground">
                {resultCount > 0
                  ? `${resultCount} restaurant${resultCount !== 1 ? "s" : ""} found within ${Math.round(radius / 1000)} km`
                  : `Searching within ${Math.round(radius / 1000)} km of your location`}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="rounded-full gap-2 shrink-0"
            onClick={handleRefreshLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Refresh Location
          </Button>
        </div>

        {/* ── Filters: Radius ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground font-medium mr-1">
              Radius:
            </span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRadius(opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                  radius === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ── Filters: Cuisine + Sort ── */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground font-medium mr-1">
                Cuisine:
              </span>
              {CUISINE_FILTERS.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCuisine(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                    activeCuisine === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm bg-background border border-border rounded-full px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-primary text-foreground"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Loading Skeletons ── */}
        <AnimatePresence mode="wait">
          {restaurantsLoading && (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </motion.div>
          )}

          {/* ── API Error ── */}
          {!restaurantsLoading && restaurantsError && (
            <motion.div key="api-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ApiErrorState onRetry={refetchRestaurants} />
            </motion.div>
          )}

          {/* ── Empty State ── */}
          {!restaurantsLoading && !restaurantsError && restaurants.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState radius={radius} onIncreaseRadius={handleIncreaseRadius} />
            </motion.div>
          )}

          {/* ── Results Grid ── */}
          {!restaurantsLoading && !restaurantsError && restaurants.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {restaurants.map((restaurant, i) => (
                <RestaurantCard
                  key={restaurant._id || restaurant.restaurantId || restaurant.slug}
                  restaurant={{
                    ...restaurant,
                    id: restaurant.restaurantId || restaurant._id,
                    restaurantId: restaurant.restaurantId,
                    name: restaurant.name,
                    slug: restaurant.slug,
                    coverImage: restaurant.coverImage,
                    cuisines: restaurant.cuisines || [],
                    averageRating: restaurant.averageRating,
                    totalReviews: restaurant.totalReviews,
                    area: restaurant.area,
                    city: restaurant.city,
                    costForTwo: restaurant.costForTwo,
                    distance: restaurant.distanceMeters,
                  }}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Explore More CTA ── */}
        {!restaurantsLoading && !restaurantsError && restaurants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 py-12 text-center bg-card"
          >
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">
              Looking for more?
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              Increase the search radius or browse restaurants across all cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {radius < 50000 && (
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={handleIncreaseRadius}
                >
                  Increase Radius
                </Button>
              )}
              <Button variant="outline" asChild className="rounded-full px-8">
                <Link to="/discover">Explore All Cities</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
