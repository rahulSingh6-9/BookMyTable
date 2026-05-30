import { create } from "zustand";
import { toast } from "sonner";
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "@/services/user.service";

export const useFavoritesStore = create((set, get) => ({
  favoriteIds: [],
  pendingIds: [],
  isInitialized: false,

  initialize: async () => {
    // Only initialize once to avoid redundant API calls
    if (get().isInitialized) return;
    try {
      const res = await getFavorites();
      let favsData = [];
      if (res.data && Array.isArray(res.data.data)) {
        favsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        favsData = res.data;
      }
      set({ 
        favoriteIds: favsData.map((f) => f._id || f.id || f.restaurantId),
        isInitialized: true
      });
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  },

  toggleFavorite: async (id, name = "Restaurant") => {
    if (get().pendingIds.includes(id)) return;
    
    set({ pendingIds: [...get().pendingIds, id] });
    const isFav = get().favoriteIds.includes(id);

    if (isFav) {
      // Optimistic remove
      set({ favoriteIds: get().favoriteIds.filter((fId) => fId !== id) });
      try {
        await apiRemoveFavorite(id);
        toast.success(`Removed ${name} from favorites`);
      } catch (err) {
        // Rollback
        set({ favoriteIds: [...get().favoriteIds, id] });
        toast.error("Failed to remove favorite");
      }
    } else {
      // Optimistic add
      set({ favoriteIds: [...get().favoriteIds, id] });
      try {
        await apiAddFavorite(id);
        toast.success(`Added ${name} to favorites`);
      } catch (err) {
        // Rollback
        set({ favoriteIds: get().favoriteIds.filter((fId) => fId !== id) });
        toast.error("Failed to add favorite");
      }
    }
    
    set({ pendingIds: get().pendingIds.filter((pId) => pId !== id) });
  }
}));
