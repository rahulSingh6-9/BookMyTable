import { Star, MapPin, Phone, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RestaurantInfo({ restaurant }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{restaurant.name}</h1>
        <Badge variant="secondary">{restaurant.cuisine}</Badge>
        <Badge variant="secondary">{restaurant.priceRange}</Badge>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-medium text-foreground">{restaurant.rating}</span>
          ({restaurant.reviewCount} reviews)
        </span>
        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{restaurant.address}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{restaurant.openHours}</span>
        <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{restaurant.phone}</span>
      </div>
      <p className="mb-4 text-muted-foreground">{restaurant.description}</p>
      <div className="flex flex-wrap gap-2">
        {restaurant.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
      </div>
    </div>
  );
}
