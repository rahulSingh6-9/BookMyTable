import {
    getAllBrandsService,
    approveBrandService,
    suspendBrandService,
    rejectBrandService,
    getBrandDetailsService
} from "./adminBrand.service.js";

export const getAllBrands = async (req, res, next) => {
    try {
        const { status } = req.query;
        const result = await getAllBrandsService({ status });

        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getBrandDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getBrandDetailsService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        if (error.message === "RESYNC_REQUIRED") {
            return res.status(404).json({ error: "RESYNC_REQUIRED", message: "Read model is missing or stale." });
        }
        next(error);
    }
};

export const approveBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await approveBrandService(id, req.user.id);
        res.status(200).json({ success: true, message: "Brand approved", data: result });
    } catch (error) {
        next(error);
    }
};

export const suspendBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await suspendBrandService(id, req.user.id);
        res.status(200).json({ success: true, message: "Brand suspended", data: result });
    } catch (error) {
        next(error);
    }
};

export const rejectBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await rejectBrandService(id, req.user.id);
        res.status(200).json({ success: true, message: "Brand rejected", data: result });
    } catch (error) {
        next(error);
    }
};

export const getBrandRestaurants = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getBrandRestaurantsService } = await import("./adminBrand.service.js");
        const result = await getBrandRestaurantsService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getBrandMetrics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { getBrandMetricsService } = await import("./adminBrand.service.js");
        const result = await getBrandMetricsService(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
