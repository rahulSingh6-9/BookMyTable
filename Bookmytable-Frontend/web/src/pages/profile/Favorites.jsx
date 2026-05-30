import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeartCrack } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { FavoriteRestaurantCard } from "@/components/profile/FavoriteRestaurantCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavorites } from "@/services/user.service";
import { useFavoritesStore } from "@/store/useFavoritesStore";

function FavoriteCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileFavorites() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      // Ensure the response is an array before setting state
      if (res.data && Array.isArray(res.data.data)) {
        setFavorites(res.data.data);
      } else if (Array.isArray(res.data)) {
        setFavorites(res.data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      toast.error("Failed to load your favorite restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (restaurant) => {
    const resId = restaurant.restaurantId || restaurant._id || restaurant.id;
    toggleFavorite(resId, restaurant.name);
  };

  const renderFavorites = favorites.filter((r) => favoriteIds.includes(r.restaurantId || r._id || r.id));

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
          <p className="text-muted-foreground">Your saved restaurants</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FavoriteCardSkeleton key={i} />
            ))}
          </div>
        ) : renderFavorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderFavorites.map((r, i) => (
              <FavoriteRestaurantCard key={r._id || r.id} restaurant={r} index={i} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HeartCrack}
            title="No favorites yet"
            description="Save restaurants you love to find them quickly later."
            actionLabel="Discover restaurants"
            onAction={() => navigate("/discover")}
          />
        )}
      </motion.div>
    </div>
  );
}

