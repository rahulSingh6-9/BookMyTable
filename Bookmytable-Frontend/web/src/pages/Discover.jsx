import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants, cuisineFilters, indianCities, globalCities } from "@/lib/data";
import { SearchBar } from "@/components/search/SearchBar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [priceFilters, setPriceFilters] = useState([]); // ['$', '$$']
  const [minRating, setMinRating] = useState(0);
  const [openLocation, setOpenLocation] = useState(false);

  const togglePriceFilter = (price) => {
    setPriceFilters(prev => 
      prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
    );
  };

  const filtered = restaurants.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                        r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
                        (r.city && r.city.toLowerCase().includes(search.toLowerCase()));
    const matchCuisine = activeCuisine === "All" || r.cuisine === activeCuisine;
    const matchCity = selectedCity === "All" || r.city === selectedCity;
    const matchPrice = priceFilters.length === 0 || priceFilters.includes(r.priceRange);
    const matchRating = r.rating >= minRating;
    return matchSearch && matchCuisine && matchCity && matchPrice && matchRating;
  });

  return (
    <div className="min-h-screen pt-16">
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
                        <div key={price} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`price-${price}`} 
                            checked={priceFilters.includes(price)}
                            onCheckedChange={() => togglePriceFilter(price)}
                          />
                          <Label htmlFor={`price-${price}`} className="text-sm font-medium leading-none cursor-pointer">
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
                    <CommandGroup heading="India">
                      {indianCities.map((city) => (
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
                    <CommandGroup heading="Global">
                      {globalCities.map((city) => (
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
            {cuisineFilters.map((c) => (
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

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mb-8 text-sm text-muted-foreground">
          {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card">
            <p className="text-lg font-medium text-foreground">No restaurants found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* Group filtered restaurants by cuisine dynamically */}
            {Object.entries(
              filtered.reduce((acc, restaurant) => {
                const category = restaurant.cuisine || "Other";
                if (!acc[category]) acc[category] = [];
                acc[category].push(restaurant);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <section key={category} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{category}</h2>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                    View All
                  </Button>
                </div>
                
                {/* Horizontal Scroll Layout */}
                <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:-mx-8 lg:px-8">
                  {items.map((restaurant, i) => (
                    <div key={restaurant.id} className="min-w-[85vw] sm:min-w-[300px] max-w-[320px] shrink-0 snap-start">
                      <RestaurantCard restaurant={restaurant} index={i} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
