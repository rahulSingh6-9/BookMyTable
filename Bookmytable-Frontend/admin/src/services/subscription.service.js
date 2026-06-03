import api from "../lib/api";

export function getSubscriptionPlans() {
  return api.get("/admin/subscriptions/plans");
}

export const createSubscriptionPlan = (data) => {
  // Proxied through gateway to restaurant service
  return api.post("/admin/subscriptions/plans", data);
};

export const updateSubscriptionPlan = (id, data) => {
  // Proxied through gateway to restaurant service
  return api.put(`/admin/subscriptions/plans/${id}`, data);
};

export const archiveSubscriptionPlan = (id) => {
  return api.put(`/admin/subscriptions/plans/${id}/archive`);
};

export const restoreSubscriptionPlan = (id) => {
  return api.put(`/admin/subscriptions/plans/${id}/restore`);
};

export function getActiveSubscriptions() {
  return api.get("/admin/subscriptions/active");
}

export function getBillingHistory() {
  return api.get("/admin/subscriptions/billing");
}

export function getOverridesHistory() {
  return api.get("/admin/subscriptions/overrides");
}

export function getDashboardStats() {
  return api.get("/admin/subscriptions/stats");
}

export function applySubscriptionOverride(data) {
  // Proxied through gateway to restaurant service
  return api.post("/admin/subscriptions/overrides", data);
}

