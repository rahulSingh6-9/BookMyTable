import DiscoveryRestaurant from "../../models/discovery.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";

export const handleDiscoveryRestaurantUpdate = async (event) => {
  const { data } = event;
  const restaurantId = data.restaurantId || data.id || data._id;
  const brandId = data.brandId;

  try {
    const brandEvents = [
      'brand.updated',
      'brand.updated.partial',
      'brand.deactivated',
      'brand.archived',
      'brand.restored'
    ];

    if (brandEvents.includes(event.topic) || brandEvents.includes(event.eventType) || brandEvents.includes(event.type)) {
      const restaurants = await RestaurantBranch.find({ brandId: data.id || data._id });
      for (const restaurant of restaurants) {
        await syncRestaurantToDiscovery(restaurant._id);
      }
      return;
    }

    // Handle Permanent Delete
    if (data.action === "PERMANENT_DELETE") {
      await DiscoveryRestaurant.findOneAndDelete({ restaurantId });
      console.log(`🗑️ [DiscoveryConsumer] Permanently deleted Discovery Read-Model for: ${restaurantId}`);
      return;
    }

    // Otherwise, just sync the specific restaurant
    if (restaurantId) {
      await syncRestaurantToDiscovery(restaurantId);
    }
  } catch (error) {
    console.error("Error syncing restaurant to discovery model:", error);
  }
};

const syncRestaurantToDiscovery = async (restaurantId) => {
  const restaurant = await RestaurantBranch.findById(restaurantId);
  if (!restaurant) return;

  const brand = await Brand.findById(restaurant.brandId);
  
  // Fetch settings to accurately determine booking features
  const { default: RestaurantSettings } = await import("../../models/restaurantSettings.model.js");
  const settings = await RestaurantSettings.findOne({ branch: restaurantId }).lean();

  const discoveryData = {
    restaurantId: restaurant._id,
    brandId: restaurant.brandId,
    name: restaurant.branchName || restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    
    city: restaurant.address?.city || restaurant.location?.city,
    area: restaurant.address?.area || restaurant.address?.addressLine1 || restaurant.location?.addressLine1,
    addressLine1: restaurant.address?.addressLine1 || restaurant.location?.addressLine1,
    
    location: restaurant.location,
    
    cuisines: restaurant.cuisines || restaurant.cuisineTypes || [],
    tags: restaurant.tags || [],
    
    averageRating: restaurant.averageRating || 0,
    totalReviews: restaurant.totalReviews || 0,
    
    logo: restaurant.logo,
    coverImage: restaurant.coverImage,
    phone: restaurant.contact?.primaryPhone?.number || restaurant.phone || "",
    
    costForTwo: restaurant.costForTwo,
    
    // Menu Stats mapping
    hasMenu: restaurant.menuStats?.hasMenu || false,
    popularCategories: restaurant.menuStats?.popularCategories || [],
    featuredItems: restaurant.menuStats?.featuredItemNames || [], 

    // Table / Booking Stats
    hasTables: restaurant.tableStats?.hasTables || false,
    reservationEnabled: settings?.autoAcceptBookings ?? false,

    
    status: restaurant.status,
    isActive: restaurant.isActive && !restaurant.isHiddenFromDiscovery && restaurant.status !== 'suspended' && restaurant.status !== 'blocked',
    isDeleted: restaurant.isDeleted,
    
    isFeatured: restaurant.isFeatured || false,
    discoveryRanking: restaurant.discoveryRanking || 0,
    isHiddenFromDiscovery: restaurant.isHiddenFromDiscovery || false,
  };

  await DiscoveryRestaurant.findOneAndUpdate(
    { restaurantId: restaurant._id },
    { $set: discoveryData },
    { upsert: true, new: true, runValidators: true }
  );
};
