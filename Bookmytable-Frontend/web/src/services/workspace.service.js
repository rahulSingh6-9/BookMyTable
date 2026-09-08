import apiClient from "../lib/api";

/**
 * Fetch detailed branding details for the active restaurant branch and brand.
 */
export async function getBrandingDetails() {
  const response = await apiClient.get("/business-workspace/branding");
  return response.data;
}

/**
 * Update branding details for the active branch and brand.
 * @param {object} data - Updated branding properties
 */
export async function updateBrandingDetails(data) {
  const response = await apiClient.put("/business-workspace/branding", data);
  return response.data;
}

/**
 * Fetch detailed verification overview, timeline, and statuses for active branch.
 */
export async function getVerificationDetails() {
  const response = await apiClient.get("/business-workspace/verification");
  return response.data;
}

/**
 * Confirm phone number verification status on active branch after successful OTP input.
 */
export async function confirmPhoneVerificationStatus() {
  const response = await apiClient.post("/business-workspace/verification/phone/confirm");
  return response.data;
}

/**
 * Upload brand logo directly to dedicated endpoint.
 */
export async function uploadBrandLogo(brandId, file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.patch(`/brands/${brandId}/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Upload restaurant logo directly to dedicated endpoint.
 */
export async function uploadRestaurantLogo(restaurantId, file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.patch(`/restaurants/${restaurantId}/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Upload restaurant cover image directly to dedicated endpoint.
 */
export async function uploadRestaurantCover(restaurantId, file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.patch(`/restaurants/${restaurantId}/cover-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Upload image(s) to restaurant gallery directly to dedicated endpoint.
 */
export async function uploadRestaurantGallery(restaurantId, files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });
  const response = await apiClient.post(`/restaurants/${restaurantId}/gallery`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Delete an image from restaurant gallery directly to dedicated endpoint.
 */
export async function deleteRestaurantGalleryImage(restaurantId, imageIdOrUrl) {
  const encodedId = encodeURIComponent(imageIdOrUrl);
  const response = await apiClient.delete(`/restaurants/${restaurantId}/gallery/${encodedId}`);
  return response.data;
}

