import apiClient from "../lib/api";

export const getMenuItems = async (restaurantId, categoryId = null) => {
  const url = `/menu-items/${restaurantId}${categoryId ? `?categoryId=${categoryId}` : ""}`;
  return await apiClient.get(url);
};

export const createMenuItem = async (restaurantId, data) => {
  return await apiClient.post(`/menu-items/${restaurantId}`, data);
};

export const updateMenuItem = async (itemId, data) => {
  return await apiClient.put(`/menu-items/${itemId}`, data);
};

export const deleteMenuItem = async (itemId) => {
  return await apiClient.delete(`/menu-items/${itemId}`);
};
