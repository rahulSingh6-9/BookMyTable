import API from '../lib/api.js';

export const sendPhoneOTP = async (phone, purpose = 'restaurant_onboarding') => {
  try {
    const response = await API.post('/verification/send-phone-otp', { phone, purpose });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyPhoneOTP = async (phone, otp, purpose = 'restaurant_onboarding') => {
  try {
    const response = await API.post('/verification/verify-phone-otp', { phone, otp, purpose });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestBusinessEmailVerification = async (email) => {
  try {
    const response = await API.post('/onboarding/email/verify-request', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyBusinessEmailToken = async (token, email) => {
  try {
    const response = await API.post('/onboarding/email/verify', { token, email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
