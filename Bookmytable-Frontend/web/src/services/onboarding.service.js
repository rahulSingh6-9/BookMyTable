import API from '../lib/api.js';

export const saveOnboardingDraft = async (currentStep, formData, additionalData = {}) => {
  try {
    const response = await API.post('/onboarding/draft', { 
      currentStep, 
      formData,
      ...additionalData 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to save onboarding draft:', error);
    throw error;
  }
};

export const getOnboardingDraft = async () => {
  try {
    const response = await API.get('/onboarding/draft');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.error('Failed to fetch onboarding draft:', error);
    throw error;
  }
};

export const deleteOnboardingDraft = async () => {
  try {
    const response = await API.delete('/onboarding/draft');
    return response.data;
  } catch (error) {
    console.error('Failed to delete onboarding draft:', error);
    throw error;
  }
};

export const uploadOnboardingMedia = async (files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await API.post('/onboarding/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload onboarding media:', error);
    throw error;
  }
};

export const submitOnboardingDraft = async (payload) => {
  try {
    const response = await API.post('/onboarding/submit', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to submit onboarding draft:', error);
    throw error;
  }
};

export const getMyBrands = async () => {
  try {
    const response = await API.get('/brands/my-brands');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user brands:', error);
    throw error;
  }
};
