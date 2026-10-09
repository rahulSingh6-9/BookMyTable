import * as DiscoveryService from "./discovery.service.js";

// @route   GET /api/v1/discovery/homepage-sections
// @desc    Get aggregated sections for homepage
export const getHomepageSections = async (req, res) => {
  try {
    const sections = await DiscoveryService.getHomepageSectionsData(req.query);
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error("Discovery getHomepageSections Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @route   GET /api/v1/discovery/search
// @desc    Search restaurants by text, area, cuisine, city
export const searchRestaurants = async (req, res) => {
  try {
    const data = await DiscoveryService.searchRestaurantsData(req.query);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        total: data.total,
        page: data.page,
        pages: data.pages
      }
    });
  } catch (error) {
    console.error("Discovery searchRestaurants Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @route   GET /api/v1/discovery/cities
// @desc    Get a list of distinct cities where active restaurants exist
export const getCities = async (req, res) => {
  try {
    const cities = await DiscoveryService.getCitiesData();
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error("Discovery getCities Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @route   GET /api/v1/discovery/areas
// @desc    Get all distinct areas for a city
export const getAreas = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const areas = await DiscoveryService.getAreasData(city);
    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    console.error("❌ Error fetching areas:", error);
    res.status(500).json({ success: false, message: "Failed to fetch areas" });
  }
};

// @route   GET /api/v1/discovery/:id
// @desc    Get detailed restaurant information for public discovery
export const getRestaurantDetails = async (req, res) => {
  try {
    const idParam = req.params.id;
    console.log(`[getRestaurantDetails] Received idParam: "${idParam}"`);

    const data = await DiscoveryService.getRestaurantDetailsData(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error fetching restaurant details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurant details" });
  }
};

// @route   GET /api/v1/discovery/:id/menu
// @desc    Get restaurant menu grouped by category
export const getRestaurantMenu = async (req, res) => {
  try {
    const idParam = req.params.id;

    const data = await DiscoveryService.getRestaurantMenuData(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error fetching restaurant menu:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurant menu" });
  }
};

// @route   GET /api/v1/discovery/:id/limits/reservations
// @desc    Check if a restaurant brand can accept more reservations
export const getRestaurantReservationLimits = async (req, res) => {
  try {
    const data = await DiscoveryService.checkReservationLimitData(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(error.status || (error.code === "PLAN_LIMIT_EXCEEDED" ? 403 : 500)).json({ 
      success: false, 
      message: error.message, 
      code: error.code 
    });
  }
};

// @route   POST /api/v1/discovery/:id/limits/reservations/increment
// @desc    Increment the reservation usage count
export const incrementRestaurantReservationCount = async (req, res) => {
  try {
    await DiscoveryService.incrementReservationUsageData(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to increment usage" });
  }
};

// @route   GET /api/discovery/nearby
// @route   GET /api/restaurants/nearby
// @desc    Get nearby restaurants within a geographic radius using 2dsphere index
export const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius, limit, cuisine, minRating, sort } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and longitude (lng) query parameters are required.",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Must be a valid number between -90 and 90.",
      });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Must be a valid number between -180 and 180.",
      });
    }

    const restaurants = await DiscoveryService.getNearbyRestaurantsData({
      lat: latitude,
      lng: longitude,
      radius,
      limit,
      cuisine,
      minRating,
      sort,
    });

    res.status(200).json({
      success: true,
      data: restaurants,
      count: restaurants.length,
      location: { lat: latitude, lng: longitude },
      radiusMeters: parseInt(radius) || 10000,
    });
  } catch (error) {
    console.error("Discovery getNearbyRestaurants Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch nearby restaurants",
    });
  }
};


