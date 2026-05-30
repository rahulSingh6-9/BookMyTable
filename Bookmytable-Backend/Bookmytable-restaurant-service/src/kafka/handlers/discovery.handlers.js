import DiscoveryRestaurant from "../../models/discovery.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";

export const handleDiscoveryRestaurantUpdate = async (event) => {
  const { data } = event;
  const restaurantId = data.restaurantId || data.id || data._id;
  const brandId = data.brandId;

  try {
    // If it's a brand update, we need to update all restaurants belonging to that brand
    if (event.topic === 'brand.updated' || event.eventType === 'brand.updated' || event.type === 'brand.updated') {
      const restaurants = await RestaurantBranch.find({ brandId: data.id || data._id });
      for (const restaurant of restaurants) {
        await syncRestaurantToDiscovery(restaurant._id);
      }
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
    
    logo: restaurant.logo || brand?.logo,
    coverImage: restaurant.coverImage || brand?.coverImage,
    phone: restaurant.contact?.primaryPhone?.number || restaurant.phone || "",
    
    costForTwo: restaurant.costForTwo,
    
    status: restaurant.status,
    isActive: restaurant.isActive,
    isDeleted: restaurant.isDeleted,
  };

  await DiscoveryRestaurant.findOneAndUpdate(
    { restaurantId: restaurant._id },
    { $set: discoveryData },
    { upsert: true, new: true, runValidators: true }
  );
};
