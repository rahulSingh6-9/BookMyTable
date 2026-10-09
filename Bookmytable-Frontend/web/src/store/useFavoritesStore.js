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

    // Guest users don't have remote favorites; avoid sending unauthenticated 401 requests
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      set({ favoriteIds: [], isInitialized: true });
      return;
    }

    try {
      const res = await getFavorites();
      let favsData = [];
      if (res.data && Array.isArray(res.data.data)) {
        favsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        favsData = res.data;
      }
      const ids = [];
      favsData.forEach((f) => {
        if (f._id) ids.push(String(f._id));
        if (f.restaurantId) ids.push(String(f.restaurantId));
        if (f.id) ids.push(String(f.id));
        if (f.discoveryId) ids.push(String(f.discoveryId));
      });
      set({ 
        favoriteIds: [...new Set(ids)],
        isInitialized: true
      });
    } catch (error) {
      console.error("Failed to load favorites", error);
      set({ isInitialized: true });
    }
  },

  reset: () => {
    set({ favoriteIds: [], pendingIds: [], isInitialized: false });
  },

  toggleFavorite: async (id, name = "Restaurant") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to save favorites");
      return;
    }

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
        const res = await apiAddFavorite(id);
        if (res?.data?.restaurantId) {
          const canonicalId = String(res.data.restaurantId);
          set({ favoriteIds: [...new Set([...get().favoriteIds, canonicalId])] });
        }
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
