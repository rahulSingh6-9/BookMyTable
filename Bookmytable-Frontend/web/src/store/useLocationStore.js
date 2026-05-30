import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      location: {
        city: '', // Default city
        area: '',
        lat: null,
        lng: null,
        isAutoDetected: false,
      },
      setLocation: (newLocation) =>
        set((state) => ({
          location: { ...state.location, ...newLocation },
        })),
      setCity: (city) =>
        set((state) => ({
          location: { ...state.location, city, area: '', lat: null, lng: null, isAutoDetected: false },
        })),
      setArea: (area) =>
        set((state) => ({
          location: { ...state.location, area },
        })),
      autoDetectLocation: async () => {
        if (!navigator.geolocation) {
          console.error('Geolocation is not supported by your browser');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // TODO: In a real app, you would reverse-geocode this to get the city/area.
            // For now, we'll store the coordinates and flag it as auto-detected.
            set((state) => ({
              location: {
                ...state.location,
                lat: latitude,
                lng: longitude,
                isAutoDetected: true,
              },
            }));
          },
          (error) => {
            console.error('Error detecting location', error);
          }
        );
      },
    }),
    {
      name: 'bookmytable-location-store', // key in local storage
    }
  )
);
