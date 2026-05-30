import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  Heart,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ChefHat,
  HeartCrack
} from "lucide-react";
import { toast } from "sonner";

import { restaurants, cuisineFilters } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RestaurantCard } from "./CustomerHome";

export default function CustomerDiscover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse parameters from query string
  const urlSearch = searchParams.get("search") || "";
  const urlCuisine = searchParams.get("cuisine") || "All";

  // Filter States
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCuisine, setSelectedCuisine] = useState(urlCuisine);
  const [minRating, setMinRating] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Keep internal state aligned if URL query params change
  useEffect(() => {
    setSearchQuery(urlSearch);
    setSelectedCuisine(urlCuisine);
  }, [urlSearch, urlCuisine]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine("All");
    setMinRating(0);
    setSelectedPrice("All");
    setSortBy("rating-desc");
    setOnlyAvailable(false);
    setSearchParams({});
    toast.success("Filters cleared");
  };

  // Perform advanced filter logic
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        r =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    // Cuisine filter
    if (selectedCuisine && selectedCuisine !== "All") {
      result = result.filter(r => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase());
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(r => r.rating >= minRating);
    }

    // Price range filter
    if (selectedPrice && selectedPrice !== "All") {
      result = result.filter(r => r.priceRange === selectedPrice);
    }

    // Slots/Availability filter
    if (onlyAvailable) {
      result = result.filter(r => r.availableSlots && r.availableSlots.length > 0);
    }

    // Sorting
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "reviews-desc") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.priceRange.length - b.priceRange.length);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.priceRange.length - a.priceRange.length);
    }

    return result;
  }, [searchQuery, selectedCuisine, minRating, selectedPrice, onlyAvailable, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCuisine !== "All") count++;
    if (minRating > 0) count++;
    if (selectedPrice !== "All") count++;
    if (onlyAvailable) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedCuisine, minRating, selectedPrice, onlyAvailable, searchQuery]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      
      {/* 1. HEADER AND TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            Discover Restaurants
          </h1>
          <p className="text-xs md:text-sm text-slate-500">Find the perfect table for any dining mood or occasion</p>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm text-xs font-semibold text-slate-600">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>Filters Active: </span>
            <Badge variant="secondary" className="bg-primary/10 text-primary rounded-full h-5 w-5 p-0 flex items-center justify-center font-bold">
              {activeFiltersCount}
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR & QUICK FILTERS PANEL */}
      <Card className="shadow-sm border-slate-100 bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by restaurant name, cuisine keywords, or neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-200 rounded-xl focus-visible:ring-primary placeholder:text-slate-400 w-full"
              />
            </div>
            
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                SORT:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl px-3 outline-none cursor-pointer focus:border-primary transition"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="reviews-desc">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Cuisine horizontal scrolling selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />
              Selected Cuisine Category
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cuisineFilters.map((cuisine) => {
                const active = selectedCuisine.toLowerCase() === cuisine.toLowerCase();
                return (
                  <button
                    key={cuisine}
                    onClick={() => {
                      setSelectedCuisine(cuisine);
                      setSearchParams(prev => {
                        if (cuisine === "All") {
                          prev.delete("cuisine");
                        } else {
                          prev.set("cuisine", cuisine);
                        }
                        return prev;
                      });
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition flex-shrink-0 select-none ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cuisine}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. MULTI-FACET FILTER GRID */}
      <div className="grid gap-8 lg:grid-cols-4">
        
        {/* SIDEBAR FILTER PANEL */}
        <aside className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-fit">
          
          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Price Index</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {["All", "$", "$$", "$$$", "$$$$"].map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPrice(price)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    selectedPrice === price
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Scale Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Minimum Rating</h3>
            <div className="space-y-1.5">
              {[
                { label: "Any Rating", val: 0 },
                { label: "⭐ 4.7 & Above", val: 4.7 },
                { label: "⭐ 4.5 & Above", val: 4.5 },
                { label: "⭐ 4.0 & Above", val: 4.0 },
              ].map((option) => (
                <div
                  key={option.val}
                  onClick={() => setMinRating(option.val)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none text-xs ${
                    minRating === option.val
                      ? "bg-primary/5 border-primary/20 text-primary font-bold"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {minRating === option.val && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                </div>
              ))}
            </div>
          </div>

          {/* Live Slots Toggle */}
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Live Booking Slots
              </h3>
              <p className="text-[10px] text-slate-400">Only show tables with slots</p>
            </div>
            <Switch
              checked={onlyAvailable}
              onCheckedChange={setOnlyAvailable}
              className="data-[state=checked]:bg-primary"
            />
          </div>

        </aside>

        {/* RESTAURANTS RESULT GRID */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {filteredRestaurants.length > 0 ? (
              <motion.div 
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    onBook={() => navigate(`/book/${restaurant.id}`)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4"
              >
                <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                  <HeartCrack className="h-8 w-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-extrabold text-slate-900">No restaurants match your filters</h3>
                  <p className="text-xs text-slate-500">Try broadening your parameters, typing another query, or resetting all choices to explore catalog.</p>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
