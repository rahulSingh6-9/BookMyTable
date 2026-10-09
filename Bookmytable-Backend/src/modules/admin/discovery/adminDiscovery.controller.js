import { getDiscoveryRestaurantsService, featureRestaurantService, hideRestaurantService } from "./adminDiscovery.service.js";

// @desc    Get all restaurants for discovery management
// @route   GET /api/admin/discovery/restaurants
// @access  Private (Admin - brands.manage)
export const getDiscoveryRestaurants = async (req, res, next) => {
    try {
        const restaurants = await getDiscoveryRestaurantsService(req.query);
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle feature status of a restaurant
// @route   PUT /api/admin/discovery/restaurants/:id/feature
// @access  Private (Admin - brands.manage)
export const featureRestaurant = async (req, res, next) => {
    try {
        const result = await featureRestaurantService(req.params.id, req.user, req.body.isFeatured, req.body.ranking);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle hide status of a restaurant
// @route   PUT /api/admin/discovery/restaurants/:id/hide
// @access  Private (Admin - brands.manage)
export const hideRestaurant = async (req, res, next) => {
    try {
        const result = await hideRestaurantService(req.params.id, req.user, req.body.isHidden);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
