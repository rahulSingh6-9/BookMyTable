import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Navigation2, Search, Map as MapIcon, CheckCircle2, AlertCircle, Globe, Building, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBranch } from "@/context/BranchContext";
import { updateBranchLocation } from "@/services/restaurant.service";
import { StaticGoogleMap } from "@/components/shared/StaticGoogleMap";

export default function BranchLocationSettings() {
  const { activeBranch, refreshBranch } = useBranch();
  const { toast } = useToast();

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const addressInputRef = useRef(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    lat: 12.9716,
    lng: 77.5946
  });

  // Check if map is dirty
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (activeBranch) {
      setFormData({
        addressLine1: activeBranch.address?.addressLine1 || "",
        addressLine2: activeBranch.address?.addressLine2 || "",
        landmark: activeBranch.address?.landmark || "",
        city: activeBranch.address?.city || "",
        state: activeBranch.address?.state || "",
        country: activeBranch.address?.country || "India",
        pincode: activeBranch.address?.postalCode || "",
        lat: activeBranch.location?.coordinates?.[1] || 12.9716,
        lng: activeBranch.location?.coordinates?.[0] || 77.5946
      });
      setIsDirty(false);
    }
  }, [activeBranch]);

  const initMap = () => {
    if (!mapRef.current) return;

    const center = { lat: formData.lat, lng: formData.lng };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
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
      setIsDirty(true);
    });

    if (addressInputRef.current) {
      const addressAutocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["establishment", "geocode"],
      });

      addressAutocomplete.addListener("place_changed", () => {
        const place = addressAutocomplete.getPlace();
        if (!place.geometry) return;

        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        map.setCenter({ lat: newLat, lng: newLng });
        marker.setPosition({ lat: newLat, lng: newLng });
        
        updateCoordinates(newLat, newLng);
        parsePlace(place);
        setIsDirty(true);
      });
    }
  };

  const updateCoordinates = (newLat, newLng) => {
    setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
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
    
    setFormData(prev => {
      let addr1 = prev.addressLine1;
      if (mainAddress) addr1 = mainAddress;
      else if (place.name && !place.name.includes(place.formatted_address)) addr1 = place.name;
      else addr1 = place.formatted_address?.split(",")[0] || "";

      return {
        ...prev,
        addressLine1: addr1,
        city: city || prev.city,
        state: state || prev.state,
        country: country || prev.country,
        pincode: pincode || prev.pincode
      };
    });
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
        setIsDirty(true);
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
    if (!activeBranch) return;
    
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
  }, [activeBranch]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const triggerSave = () => {
    if (!formData.addressLine1 || !formData.city || !formData.lat || !formData.lng) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Address Line 1 and City are required." });
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast({ variant: "destructive", title: "Error", description: "Password is required to confirm changes." });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBranchLocation(activeBranch.id, { 
        ...formData,
        password 
      });
      toast({ title: "Success", description: "Location updated securely. Notifications dispatched." });
      if (refreshBranch) refreshBranch();
      setIsPasswordModalOpen(false);
      setPassword("");
      setIsDirty(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: e.response?.data?.message || "Failed to update location." });
      if (e.response?.status === 401) setPassword(""); // clear password on invalid
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeBranch) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Branch Location
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Update the physical address and map coordinates of this branch.</p>
        </div>
        {isDirty && (
          <Button onClick={triggerSave} size="lg" className="rounded-full shadow-lg font-bold min-w-[120px] transition-all bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce-subtle">
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* LEFT COLUMN: Map & Editor */}
        <div className="space-y-6">
          
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Interactive Map Locator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="text-sm text-muted-foreground flex-1">
                   Drag the pin to adjust your exact location, or search using the Address Line 1 field below.
                 </div>
                 <Button 
                   type="button"
                   variant="outline" 
                   size="sm" 
                   onClick={getCurrentLocation}
                   disabled={isLocating}
                   className="rounded-xl gap-2 h-12 px-4 border-primary/20 hover:border-primary hover:bg-primary/5 group shrink-0"
                 >
                   <Navigation2 className={`h-4 w-4 text-primary transition-transform group-hover:scale-110 ${isLocating ? "animate-pulse" : ""}`} />
                   {isLocating ? "Locating..." : "Use Current"}
                 </Button>
              </div>

              <div className="relative aspect-[16/9] rounded-[1.5rem] border-2 border-border bg-muted overflow-hidden shadow-inner group">
                 <div ref={mapRef} className="w-full h-full" />
                 
                 <div className="absolute top-4 left-4 z-10">
                    <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Live Pin</span>
                    </div>
                 </div>

                 <div className="absolute bottom-6 right-6 z-10">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                       <MapPin className="h-4 w-4 fill-current" />
                       <span className="text-xs font-bold">Drag Pin to Adjust</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Latitude</span>
                    <span className="text-sm font-mono font-bold text-foreground">{formData.lat.toFixed(6)}</span>
                 </div>
                 <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Longitude</span>
                    <span className="text-sm font-mono font-bold text-foreground">{formData.lng.toFixed(6)}</span>
                 </div>
              </div>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="addressLine1" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 1 *</Label>
                <Input 
                  ref={addressInputRef}
                  id="addressLine1" 
                  value={formData.addressLine1}
                  onChange={(e) => handleFieldChange("addressLine1", e.target.value)}
                  placeholder="e.g. 12 Civil Lines" 
                  className="h-12 rounded-xl border-border/50 bg-muted/20"
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 2</Label>
                  <Input 
                    id="addressLine2" 
                    value={formData.addressLine2}
                    onChange={(e) => handleFieldChange("addressLine2", e.target.value)}
                    placeholder="Floor, suite, etc." 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Landmark</Label>
                  <Input 
                    id="landmark" 
                    value={formData.landmark}
                    onChange={(e) => handleFieldChange("landmark", e.target.value)}
                    placeholder="Near central park" 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City *</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    placeholder="e.g. Kota" 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State / Province</Label>
                  <Input 
                    id="state" 
                    value={formData.state}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                    placeholder="e.g. Rajasthan" 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country *</Label>
                  <Input 
                    id="country" 
                    value={formData.country}
                    onChange={(e) => handleFieldChange("country", e.target.value)}
                    placeholder="e.g. India" 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</Label>
                  <Input 
                    id="pincode" 
                    value={formData.pincode}
                    onChange={(e) => handleFieldChange("pincode", e.target.value)}
                    placeholder="ZIP code" 
                    className="h-12 rounded-xl border-border/50 bg-muted/20"
                    autoComplete="new-password"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Info Sidebar */}
        <div className="space-y-6">
          
          <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-amber-500/10 bg-amber-500/5">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5" />
                Discovery Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4 text-sm text-amber-800/80 leading-relaxed">
                <p>
                  <strong>Warning:</strong> Changing your location directly impacts how guests find you.
                </p>
                <ul className="list-disc pl-4 space-y-2 text-amber-700/80">
                  <li>Search & "Nearby" queries will instantly route to the new coordinates.</li>
                  <li>Existing reservations will still display the old address on past emails, but new communications will use the new address.</li>
                  <li>Customer navigation apps (Google Maps) will direct to the new pin.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
             <CardHeader className="pb-3 bg-muted/30 border-b border-border/50">
               <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Current Live Location</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="h-[200px] w-full">
                  <StaticGoogleMap lat={activeBranch.location?.coordinates?.[1] || 12.9716} lng={activeBranch.location?.coordinates?.[0] || 77.5946} zoom={15} />
               </div>
               <div className="p-4">
                  <p className="font-bold text-sm text-foreground">{activeBranch.branchName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activeBranch.address?.addressLine1}, {activeBranch.address?.city}</p>
               </div>
             </CardContent>
          </Card>

        </div>

      </div>

      {/* PASSWORD CONFIRMATION MODAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-border/50 shadow-2xl">
          <div className="bg-gradient-to-r from-amber-500/10 to-background p-6 border-b border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-amber-600">
                <Lock className="w-5 h-5" />
                Confirm Location Change
              </DialogTitle>
              <DialogDescription className="pt-2">
                This is a sensitive operation. An email notification will be sent to the brand and branch owners.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-background">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Current Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password to verify"
                  className="pl-9 pr-10 rounded-xl bg-muted/20 border-border/50 h-11 focus-visible:ring-primary/20"
                  onKeyDown={(e) => { if (e.key === "Enter" && password) handlePasswordSubmit(); }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 border-t border-border/50 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)} disabled={isSubmitting} className="rounded-xl hover:bg-muted/50">Cancel</Button>
            <Button onClick={handlePasswordSubmit} disabled={isSubmitting || !password} className="rounded-xl shadow-md bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]">
              {isSubmitting ? "Updating..." : "Confirm Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
