import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeartCrack } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { FavoriteRestaurantCard } from "@/components/profile/FavoriteRestaurantCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { restaurants } from "@/lib/data";

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
  const [favoriteIds, setFavoriteIds] = useState(() => restaurants.slice(0, 6).map((r) => r.id));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const favorites = useMemo(
    () => restaurants.filter((r) => favoriteIds.includes(r.id)),
    [favoriteIds]
  );

  const handleRemove = (restaurant) => {
    setFavoriteIds((prev) => prev.filter((id) => id !== restaurant.id));
    toast.success("Removed from favorites");
  };

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
        ) : favorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((r, i) => (
              <FavoriteRestaurantCard key={r.id} restaurant={r} index={i} onRemove={handleRemove} />
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

