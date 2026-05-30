import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Star, HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { getFavorites } from "@/services/user.service";

export default function CustomerFavorites() {
  const navigate = useNavigate();
  const [fullFavorites, setFullFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        setLoading(true);
        const res = await getFavorites();
        if (res.data && Array.isArray(res.data.data)) {
          setFullFavorites(res.data.data);
        } else if (Array.isArray(res.data)) {
          setFullFavorites(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch full favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  // Filter full favorites based on store (enables optimistic removal)
  const renderFavorites = fullFavorites.filter((r) => favoriteIds.includes(r._id || r.id || r.restaurantId));

  const handleRemoveRestaurant = (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, name);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          My Favorites
        </h1>
        <p className="text-xs md:text-sm text-slate-500">Your curated collection of fine dining restaurants</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             <p className="text-muted-foreground">Loading your favorite restaurants...</p>
          </div>
        ) : renderFavorites.length > 0 ? (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderFavorites.map((r) => (
              <div key={r._id || r.id} className="relative group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                <Link to={`/restaurant/${r._id || r.id || r.restaurantId}`} className="block relative aspect-[4/3] overflow-hidden">
                  <img src={r.coverImage || r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-102 transition duration-300" />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveRestaurant(r._id || r.id || r.restaurantId, r.name, e)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm hover:scale-110 transition z-10"
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </button>

                  <div className="absolute top-3 left-3 bg-black/60 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase">
                    {Array.isArray(r.cuisines) ? r.cuisines[0] : (r.cuisine || "Cuisine")}
                  </div>
                </Link>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 truncate text-sm md:text-base">{r.name}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {r.address?.area || r.area || r.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-50">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {r.averageRating?.toFixed(1) || r.rating || "New"}
                    </span>
                    <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl h-8 text-[11px] font-bold" onClick={() => navigate(`/book/${r._id || r.id || r.restaurantId}`)}>
                      Book Table
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={HeartCrack}
            title="No favorite restaurants"
            description="Browse through fine dining spots and add them to quickly book next time."
            actionLabel="Explore catalog"
            onAction={() => navigate("/discover")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
