import { useState, useEffect, useCallback } from "react";
import { useLocationStore } from "@/store/useLocationStore";

// Cache location globally so we don't ask for permission multiple times per session
let cachedLocation = null;

export function useUserLocation() {
  const [location, setLocation] = useState(cachedLocation);
  const [status, setStatus] = useState(cachedLocation ? "granted" : "idle");
  const [error, setError] = useState(null);

  const requestLocation = useCallback((force = false) => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setError("Geolocation is not supported by your browser");
      return;
    }

    if (cachedLocation && !force) {
      setLocation(cachedLocation);
      setStatus("granted");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        cachedLocation = coords;
        setLocation(coords);
        setStatus("granted");
        setError(null);

        // Sync coordinates with global location store if available
        try {
          useLocationStore.getState().setLocation({
            lat: coords.lat,
            lng: coords.lng,
            isAutoDetected: true,
          });
        } catch (e) {}
      },
      (err) => {
        let errStatus = "unavailable";
        let message = "Could not determine your location.";

        if (err.code === 1) {
          errStatus = "denied";
          message = "Location access was denied. Please enable location permissions.";
        } else if (err.code === 2) {
          errStatus = "unavailable";
          message = "Location information is currently unavailable.";
        } else if (err.code === 3) {
          errStatus = "timeout";
          message = "Location request timed out. Please try again.";
        } else if (err.message) {
          message = err.message;
        }

        setStatus(errStatus);
        setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: force ? 0 : 60000,
      }
    );
  }, []);

  useEffect(() => {
    if (cachedLocation) {
      setLocation(cachedLocation);
      setStatus("granted");
    } else {
      requestLocation(false);
    }
  }, [requestLocation]);

  return {
    location,
    status,
    isLocating: status === "requesting",
    error,
    requestLocation,
  };
}

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
