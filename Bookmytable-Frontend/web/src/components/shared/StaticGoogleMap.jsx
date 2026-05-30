import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export function StaticGoogleMap({ lat, lng }) {
  const mapRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Debugging per requirements (Remove after fixing)
    console.log("[DEBUG MAP] Coordinates received:", { lat, lng });
    console.log("[DEBUG MAP] API Key Source:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Present" : "Missing");

    const initMap = () => {
      console.log("[DEBUG MAP] Map Loader State: initMap called");
      if (!mapRef.current) return;

      try {
        const center = { lat, lng };
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true, // Allow users to zoom in/out
          draggable: true, // Allow users to pan around
          gestureHandling: "cooperative", // Good for mobile scrolling
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Add the marker
        new window.google.maps.Marker({
          position: center,
          map,
          draggable: false, // Static pin for read-only
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      } catch (err) {
        console.error("[DEBUG MAP] Failed to initialize map", err);
        setError(true);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("[DEBUG MAP] Missing Google Maps API Key");
      setError(true);
      return;
    }

    // Reuse exact loader pattern from Step2Location to avoid duplicate scripts
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      console.log("[DEBUG MAP] Map Loader State: Injecting Script");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      console.log("[DEBUG MAP] Map Loader State: Waiting for existing script");
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          initMap();
          clearInterval(checkInterval);
        }
      }, 500);
    }
  }, [lat, lng]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted border border-border rounded-xl text-center p-6">
        <MapPin className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm font-semibold text-muted-foreground">Map Unavailable</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
