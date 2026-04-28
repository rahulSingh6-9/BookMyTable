import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { useEffect } from "react";

export function Step2Location({ register, errors, setValue, watch }) {
  const lat = watch("lat") || 12.9716;
  const lng = watch("lng") || 77.5946;

  useEffect(() => {
    const initAutocomplete = () => {
      const input = document.getElementById("address");
      if (!input) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["establishment", "geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        setValue("address", place.name ? `${place.name}, ${place.formatted_address || ''}` : place.formatted_address, { shouldValidate: true });

        let city = "";
        let state = "";
        let pincode = "";

        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes("locality")) city = component.long_name;
          if (types.includes("administrative_area_level_1")) state = component.long_name;
          if (types.includes("postal_code")) pincode = component.long_name;
        });

        if (city) setValue("city", city, { shouldValidate: true });
        if (state) setValue("state", state, { shouldValidate: true });
        if (pincode) setValue("pincode", pincode, { shouldValidate: true });

        setValue("lat", place.geometry.location.lat());
        setValue("lng", place.geometry.location.lng());
      });
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    // Check if script is already injected
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      // If script exists but not loaded yet, wait a bit (or could use a more robust loaded check)
      setTimeout(initAutocomplete, 1000);
    }
  }, [setValue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input 
          id="address" 
          placeholder="Start typing to search address..." 
          {...register("address", { required: "Address is required" })}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <p className="text-[10px] text-amber-500">Google Maps API key missing. Autocomplete disabled.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            placeholder="e.g. Bangalore" 
            {...register("city", { required: "City is required" })}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input 
            id="state" 
            placeholder="e.g. Karnataka" 
            {...register("state", { required: "State is required" })}
          />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input 
          id="pincode" 
          placeholder="6-digit ZIP code" 
          {...register("pincode", { 
            required: "Pincode is required",
            pattern: { value: /^\d{6}$/, message: "Invalid pincode" }
          })}
        />
        {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
      </div>

      <div className="space-y-4">
        <Label>Map Pin (Latitude / Longitude)</Label>
        <div className="relative aspect-video rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=13&size=600x300&sensor=false')] bg-cover opacity-50 grayscale" />
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
