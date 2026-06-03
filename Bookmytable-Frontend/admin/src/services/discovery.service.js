import api from "../lib/api";

export const getDiscoveryRestaurants = async () => {
    const response = await api.get("/admin/discovery/restaurants");
    return response.data.data;
};

export const featureRestaurant = async (id, isFeatured, ranking) => {
    const response = await api.put(`/admin/discovery/restaurants/${id}/feature`, { isFeatured, ranking });
    return response.data;
};

export const hideRestaurant = async (id, isHidden) => {
    const response = await api.put(`/admin/discovery/restaurants/${id}/hide`, { isHidden });
    return response.data;
};
