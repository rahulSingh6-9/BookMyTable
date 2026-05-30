import DiscoveryRestaurant from "../../models/discovery.model.js";
import MenuItem from "../../models/menuItem.model.js";
import MenuCategory from "../../models/menuCategory.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import Table from "../../models/table.model.js";

export const getHomepageSectionsData = async ({ city, area, lat, lng }) => {
  const baseQuery = { status: "approved", isActive: true, isDeleted: false };
  if (city) baseQuery.city = new RegExp(`^${city}$`, "i");
  if (area) baseQuery.area = new RegExp(`^${area}$`, "i");

  let geoQuery = null;
  if (lat && lng) {
    geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 15000, // 15km
        },
      },
    };
  }

  const queries = {
    "Trending Near You": geoQuery 
      ? DiscoveryRestaurant.find({ ...baseQuery, ...geoQuery }).sort({ totalReviews: -1, averageRating: -1 }).limit(10)
      : DiscoveryRestaurant.find(baseQuery).sort({ totalReviews: -1, averageRating: -1 }).limit(10),
    "Top Rated": DiscoveryRestaurant.find(baseQuery).sort({ averageRating: -1, totalReviews: -1 }).limit(10),
    "New Openings": DiscoveryRestaurant.find(baseQuery).sort({ createdAt: -1 }).limit(10),
    "Italian Delights": DiscoveryRestaurant.find({ ...baseQuery, cuisines: { $regex: /italian/i } }).limit(10),
    "Asian Flavors": DiscoveryRestaurant.find({ ...baseQuery, cuisines: { $regex: /asian|chinese|japanese|thai/i } }).limit(10),
  };

  const results = await Promise.all([
    queries["Trending Near You"],
    queries["Top Rated"],
    queries["New Openings"],
    queries["Italian Delights"],
    queries["Asian Flavors"]
  ]);

  return [
    { id: "trending", title: "Trending Near You", description: "Most popular places around", items: results[0] },
    { id: "top-rated", title: "Top Rated", description: "Highest rated by our diners", items: results[1] },
    { id: "new", title: "New Openings", description: "Freshly added to BookMyTable", items: results[2] },
    { id: "italian", title: "Italian Delights", description: "Premium italian dining experiences", items: results[3] },
    { id: "asian", title: "Asian Flavors", description: "Best of Asian cuisines", items: results[4] },
  ].filter(section => section.items.length > 0);
};

export const searchRestaurantsData = async ({ q, city, area, cuisine, lat, lng, page = 1, limit = 20 }) => {
  let query = { status: "approved", isActive: true, isDeleted: false };
  
  if (city) query.city = new RegExp(`^${city}$`, "i");
  if (area) query.area = new RegExp(`^${area}$`, "i");
  if (cuisine) query.cuisines = new RegExp(cuisine, "i");

  if (q) {
    query.$text = { $search: q };
  }

  // Apply distance sorting if requested and no text search score is used
  let sortObj = { averageRating: -1 };
  if (q) {
    sortObj = { score: { $meta: "textScore" } };
  }

  if (lat && lng && !q) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
      },
    };
    sortObj = {}; // $near automatically sorts by distance
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const results = await DiscoveryRestaurant.find(query, q ? { score: { $meta: "textScore" } } : {})
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await DiscoveryRestaurant.countDocuments(query);

  return { results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
};

export const getCitiesData = async () => {
  const cities = await DiscoveryRestaurant.distinct("city", {
    status: "approved",
    isActive: true,
    isDeleted: false,
  });
  
  // Sort alphabetically
  cities.sort((a, b) => a.localeCompare(b));
  return cities;
};

export const getAreasData = async (city) => {
  const areas = await DiscoveryRestaurant.distinct("area", {
    city: new RegExp(`^${city}$`, "i"),
    status: "approved",
    isActive: true,
    isDeleted: false,
  });

  return areas.filter(Boolean).sort(); // Remove nulls/empty and sort alphabetically
};

export const getRestaurantDetailsData = async (idParam) => {
  // The frontend might pass either the DiscoveryRestaurant _id or the original restaurantId.
  const restaurant = await DiscoveryRestaurant.findOne({
    $or: [
      { _id: idParam },
      { restaurantId: idParam }
    ]
  }).lean();

  console.log(`[getRestaurantDetailsData] Found restaurant:`, restaurant ? restaurant.name : "null");
  console.log('restaurant: ', restaurant)
  if (!restaurant) return null;

  // Now use the actual restaurantId (Branch ID) to find settings
  const resolvedBranchId = restaurant.restaurantId;

  // Attempt to fetch advanced settings for weekly schedule and cancellation policy
  let settings = null;
  try {
    settings = await RestaurantSettings.findOne({ branch: resolvedBranchId }).lean();

    console.log("settings 👆: ", settings)
  } catch (e) {
    console.warn(`Could not load settings for restaurant ${resolvedBranchId}`);
  }

  // Fetch active tables for availability engine
  let tables = [];
  try {
    tables = await Table.find({ branch: resolvedBranchId, isActive: true, status: { $nin: ["inactive", "maintenance"] } }).lean();
    console.log("tables count:", tables.length)
    console.log("table 👆: ", tables)
  } catch (e) {
    console.warn(`Could not load tables for restaurant ${resolvedBranchId}`);
  }

  return {
    ...restaurant,
    settings: settings || null,
    tables: tables || [],
  };
};

export const getRestaurantMenuData = async (idParam) => {
  // First find the restaurant to get its branch ID
  const restaurant = await DiscoveryRestaurant.findOne({
    $or: [
      { _id: idParam },
      { restaurantId: idParam }
    ]
  }).lean();
  
  if (!restaurant) return null;

  const resolvedBranchId = restaurant.restaurantId;
  console.log("branch type:", typeof resolvedBranchId);
  console.log("restaurant: 👉", restaurant)
  console.log("rstaurant id: 👉 ", restaurant.restaurantId)


  const categories = await MenuCategory.find({ branch: resolvedBranchId, isActive: true })
    .sort({ order: 1 })
    .lean();
  
  const items = await MenuItem.find({ branch: resolvedBranchId, isActive: true })
    .populate("category", "name order")
    .lean();

     console.log("get menu category: ", categories )
     console.log("get menu items: ", items )

  return { categories, items };
};
