import { 
    getAllRestaurantsService, 
    approveRestaurant as approveRestaurantService,
    suspendRestaurant as suspendRestaurantService
} from '../services/admin.service.js'

export const getAllRestaurants = async (req, res, next) => {
    try {
        const { status } = req.query;
        console.log(`[AdminController] GET /admin/restaurants — query:`, req.query);

        const result = await getAllRestaurantsService({ status });

        res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            count: result.length,
            data: result,
        });

    } catch (error) {
        next(error);
    }
};

export const approveRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await approveRestaurantService(id);
        
        res.status(200).json({
            success: true,
            message: "Restaurant approved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const suspendRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await suspendRestaurantService(id);
        
        res.status(200).json({
            success: true,
            message: "Restaurant suspended successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}