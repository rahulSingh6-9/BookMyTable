import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Compass,
  CalendarCheck,
  ChevronRight,
  UtensilsCrossed,
  Gift
} from "lucide-react";
import { toast } from "sonner";

import { restaurants, cuisineFilters } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAuth } from "@/context/AuthContext";

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const displayName = useMemo(() => user?.name || "Diner", [user?.name]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/profile/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Curated lists based on real data array
  const nearbyRestaurants = useMemo(() => restaurants.slice(0, 4), []);
  const recommendedRestaurants = useMemo(() => restaurants.filter(r => r.rating >= 4.7).slice(0, 4), []);
  const trendingRestaurants = useMemo(() => restaurants.filter(r => r.reviewCount > 400).slice(0, 4), []);

  const upcomingBooking = {
    id: "BM-10241",
    restaurantId: "1",
    restaurantName: "Sakura Omakase",
    date: "Tonight",
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    guests: 2,
    tableNumber: 4,
    image: restaurants[0]?.image || ""
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 pb-12">
      
      {/* 1. PERSONALIZED WELCOME HERO */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-950 to-slate-900 p-6 md:p-10 text-white shadow-xl"
      >
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary via-slate-500 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            <span>Premium Booking Experience</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">{displayName}</span>!
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Discover exquisite flavors and reserve the finest dining tables across your favorite culinary destinations instantly.
          </p>

          {/* Smart Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search cuisines, restaurants, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white/95 text-slate-900 border-none rounded-xl focus-visible:ring-primary placeholder:text-slate-400 w-full"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold transition-all shadow-lg shadow-primary/10">
              Find a Table
            </Button>
          </form>
        </div>
      </motion.div>

      {/* 2. UPCOMING RESERVATION & FAST WALLET HIGHLIGHTS */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Reservation Board Card */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="md:col-span-2"
        >
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-white to-white shadow-sm h-full">
            <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-4 min-w-0">
                <div className="h-16 w-16 rounded-xl overflow-hidden shadow-inner border border-slate-100 hidden sm:block">
                  <img src={upcomingBooking.image} alt={upcomingBooking.restaurantName} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary">Upcoming Reservation</span>
                  <h3 className="font-extrabold text-slate-950 truncate text-base">{upcomingBooking.restaurantName}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {upcomingBooking.date} at {upcomingBooking.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3 text-slate-400" />
                      {upcomingBooking.guests} Guests
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none border-slate-200 text-slate-600 rounded-xl" onClick={() => navigate("/profile/bookings")}>
                  Manage
                </Button>
                <Button size="sm" className="flex-1 sm:flex-none bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md shadow-primary/10" onClick={() => navigate(`/restaurant/${upcomingBooking.restaurant?.slug || upcomingBooking.restaurantId}`)}>
                  View Restaurant
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cashback Points Promotion Card */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-100 shadow-sm h-full flex flex-col justify-between p-5">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-20 text-indigo-800 pointer-events-none">
              <Gift className="h-28 w-28" />
            </div>
            <div className="space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                <Percent className="h-3 w-3" />
                <span>MEMBERSHIP REWARDS</span>
              </div>
              <h3 className="font-extrabold text-indigo-950 text-base">Earn $25 on Referrals</h3>
              <p className="text-xs text-indigo-700">Invite a fellow gourmet foodie and receive cashback instantly in your wallet.</p>
            </div>
            <Button size="sm" variant="link" className="text-xs font-bold text-indigo-800 p-0 h-auto justify-start gap-1 hover:text-indigo-900 mt-3" onClick={() => navigate("/profile/rewards")}>
              Refer Friends <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* 3. QUICK CUISINE SHORTCUTS */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Explore Cuisines</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {cuisineFilters.filter(c => c !== "All").slice(0, 6).map((cuisine, index) => (
            <div
              key={cuisine}
              onClick={() => navigate(`/profile/discover?cuisine=${cuisine}`)}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 hover:bg-primary/5 transition cursor-pointer select-none group"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center text-primary transition">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition">{cuisine}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECOMMENDED SECTION */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }} 
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              Recommended for You
            </h2>
            <p className="text-xs text-slate-500">Tailored culinary spots matching your high rating preferences</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary font-bold gap-1 hover:text-primary/90" onClick={() => navigate("/profile/discover")}>
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant} 
              onBook={() => navigate(`/book/${restaurant.id}`)}
            />
          ))}
        </div>
      </motion.div>

      {/* 5. NEARBY DINING PLACES */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }} 
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              Nearby Fine Dining
            </h2>
            <p className="text-xs text-slate-500">Perfect slots and exquisite seating right around your area</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary font-bold gap-1 hover:text-primary/90" onClick={() => navigate("/profile/discover")}>
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nearbyRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant} 
              onBook={() => navigate(`/book/${restaurant.id}`)}
            />
          ))}
        </div>
      </motion.div>

      {/* 6. TRENDING HIGHLIGHTS COLLECTION */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }} 
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Trending Gourmets
            </h2>
            <p className="text-xs text-slate-500">Highly-rated restaurants with rapid reservation booking rates</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary font-bold gap-1 hover:text-primary/90" onClick={() => navigate("/profile/discover")}>
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant} 
              onBook={() => navigate(`/book/${restaurant.id}`)}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}

/* REUSABLE PREMIUM RESTAURANT CARD COMPONENT */
export function RestaurantCard({ restaurant, onBook }) {
  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const id = restaurant._id || restaurant.id;
  const isFavorite = favoriteIds.includes(id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, restaurant.name);
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full select-none"
    >
      <Link to={`/restaurant/${restaurant.slug || restaurant._id || restaurant.id}`} className="block relative aspect-[4/3] overflow-hidden">
        {/* Cover Image */}
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <MapPin className="h-3 w-3 text-primary" />
          <span>{restaurant.distance}</span>
        </div>

        {/* Favorite Heart Trigger */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 shadow-sm transition active:scale-95 z-10"
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-primary text-primary" : "text-slate-600")} />
        </button>

        {/* Price Indicator */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
          {restaurant.priceRange}
        </div>
      </Link>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span>{restaurant.city}</span>
          </div>

          <Link to={`/restaurant/${restaurant.slug || restaurant._id || restaurant.id}`} className="block group-hover:text-primary transition">
            <h3 className="font-extrabold text-slate-900 leading-snug truncate text-sm md:text-base">{restaurant.name}</h3>
          </Link>

          {/* Rating Block */}
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-900">{restaurant.rating}</span>
            <span className="text-slate-400 text-[10px]">({restaurant.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Live Slot Pill Grid */}
        <div className="space-y-2 pt-1.5 border-t border-slate-50">
          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Live booking slots</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.availableSlots.slice(0, 3).map((slot) => (
              <Button
                key={slot}
                variant="outline"
                size="sm"
                onClick={onBook}
                className="h-7 px-2.5 text-[10px] font-semibold border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-primary/5 hover:text-primary rounded-lg transition"
              >
                {slot}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
