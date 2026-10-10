import DiscoveryRestaurant from "../../models/discovery.model.js";
import MenuItem from "../../models/menuItem.model.js";
import MenuCategory from "../../models/menuCategory.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import Table from "../../models/table.model.js";

export const getHomepageSectionsData = async ({ city, area, lat, lng }) => {
  const baseQuery = { status: "approved", isActive: true, isDeleted: false };
  if (city && city.trim()) baseQuery.city = new RegExp(`^${city.trim()}$`, "i");
  if (area && area.trim()) baseQuery.area = new RegExp(`^${area.trim()}$`, "i");

  let geoQuery = null;
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (
    !isNaN(parsedLat) &&
    !isNaN(parsedLng) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180
  ) {
    geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parsedLng, parsedLat],
          },
          $maxDistance: 15000, // 15km
        },
      },
    };
  }

  const queries = {
    "Trending Near You": geoQuery 
      ? DiscoveryRestaurant.find({ ...baseQuery, ...geoQuery }).limit(10)
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
    sortObj = null; // $near automatically sorts by distance, MongoDB forbids combining it with .sort()
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let queryBuilder = DiscoveryRestaurant.find(query, q ? { score: { $meta: "textScore" } } : {});
  
  if (sortObj) {
    queryBuilder = queryBuilder.sort(sortObj);
  }

  const results = await queryBuilder
    .skip(skip)
    .limit(parseInt(limit));

  const total = await DiscoveryRestaurant.countDocuments(query);

  return { results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
};

export const getCitiesData = async () => {
  const [discoveryCities, branchAddressCities, branchLocationCities] = await Promise.all([
    DiscoveryRestaurant.distinct("city", {
      status: "approved",
      isActive: true,
      isDeleted: false,
    }),
    RestaurantBranch.distinct("address.city", {
      status: "approved",
      isActive: true,
    }),
    RestaurantBranch.distinct("location.city", {
      status: "approved",
      isActive: true,
    }),
  ]);

  const uniqueCities = [...new Set([
    ...discoveryCities,
    ...branchAddressCities,
    ...branchLocationCities,
  ])].filter(Boolean).map((c) => c.trim()).filter(Boolean);

  uniqueCities.sort((a, b) => a.localeCompare(b));
  return uniqueCities;
};

export const getAreasData = async (city) => {
  if (!city) return [];
  const cityRegex = new RegExp(`^${city}$`, "i");

  const [discoveryAreas, branchAddressAreas, branchLocationAreas] = await Promise.all([
    DiscoveryRestaurant.distinct("area", {
      city: cityRegex,
      status: "approved",
      isActive: true,
      isDeleted: false,
    }),
    RestaurantBranch.distinct("address.area", {
      $or: [{ "address.city": cityRegex }, { "location.city": cityRegex }],
      status: "approved",
      isActive: true,
    }),
    RestaurantBranch.distinct("location.area", {
      $or: [{ "address.city": cityRegex }, { "location.city": cityRegex }],
      status: "approved",
      isActive: true,
    }),
  ]);

  const uniqueAreas = [...new Set([
    ...discoveryAreas,
    ...branchAddressAreas,
    ...branchLocationAreas,
  ])].filter(Boolean).map((a) => a.trim()).filter(Boolean);

  uniqueAreas.sort((a, b) => a.localeCompare(b));
  return uniqueAreas;
};

export const getRestaurantDetailsData = async (idParam) => {
  // The frontend might pass either the DiscoveryRestaurant _id or the original restaurantId.
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idParam);
  const query = { isActive: true, isDeleted: false };
  if (isObjectId) {
    query.$or = [{ _id: idParam }, { restaurantId: idParam }];
  } else {
    query.slug = idParam;
  }

  const restaurant = await DiscoveryRestaurant.findOne(query).lean();

  console.log(`[getRestaurantDetailsData] Found restaurant:`, restaurant ? restaurant.name : "null");
  console.log('restaurant: ', restaurant)
  if (!restaurant) return null;

  // Now use the actual restaurantId (Branch ID) to find settings
  const resolvedBranchId = restaurant.restaurantId;

  // Attempt to fetch advanced settings for weekly schedule and cancellation policy
  let settings = null;
  try {
    settings = await RestaurantSettings.findOne({ branch: resolvedBranchId }).lean();
    
    // The frontend expects openingHours inside settings or on the root. 
    // Fetch it from the native RestaurantBranch model.
    const { default: RestaurantBranch } = await import("../../models/restaurant.model.js");
    const branch = await RestaurantBranch.findById(resolvedBranchId).select("openingHours bookingSettings images").lean();
    
    if (settings && branch) {
      settings.openingHours = branch.openingHours;
      settings.bookingSettings = branch.bookingSettings;
    }
    
    // Attach gallery images to the discovery restaurant object
    if (branch && branch.images) {
      restaurant.images = branch.images;
    }
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
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idParam);
  const query = { isActive: true, isDeleted: false };
  if (isObjectId) {
    query.$or = [{ _id: idParam }, { restaurantId: idParam }];
  } else {
    query.slug = idParam;
  }

  const restaurant = await DiscoveryRestaurant.findOne(query).lean();
  
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

  return { categories, items };
};

export const checkReservationLimitData = async (idParam) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idParam);
  const query = isObjectId ? { $or: [{ _id: idParam }, { restaurantId: idParam }] } : { slug: idParam };
  const restaurant = await DiscoveryRestaurant.findOne(query).lean();
  
  if (!restaurant) throw new Error("Restaurant not found");

  const brandId = restaurant.brandId;
  const { checkLimit } = await import("../subscriptions/subscription.service.js");
  const { SubscriptionUsage } = await import("../../models/subscriptionUsage.model.js");

  const usage = await SubscriptionUsage.findOne({ brandId }).lean();
  const currentReservations = usage?.reservationsThisMonth || 0;

  // We can just throw PLAN_LIMIT_EXCEEDED directly using checkLimit
  await checkLimit(brandId, "maxReservationsPerMonth", currentReservations);

  return { currentReservations };
};

/**
 * Sync an individual restaurant branch to the Discovery projection.
 */
export const syncRestaurantToDiscovery = async (restaurantId) => {
  try {
    const { default: RestaurantBranch } = await import("../../models/restaurant.model.js");
    const { default: Brand } = await import("../../models/brand.model.js");
    const { default: RestaurantSettings } = await import("../../models/restaurantSettings.model.js");
    const { default: mongoose } = await import("mongoose");

    const raw = await mongoose.connection.collection("restaurantbranches").findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
    });
    if (!raw) return;

    const restaurant = (await RestaurantBranch.findById(restaurantId).lean()) || raw;
    const brandId = restaurant.brandId || raw.brandId || raw.brand;
    const brand = brandId ? await Brand.findById(brandId) : null;
    const settings = await RestaurantSettings.findOne({ branch: restaurantId }).lean();

    const branchName = restaurant.branchName || raw.branchName || raw.name || "Restaurant";
    const city = restaurant.address?.city || raw.address?.city || restaurant.location?.city || raw.location?.city || "";
    const area = restaurant.address?.area || raw.address?.area || restaurant.location?.area || raw.location?.area || restaurant.address?.addressLine1 || raw.location?.addressLine1 || "";
    const addressLine1 = restaurant.address?.addressLine1 || raw.address?.addressLine1 || restaurant.location?.addressLine1 || raw.location?.addressLine1 || "";

    const coordinates = restaurant.location?.coordinates || raw.location?.coordinates;
    const validLocation = coordinates && Array.isArray(coordinates) && coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])
      ? { type: "Point", coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])] }
      : { type: "Point", coordinates: [0, 0] };

    const discoveryData = {
      restaurantId: restaurant._id,
      brandId: brandId,
      name: branchName,
      slug: restaurant.slug || raw.slug,
      description: restaurant.description || raw.description || "",
      city: city,
      area: area,
      addressLine1: addressLine1,
      location: validLocation,
      cuisines: restaurant.cuisines || raw.cuisines || restaurant.cuisineTypes || raw.cuisineTypes || [],
      tags: restaurant.tags || raw.tags || [],
      averageRating: restaurant.averageRating ?? raw.averageRating ?? 0,
      totalReviews: restaurant.totalReviews ?? raw.totalReviews ?? 0,
      logo: restaurant.logo || raw.logo || "",
      coverImage: restaurant.coverImage || raw.coverImage || (raw.images && raw.images[0]) || "",
      phone: restaurant.contact?.primaryPhone?.number || raw.contactInfo?.primaryPhone?.number || restaurant.phone || raw.phone || "",
      costForTwo: restaurant.costForTwo ?? raw.costForTwo ?? null,
      hasMenu: restaurant.menuStats?.hasMenu || false,
      popularCategories: restaurant.menuStats?.popularCategories || [],
      featuredItems: restaurant.menuStats?.featuredItemNames || [],
      hasTables: restaurant.tableStats?.hasTables || false,
      reservationEnabled: settings?.autoAcceptBookings ?? raw.services?.reservationEnabled ?? false,
      status: restaurant.status || raw.status || "pending",
      isActive: (restaurant.isActive ?? raw.isActive ?? true) && !restaurant.isHiddenFromDiscovery && restaurant.status !== "suspended" && restaurant.status !== "blocked",
      isDeleted: restaurant.isDeleted || raw.isDeleted || false,
      isFeatured: restaurant.isFeatured || false,
      discoveryRanking: restaurant.discoveryRanking || 0,
      isHiddenFromDiscovery: restaurant.isHiddenFromDiscovery || false,
    };

    await DiscoveryRestaurant.findOneAndUpdate(
      { restaurantId: restaurant._id },
      { $set: discoveryData },
      { upsert: true, returnDocument: "after", runValidators: false }
    );
  } catch (error) {
    console.error("❌ Error syncing restaurant to discovery model:", error.message);
  }
};

/**
 * Sync all existing restaurant branches to ensure discovery read-model is complete.
 */
export const syncAllRestaurantsToDiscovery = async () => {
  try {
    const { default: mongoose } = await import("mongoose");
    const rColl = mongoose.connection.collection("restaurantbranches");
    const branches = await rColl.find({}).toArray();
    for (const b of branches) {
      await syncRestaurantToDiscovery(b._id);
    }
  } catch (error) {
    console.error("❌ Error during bulk discovery sync:", error.message);
  }
};

/**
 * Fetch nearby restaurants using MongoDB 2dsphere $geoNear aggregation
 */
export const getNearbyRestaurantsData = async ({
  lat,
  lng,
  radius = 10000,
  limit = 20,
  cuisine,
  minRating,
  sort = "nearest",
}) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("Invalid latitude. Must be a valid number between -90 and 90.");
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Invalid longitude. Must be a valid number between -180 and 180.");
  }

  let parsedRadius = parseInt(radius);
  if (isNaN(parsedRadius) || parsedRadius <= 0) parsedRadius = 10000;
  parsedRadius = Math.max(500, Math.min(parsedRadius, 50000)); // Cap between 500m and 50km

  let parsedLimit = parseInt(limit);
  if (isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 20;
  parsedLimit = Math.max(1, Math.min(parsedLimit, 50));

  const matchQuery = {
    status: "approved",
    isActive: true,
    isDeleted: false,
    // Exclude unmapped dummy coordinate (0, 0)
    "location.coordinates": { $ne: [0, 0] },
  };

  if (cuisine && cuisine !== "All") {
    matchQuery.cuisines = new RegExp(cuisine, "i");
  }

  if (minRating && !isNaN(parseFloat(minRating)) && parseFloat(minRating) > 0) {
    matchQuery.averageRating = { $gte: parseFloat(minRating) };
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        distanceField: "distanceMeters",
        maxDistance: parsedRadius,
        spherical: true,
        query: matchQuery,
      },
    },
    {
      $addFields: {
        distanceMeters: { $round: ["$distanceMeters", 0] },
        distance: "$distanceMeters",
      },
    },
  ];

  if (sort === "rating") {
    pipeline.push({ $sort: { averageRating: -1, distanceMeters: 1 } });
  }

  pipeline.push({ $limit: parsedLimit });

  const restaurants = await DiscoveryRestaurant.aggregate(pipeline);
  return restaurants;
};



