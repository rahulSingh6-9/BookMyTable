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
