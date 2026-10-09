import apiClient from "../lib/api.js";

/**
 * Fetch dynamic homepage sections based on location context.
 * @param {{ city?: string, lat?: number, lng?: number }} params 
 */
export function getHomepageSections(params) {
  return apiClient.get("/discovery/homepage-sections", { params });
}

/**
 * Search restaurants
 * @param {{ q?: string, city?: string, area?: string, cuisine?: string, lat?: number, lng?: number, page?: number, limit?: number }} params 
 */
export function searchRestaurants(params) {
  return apiClient.get("/discovery/search", { params });
}

/**
 * Fetch distinct cities
 */
export function getCities() {
  return apiClient.get("/discovery/cities");
}

/**
 * Fetch distinct areas for a city
 * @param {string} city 
 */
export function getAreas(city) {
  return apiClient.get("/discovery/areas", { params: { city } });
}

/**
 * Fetch detailed restaurant information
 * @param {string} id 
 */
export function getRestaurantDetails(id) {
  return apiClient.get(`/discovery/${id}`);
}

/**
 * Fetch restaurant menu
 * @param {string} id 
 */
export function getRestaurantMenu(id) {
  return apiClient.get(`/discovery/${id}/menu`);
}

/**
 * Fetch nearby restaurants using geographic coordinates and radius
 * @param {{ lat: number, lng: number, radius?: number, limit?: number, cuisine?: string, minRating?: number, sort?: string }} params
 */
export function getNearbyRestaurants(params) {
  return apiClient.get("/discovery/nearby", { params });
}

