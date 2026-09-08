import api from "../lib/api";

export const getDiningAreas = (branchId) => {
  return api.get(`/layouts/branch/${branchId}/dining-areas`);
};

export const createDiningArea = (branchId, data) => {
  return api.post(`/layouts/branch/${branchId}/dining-areas`, data);
};

export const deleteDiningArea = (id) => {
  return api.delete(`/layouts/dining-areas/${id}`);
};

export const getLayoutProject = (layoutId) => {
  return api.get(`/layouts/projects/${layoutId}`);
};

export const updateLayoutProject = (layoutId, data) => {
  return api.put(`/layouts/projects/${layoutId}`, data);
};
