import { MapPin, Phone, Mail, Store, FileText, Navigation } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StaticGoogleMap } from "@/components/shared/StaticGoogleMap";

export function RestaurantDetails({ restaurant }) {
  const { user } = useAuth();
  
  // Format address for google maps iframe fallback/directions link
  const mapQuery = encodeURIComponent(`${restaurant.branchName || restaurant.name}, ${restaurant.address?.area || restaurant.area}, ${restaurant.address?.city || restaurant.city}`);

  // Extract precise coordinates from DB
  const coords = restaurant.location?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;
  const lng = hasCoords ? coords[0] : null;
  const lat = hasCoords ? coords[1] : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">About & Location</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Col: Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {restaurant.description || "No description provided."}
            </p>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Address</p>
                <p className="text-muted-foreground mt-0.5">
                  {restaurant.address?.addressLine1 || restaurant.addressLine1}
                  <br />
                  {restaurant.address?.area || restaurant.area}, {restaurant.address?.city || restaurant.city}
                </p>
              </div>
            </div>

            {(restaurant.contactNumber || restaurant.phone) && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <p className="text-muted-foreground mt-0.5">{restaurant.contactNumber || restaurant.phone}</p>
                </div>
              </div>
            )}

            {restaurant.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground mt-0.5">{restaurant.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin/Owner debug info */}
          {user?.role === "ADMIN" && (
            <div className="p-4 rounded-lg bg-secondary/30 border border-secondary/50 mt-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <Store className="h-3 w-3" /> System Details
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Branch ID</span>
                <span className="font-mono text-foreground">{restaurant.restaurantId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Brand ID</span>
                <span className="font-mono text-foreground">{restaurant.brandId || "N/A"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Map */}
        <div className="h-64 md:h-full min-h-[300px] rounded-xl overflow-hidden border border-border shadow-sm relative group">
          {hasCoords ? (
            <StaticGoogleMap lat={lat} lng={lng} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-center p-6">
              <MapPin className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">Coordinates not configured</p>
            </div>
          )}

          {/* Open in Maps Button */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hasCoords ? `${lat},${lng}` : mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border text-sm font-bold flex items-center gap-2 hover:bg-background transition-colors hover:-translate-y-0.5 active:translate-y-0"
          >
            <Navigation className="h-4 w-4 text-primary" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}
