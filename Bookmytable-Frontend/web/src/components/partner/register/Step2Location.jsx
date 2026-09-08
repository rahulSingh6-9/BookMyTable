import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Search, Map as MapIcon, CheckCircle2, AlertCircle, Globe, Building, Navigation2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function Step2Location({ register, errors, setValue, watch }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);

  const lat = watch("lat") || 12.9716;
  const lng = watch("lng") || 77.5946;
  const city = watch("city");
  const state = watch("state");
  const country = watch("country");
  const pincode = watch("pincode");
  const addressLine1 = watch("addressLine1");
  const restaurantName = watch("restaurantName") || "Your Restaurant";

  const initMap = () => {
    if (!mapRef.current) return;

    const center = { lat, lng };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      const newLat = position.lat();
      const newLng = position.lng();
      updateCoordinates(newLat, newLng);
      reverseGeocode(newLat, newLng);
    });

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      types: ["establishment", "geocode"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();

      map.setCenter({ lat: newLat, lng: newLng });
      marker.setPosition({ lat: newLat, lng: newLng });
      
      updateCoordinates(newLat, newLng);
      parsePlace(place);
    });
  };

  const updateCoordinates = (newLat, newLng) => {
    setValue("lat", newLat, { shouldValidate: true });
    setValue("lng", newLng, { shouldValidate: true });
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        parsePlace(results[0]);
      }
    });
  };

  const parsePlace = (place) => {
    let city = "";
    let state = "";
    let country = "";
    let pincode = "";
    let route = "";
    let streetNumber = "";
    let sublocality = "";

    place.address_components?.forEach((component) => {
      const types = component.types;
      if (types.includes("locality")) city = component.long_name;
      if (types.includes("administrative_area_level_1")) state = component.long_name;
      if (types.includes("country")) country = component.long_name;
      if (types.includes("postal_code")) pincode = component.long_name;
      if (types.includes("route")) route = component.long_name;
      if (types.includes("street_number")) streetNumber = component.long_name;
      if (types.includes("sublocality") || types.includes("sublocality_level_1")) sublocality = component.long_name;
    });

    const mainAddress = [streetNumber, route, sublocality].filter(Boolean).join(", ");
    
    if (mainAddress) setValue("addressLine1", mainAddress, { shouldValidate: true });
    else if (place.name && !place.name.includes(place.formatted_address)) setValue("addressLine1", place.name, { shouldValidate: true });
    else setValue("addressLine1", place.formatted_address?.split(",")[0] || "", { shouldValidate: true });

    if (city) setValue("city", city, { shouldValidate: true });
    if (state) setValue("state", state, { shouldValidate: true });
    if (country) setValue("country", country, { shouldValidate: true });
    if (pincode) setValue("pincode", pincode, { shouldValidate: true });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateCoordinates(latitude, longitude);
        
        if (markerRef.current) {
          markerRef.current.setPosition({ lat: latitude, lng: longitude });
          markerRef.current.getMap().setCenter({ lat: latitude, lng: longitude });
        }
        
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
        toast.success("Location detected successfully");
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      initMap();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          initMap();
          clearInterval(checkInterval);
        }
      }, 500);
    }
  }, []);

  return (
    <div className="space-y-8 pb-4">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <Search className="h-4 w-4" />
              </div>
              <Label className="text-lg font-bold">Search Business Location</Label>
           </div>
           <Button 
             type="button"
             variant="outline" 
             size="sm" 
             onClick={getCurrentLocation}
             disabled={isLocating}
             className="rounded-full gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 group"
           >
             <Navigation2 className={`h-4 w-4 text-primary transition-transform group-hover:scale-110 ${isLocating ? "animate-pulse" : ""}`} />
             {isLocating ? "Locating..." : "Use Current Location"}
           </Button>
        </div>

        <div className="relative group">
          <Input 
            ref={searchInputRef}
            id="location-search" 
            placeholder="Search for your building, street or area..." 
            className="h-14 rounded-2xl border-2 pl-12 focus-visible:ring-primary/20 bg-card shadow-sm"
            autoComplete="new-password"
          />
          <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Interactive Map */}
        <div className="space-y-4">
           <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-[2rem] border-2 border-border bg-muted overflow-hidden shadow-inner group">
              <div ref={mapRef} className="w-full h-full" />
              
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live Coordinates</span>
                 </div>
              </div>

              <div className="absolute bottom-6 right-6 z-10">
                 <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce-subtle">
                    <MapPin className="h-4 w-4 fill-current" />
                    <span className="text-xs font-bold">Drag Pin to Adjust</span>
                 </div>
              </div>
           </div>

           {/* Location Preview Card */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="p-6 rounded-[2rem] border-2 border-primary/10 bg-primary/5 flex items-start gap-4"
           >
              <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
                 <Building className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1">
                 <h4 className="font-bold text-foreground flex items-center gap-2">
                   {restaurantName}
                   <CheckCircle2 className="h-4 w-4 text-green-500" />
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {addressLine1 ? (
                     <>
                       {addressLine1}, {city && `${city}, `}{state && `${state} `}
                       <br />
                       {country && `${country} — `}{pincode && pincode}
                     </>
                   ) : (
                     <span className="italic">Start searching or drag the pin to set address</span>
                   )}
                 </p>
                 <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase font-bold text-muted-foreground">Latitude</span>
                       <span className="text-xs font-mono font-bold text-primary">{lat.toFixed(6)}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase font-bold text-muted-foreground">Longitude</span>
                       <span className="text-xs font-mono font-bold text-primary">{lng.toFixed(6)}</span>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Right Column: Structured Address Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 (Building, Street)</Label>
              <Input 
                id="addressLine1" 
                placeholder="e.g. 12 Civil Lines" 
                className="h-12 rounded-xl border-2"
                {...register("addressLine1")}
                autoComplete="new-password"
              />
              {errors.addressLine1 && <p className="text-xs text-destructive ml-1">{errors.addressLine1.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input 
                  id="addressLine2" 
                  placeholder="Floor, suite, etc." 
                  className="h-12 rounded-xl border-2"
                  {...register("addressLine2")}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input 
                  id="landmark" 
                  placeholder="Near central park" 
                  className="h-12 rounded-xl border-2"
                  {...register("landmark")}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="e.g. Kota" 
                  className="h-12 rounded-xl border-2"
                  {...register("city")}
                  autoComplete="new-password"
                />
                {errors.city && <p className="text-xs text-destructive ml-1">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input 
                  id="state" 
                  placeholder="e.g. Rajasthan" 
                  className="h-12 rounded-xl border-2"
                  {...register("state")}
                  autoComplete="new-password"
                />
                {errors.state && <p className="text-xs text-destructive ml-1">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <Input 
                    id="country" 
                    placeholder="e.g. India" 
                    className="h-12 rounded-xl border-2 pl-10"
                    {...register("country")}
                    autoComplete="new-password"
                  />
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.country && <p className="text-xs text-destructive ml-1">{errors.country.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode / Postal Code</Label>
                <Input 
                  id="pincode" 
                  placeholder="6-digit ZIP code" 
                  className="h-12 rounded-xl border-2"
                  {...register("pincode")}
                  autoComplete="new-password"
                />
                {errors.pincode && <p className="text-xs text-destructive ml-1">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
             <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
             <p className="text-xs text-amber-700 leading-normal">
               <b>Verification Tip:</b> Ensure the pin is placed exactly at your restaurant's entrance. This helps customers find you easily.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
