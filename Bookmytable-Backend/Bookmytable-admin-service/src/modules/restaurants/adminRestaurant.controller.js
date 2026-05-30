import {
    getAllRestaurantsService,
    approveRestaurantService,
    suspendRestaurantService,
    rejectRestaurantService,
} from "./adminRestaurant.service.js";

export const getAllRestaurants = async (req, res, next) => {
    try {
        const { status } = req.query;

        const result = await getAllRestaurantsService({ status });
        console.log("getAllRestaurants", result)

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

export const rejectRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await rejectRestaurantService(id, req.user);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const approveRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await approveRestaurantService(id, req.user);

        res.status(200).json({
            success: true,
            message: "Restaurant approved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const suspendRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await suspendRestaurantService(id, req.user);


        res.status(200).json({
            success: true,
            message: "Restaurant suspended successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getRestaurantDetailsService } = await import("./adminRestaurant.service.js");
        const result = await getRestaurantDetailsService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantMetrics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getRestaurantMetricsService } = await import("./adminRestaurant.service.js");
        const result = await getRestaurantMetricsService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantTables = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getRestaurantTablesService } = await import("./adminRestaurant.service.js");
        const result = await getRestaurantTablesService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getRestaurantStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getRestaurantStaffService } = await import("./adminRestaurant.service.js");
        const result = await getRestaurantStaffService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};