import apiClient from "../lib/api";

export const getTables = async (restaurantId) => {
  return await apiClient.get(`/tables/${restaurantId}`);
};

export const getRestaurantTables = getTables;


export const createTable = async (restaurantId, data) => {
  return await apiClient.post(`/tables/${restaurantId}`, data);
};

export const updateTable = async (tableId, data) => {
  return await apiClient.put(`/tables/${tableId}`, data);
};

export const deleteTable = async (tableId) => {
  return await apiClient.delete(`/tables/${tableId}`);
};