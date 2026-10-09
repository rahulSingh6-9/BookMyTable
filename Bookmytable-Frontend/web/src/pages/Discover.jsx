import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/search/SearchBar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLocationStore } from "@/store/useLocationStore";
import { getHomepageSections, searchRestaurants, getCities } from "@/services/discovery.service";
import { DiscoverCinematicHero } from "@/components/discover/DiscoverCinematicHero";
import { DiscoverCinematicStory } from "@/components/discover/DiscoverCinematicStory";
import { dummyRestaurants } from "@/lib/dummyRestaurants";

// Static cuisine filters since there's no dedicated /cuisines API
const CUISINE_FILTERS = [
  "All", "Italian", "Chinese", "Mexican", "Indian", "Thai", "Japanese", "American", "Mediterranean", "Desserts", "Fast Food"
];

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract initial state from URL or default
  const urlSearch = searchParams.get("q") || "";
  const urlCollection = searchParams.get("collection") || "";

  const [search, setSearch] = useState(urlSearch);
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  
  // Advanced filters
  const [priceFilters, setPriceFilters] = useState([]); // Currently mocked UI, backend doesn't support $ filtering yet, but we keep the UI
  const [minRating, setMinRating] = useState(0); // Backend supports sorting, not filtering by rating yet, but we keep the UI
  const [openLocation, setOpenLocation] = useState(false);

  // Sync search state with URL if needed
  useEffect(() => {
    if (urlSearch && search === "") {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  const { location, autoDetectLocation } = useLocationStore();

  useEffect(() => {
    if (!location.isAutoDetected && !location.lat) {
      autoDetectLocation();
    }
  }, [location, autoDetectLocation]);

  const togglePriceFilter = (price) => {
    setPriceFilters(prev => 
      prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
    );
  };

  // 1. Fetch distinct cities
  const { data: citiesRes } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  const cities = citiesRes?.data?.data || [];

  // Determine if we should show Homepage Sections OR Search Results
  // We show search results if any filter is active (search text, cuisine, or specific city selected)
  // Collection from URL is treated as a search filter temporarily or we just let it fall back
  const isSearchActive = Boolean(search.trim().length > 0 || activeCuisine !== "All" || selectedCity !== "All" || urlCollection);

  // 2. Fetch Homepage Sections (Default view)
  const { data: sectionsRes, isLoading: sectionsLoading } = useQuery({
    queryKey: ["homepage-sections", location.city, location.area, location.lat, location.lng],
    queryFn: () => getHomepageSections({ city: location.city, area: location.area, lat: location.lat, lng: location.lng }),
    enabled: !isSearchActive,
    staleTime: 5 * 60 * 1000,
  });
  const sections = sectionsRes?.data?.data || [];

  // 3. Fetch Search Results (Active view)
  const { data: searchRes, isLoading: searchLoading } = useQuery({
    queryKey: ["search", search, activeCuisine, selectedCity, location.lat, location.lng],
    queryFn: () => {
      const params = {};
      if (search.trim()) params.q = search;
      if (activeCuisine !== "All") params.cuisine = activeCuisine;
      if (selectedCity !== "All") params.city = selectedCity;
      
      // If searching, we might want to sort by distance if they haven't explicitly typed a city
      if (location.lat && location.lng && selectedCity === "All" && !search.trim()) {
        params.lat = location.lat;
        params.lng = location.lng;
      }
      
      return searchRestaurants(params);
    },
    enabled: isSearchActive,
  });
  const searchResults = searchRes?.data?.data?.results || [];

  // We can filter searchResults locally by rating/price to fulfill UI requirements since backend doesn't support it yet
  const filteredSearchResults = searchResults.filter(r => r.averageRating >= minRating);

  // Pad search results with demo restaurants when real results are few
  const augmentedSearchResults = (() => {
    if (!isSearchActive) return [];
    // Filter demo restaurants to match active filters
    let demoFiltered = dummyRestaurants;
    if (search.trim()) {
      const q = search.toLowerCase();
      demoFiltered = demoFiltered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.cuisine || "").toLowerCase().includes(q) ||
        (Array.isArray(r.cuisines) && r.cuisines.some(c => c.toLowerCase().includes(q))) ||
        (r.city || "").toLowerCase().includes(q)
      );
    }
    if (activeCuisine !== "All") {
      const q = activeCuisine.toLowerCase();
      demoFiltered = demoFiltered.filter(r =>
        (r.cuisine || "").toLowerCase() === q ||
        (Array.isArray(r.cuisines) && r.cuisines.some(c => c.toLowerCase() === q))
      );
    }
    if (selectedCity !== "All") {
      demoFiltered = demoFiltered.filter(r => (r.city || "").toLowerCase() === selectedCity.toLowerCase());
    }
    demoFiltered = demoFiltered.filter(r => (r.averageRating || r.rating || 0) >= minRating);
    // Combine: real first, then demo
    const realIds = new Set(filteredSearchResults.map(r => r.restaurantId || r._id));
    return [...filteredSearchResults, ...demoFiltered.slice(0, Math.max(12, 24 - filteredSearchResults.length))];
  })();

  // Pad each homepage section with demo restaurants
  const augmentedSections = sections.map(section => ({
    ...section,
    items: (() => {
      const real = section.items || [];
      const usedDemoIds = new Set();
      const demo = dummyRestaurants.filter(d => {
        if (usedDemoIds.has(d.id)) return false;
        usedDemoIds.add(d.id);
        return true;
      }).slice(0, Math.max(6, 12 - real.length));
      return [...real, ...demo];
    })()
  }));

  // If no real sections yet and data is loaded, create a fallback "Featured" section from demo data
  const displaySections = augmentedSections.length > 0
    ? augmentedSections
    : (sectionsLoading ? [] : [{
        id: "demo-featured",
        title: "Featured Restaurants",
        description: "Discover top dining experiences near you",
        items: dummyRestaurants.slice(0, 12)
      }]);

  return (
    <div className="min-h-screen">
      {/* 🌟 Full-Screen Edge-to-Edge Cinematic Hero */}
      <DiscoverCinematicHero />

      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            Find Restaurants
          </motion.h1>

          <div className="mb-6 flex gap-3">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Search restaurants, cuisines, or locations..." />
            </div>
            
            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-8 py-8">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Price Range</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {["$", "$$", "$$$", "$$$$"].map((price) => (
                        <div key={price} className="flex items-center space-x-2 opacity-50 cursor-not-allowed" title="Coming soon">
                          <Checkbox 
                            id={`price-${price}`} 
                            checked={priceFilters.includes(price)}
                            onCheckedChange={() => togglePriceFilter(price)}
                            disabled
                          />
                          <Label htmlFor={`price-${price}`} className="text-sm font-medium leading-none">
                            {price} {price === "$" ? "(Value)" : price === "$$$$" ? "(Luxury)" : ""}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Minimum Rating</h4>
                    <div className="flex flex-col gap-3">
                      {[0, 3, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${minRating === rating ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
                        >
                          <span className="font-medium">{rating === 0 ? "Any Rating" : `${rating}+ Stars`}</span>
                          {minRating === rating && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit" className="w-full">Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Location Selector */}
            <Popover open={openLocation} onOpenChange={setOpenLocation}>
              <PopoverTrigger asChild>
                <Button variant={selectedCity !== "All" ? "default" : "outline"} size="icon" className="shrink-0 relative">
                  <MapPin className="h-4 w-4" />
                  {selectedCity !== "All" && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary border-2 border-background" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandItem 
                      value="All"
                      onSelect={() => {
                        setSelectedCity("All");
                        setOpenLocation(false);
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selectedCity === "All" ? "opacity-100" : "opacity-0"}`} />
                      All Cities
                    </CommandItem>
                    <CommandGroup heading="Available Cities">
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => {
                            setSelectedCity(city);
                            setOpenLocation(false);
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selectedCity === city ? "opacity-100" : "opacity-0"}`} />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CUISINE_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCuisine(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeCuisine === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-2 lg:px-8">
        
        {/* Loading State */}
        {(sectionsLoading && !isSearchActive) || (searchLoading && isSearchActive) ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Loading restaurants...</p>
            <p className="text-sm">Finding the best tables for you</p>
          </div>
        ) : isSearchActive ? (
          /* Search Results View */
          <>
            <div className="mb-8 text-sm text-muted-foreground">
              {augmentedSearchResults.length} restaurant{augmentedSearchResults.length !== 1 ? "s" : ""} found
            </div>
            {augmentedSearchResults.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card">
                <p className="text-lg font-medium text-foreground">No restaurants found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {augmentedSearchResults.map((restaurant, i) => (
                  <RestaurantCard key={restaurant.restaurantId || restaurant._id || restaurant.id} restaurant={restaurant} index={i} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Homepage Sections View (Default) */
          <div className="flex flex-col gap-12">
            {displaySections.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card">
                <p className="text-lg font-medium text-foreground">No restaurants nearby</p>
                <p className="text-sm text-muted-foreground">Try changing your location or use the search bar</p>
              </div>
            ) : (
              displaySections.map((section) => (
                <section key={section.id} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">{section.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground" onClick={() => setSearchParams({ collection: section.id })}>
                      View All
                    </Button>
                  </div>
                  
                  {/* Horizontal Scroll Layout (Exact same as Homepage) */}
                  <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:-mx-8 lg:px-8">
                    {section.items.map((restaurant, i) => (
                      <div key={restaurant.restaurantId || restaurant._id || restaurant.id} className="w-[85vw] sm:w-[300px] shrink-0 snap-start flex flex-col">
                        <RestaurantCard restaurant={restaurant} index={i} />
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🌟 New Cinematic Scroll Section added after existing restaurant cards */}
      <DiscoverCinematicStory />
      
    </div>
  );
}
