import apiClient from "../lib/api.js";

export function createRazorpayOrder(amount, currency = "INR") {
  return apiClient.post("/payments/create-order", { amount, currency });
}

export function verifyRazorpayPayment(paymentData) {
  return apiClient.post("/payments/verify", paymentData);
}
