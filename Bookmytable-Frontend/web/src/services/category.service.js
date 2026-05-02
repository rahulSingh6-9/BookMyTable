import apiClient from "../lib/api";

export const getCategories = async (restaurantId) => {
  return await apiClient.get(`/menu-categories/${restaurantId}`);
};

export const createCategory = async (restaurantId, data) => {
  return await apiClient.post(`/menu-categories/${restaurantId}`, data);
};

export const updateCategory = async (categoryId, data) => {
  return await apiClient.put(`/menu-categories/${categoryId}`, data);
};

export const deleteCategory = async (categoryId) => {
  return await apiClient.delete(`/menu-categories/${categoryId}`);
};
