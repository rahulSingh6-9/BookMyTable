import { Link } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Star, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useEffect } from "react";

export function RestaurantHero({ restaurant }) {
  // Compute Open/Closed status for the badge
  const todayStr = new Date().toISOString().split("T")[0];
  const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayIndex = new Date().getDay();
  const dayName = DAYS_OF_WEEK[dayIndex];
  const settings = restaurant.settings;
  const dayData = settings?.openingHours?.[dayName];
  const special = settings?.specialDays?.find((s) => s.date === todayStr);

  const isClosed = special?.isOpen === false || (!special && (!dayData || dayData.isClosed));

  const { favoriteIds, toggleFavorite, initialize } = useFavoritesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const id = restaurant._id || restaurant.restaurantId || restaurant.id;
  const isLiked = favoriteIds.includes(id);

  const handleToggleFavorite = () => {
    toggleFavorite(id, restaurant.branchName || restaurant.name);
  };

  return (
    <div className="relative h-72 sm:h-80 lg:h-96 w-full">
      {/* Background Image */}
      <img 
        src={restaurant.coverImage || restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80"} 
        alt={restaurant.branchName || restaurant.name} 
        className="h-full w-full object-cover" 
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:from-background lg:via-background/40" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Top Nav Actions */}
      <div className="absolute top-4 left-4 z-10">
        <Link to="/search">
          <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 border border-white/20">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggleFavorite}
          className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 border border-white/20"
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 border border-white/20">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 lg:p-8 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        
        {/* Left Side: Logo & Text */}
        <div className="flex items-end gap-4">
          {console.log("Logo value:", restaurant.logo) || null}
          {console.log("Logo type:", typeof restaurant.logo) || null}
          {console.log("Logo starts with data:image:", typeof restaurant.logo === 'string' ? restaurant.logo.startsWith("data:image") : false) || null}
          
          {restaurant.logo ? (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name} 
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "999px",
                objectFit: "cover",
                zIndex: 9999,
                position: "relative"
              }}
            />
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-primary">
              {(restaurant.branchName || restaurant.name || "R").charAt(0).toUpperCase()}
            </span>
          )}
          
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant={isClosed ? "destructive" : "default"} className="font-semibold shadow-sm">
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isClosed ? "bg-white" : "bg-white animate-pulse"}`} />
                {isClosed ? "Closed Now" : "Open Now"}
              </Badge>
              {restaurant.cuisines?.slice(0, 3).map((c, i) => (
                <Badge key={i} variant="secondary" className="bg-background/50 backdrop-blur-sm border-white/20 text-white hover:bg-background/60">
                  {c}
                </Badge>
              ))}
              {restaurant.costForTwo && (
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/20 text-white hover:bg-background/60">
                  ₹{restaurant.costForTwo} for two
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {restaurant.branchName || restaurant.name}
            </h1>
            <p className="flex items-center gap-1.5 text-white/90 text-sm sm:text-base mt-2 font-medium drop-shadow">
              <MapPin className="h-4 w-4 text-primary" />
              {restaurant.address?.area || restaurant.area}, {restaurant.address?.city || restaurant.city}
              {restaurant.distance && ` • ${restaurant.distance} km away`}
            </p>
          </div>
        </div>

        {/* Right Side: Rating & Actions */}
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-3 bg-background/30 backdrop-blur-md rounded-lg p-3 border border-white/10 shadow-lg">
            <div className="flex flex-col items-center justify-center bg-green-600 text-white rounded-md h-12 w-12 font-bold text-lg">
              {restaurant.averageRating?.toFixed(1) || "4.5"}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <span className="text-xs text-white/80 font-medium">{restaurant.totalReviews || 120}+ Ratings</span>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/20 backdrop-blur-md text-white border-white/20 hover:bg-background/40"
              onClick={() => {
                const phone = restaurant.phone || restaurant.contactNumber;
                if (phone) window.location.href = `tel:${phone}`;
              }}
              disabled={!(restaurant.phone || restaurant.contactNumber)}
            >
              <Phone className="h-4 w-4 mr-2" /> Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/20 backdrop-blur-md text-white border-white/20 hover:bg-background/40"
              onClick={() => {
                if (restaurant.location?.coordinates) {
                  const lng = restaurant.location.coordinates[0];
                  const lat = restaurant.location.coordinates[1];
                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                }
              }}
              disabled={!restaurant.location?.coordinates}
            >
               Directions <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
