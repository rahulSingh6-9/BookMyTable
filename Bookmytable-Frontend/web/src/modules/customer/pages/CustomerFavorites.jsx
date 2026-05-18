import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Compass,
  Star,
  MapPin,
  Flame,
  Bookmark,
  FolderHeart,
  ArrowRight,
  HeartCrack,
  Clock,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

import { restaurants } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";

export default function CustomerFavorites() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("restaurants");

  // Favorite Restaurants state using real mock catalog
  const [favRestaurants, setFavRestaurants] = useState(restaurants.slice(0, 3));

  // Favorite Dishes state
  const [favDishes, setFavDishes] = useState([
    { id: "d1", name: "Truffle Fettuccine Pasta", price: "$24", restaurant: "Trattoria Bella", rating: 4.8 },
    { id: "d2", name: "Salmon Aburi Omakase Sashimi", price: "$32", restaurant: "Sakura Omakase", rating: 4.9 },
    { id: "d3", name: "Prime Ribeye Steak 400g", price: "$55", restaurant: "The Capital Grill", rating: 4.7 }
  ]);

  // Saved Collections state
  const [favCollections, setFavCollections] = useState([
    { id: "c1", name: "Romantic Dinner Dates", desc: "Cozy spaces with candlelights and premium courses", count: 4, cover: restaurants[0]?.image || "" },
    { id: "c2", name: "Weekend Hangouts", desc: "Cocktails, music, and exquisite rooftop views", count: 3, cover: restaurants[4]?.image || "" },
    { id: "c3", name: "Family Lunch Spots", desc: "Hearty southern style pasta and pizzas", count: 6, cover: restaurants[1]?.image || "" }
  ]);

  const handleRemoveRestaurant = (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavRestaurants(prev => prev.filter(r => r.id !== id));
    toast.success(`Removed ${name} from favorites`);
  };

  const handleRemoveDish = (id, name) => {
    setFavDishes(prev => prev.filter(d => d.id !== id));
    toast.success(`Removed ${name} from saved dishes`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          My Favorites
        </h1>
        <p className="text-xs md:text-sm text-slate-500">Your curated collection of fine dining restaurants, delicious dishes, and saved lists</p>
      </div>

      {/* FAVORITE SYSTEM TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm space-x-1 h-11 w-full max-w-md">
          <TabsTrigger value="restaurants" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Restaurants <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{favRestaurants.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dishes" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Saved Dishes <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{favDishes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="collections" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Collections <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{favCollections.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* RESTAURANTS TAB */}
          <TabsContent value="restaurants" className="mt-0 focus-visible:outline-none">
            {favRestaurants.length > 0 ? (
              <motion.div 
                layout 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {favRestaurants.map(r => (
                  <div key={r.id} className="relative group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <Link to={`/restaurant/${r.id}`} className="block relative aspect-[4/3] overflow-hidden">
                      <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-102 transition duration-300" />
                      
                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemoveRestaurant(r.id, r.name, e)}
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm hover:scale-110 transition z-10"
                      >
                        <Heart className="h-4 w-4 fill-primary text-primary" />
                      </button>

                      <div className="absolute top-3 left-3 bg-black/60 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase">
                        {r.cuisine}
                      </div>
                    </Link>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 truncate text-sm md:text-base">{r.name}</h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {r.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs py-2 border-t border-slate-50">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          {r.rating} ({r.reviewCount})
                        </span>
                        <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl h-8 text-[11px] font-bold" onClick={() => navigate(`/book/${r.id}`)}>
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
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </TabsContent>

          {/* DISHES TAB */}
          <TabsContent value="dishes" className="mt-0 focus-visible:outline-none">
            {favDishes.length > 0 ? (
              <div className="grid gap-4 max-w-2xl">
                {favDishes.map(d => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={d.id} 
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base">{d.name}</h3>
                        <Badge variant="secondary" className="bg-amber-50 border border-amber-100 text-amber-700 h-5 px-1.5 text-[10px] rounded font-bold flex items-center gap-1">
                          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                          Must Try
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        Menu item at <span className="font-semibold text-slate-600">{d.restaurant}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-base">{d.price}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveDish(d.id, d.name)}
                        className="text-slate-400 hover:text-primary h-8 w-8 p-0 rounded-full"
                      >
                        <Heart className="h-4.5 w-4.5 fill-primary text-primary" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={HeartCrack}
                title="No saved dishes"
                description="Find and save gourmet menu recipes you want to feast on later."
                actionLabel="Explore catalog"
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </TabsContent>

          {/* COLLECTIONS TAB */}
          <TabsContent value="collections" className="mt-0 focus-visible:outline-none">
            {favCollections.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favCollections.map(c => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={c.id} 
                    className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={c.cover} alt={c.name} className="h-full w-full object-cover group-hover:scale-102 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                        <span className="text-[9px] font-extrabold tracking-wider bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                          {c.count} RESTAURANTS
                        </span>
                        <h3 className="font-extrabold text-base tracking-tight truncate mt-1">{c.name}</h3>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs text-slate-500 leading-normal">{c.desc}</p>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Bookmark className="h-3.5 w-3.5" />
                          List Saved
                        </span>
                        <span className="text-primary flex items-center gap-1 hover:text-primary/90 transition">
                          View List <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderHeart}
                title="No collections built yet"
                description="Group restaurant selections into custom lists like Romantic Spots or Friday Lunches."
                actionLabel="Create list"
                onAction={() => toast.success("Creation tool coming soon!")}
              />
            )}
          </TabsContent>
        </AnimatePresence>

      </Tabs>

    </div>
  );
}
