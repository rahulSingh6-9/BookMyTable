import Layout from "../../models/layout.model.js";

export const createLayoutService = async (restaurantId, layoutData) => {
    return await Layout.create({
        restaurant: restaurantId,
        layoutData, 
    })
} 

export const getLayoutServices = async (restaurantId) => {
    return await Layout.findOne({ restaurant: restaurantId})
}

export const updateLayoutService = async (restaurantId, layoutData) => {
    return await Layout.findOneAndUpdate(
        { restaurant: restaurantId },
        { layoutData },
        { new: true } 
    )
}