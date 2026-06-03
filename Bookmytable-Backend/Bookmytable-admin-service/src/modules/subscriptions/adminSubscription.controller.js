import * as service from "./adminSubscription.service.js";

export const getPlans = async (req, res) => {
  try {
    const plans = await service.getPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getActiveSubscriptions = async (req, res) => {
  try {
    const subs = await service.getActiveSubscriptions();
    res.status(200).json({ success: true, data: subs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getBillingHistory = async (req, res) => {
  try {
    const billing = await service.getBillingHistory();
    res.status(200).json({ success: true, data: billing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getOverridesHistory = async (req, res) => {
  try {
    const overrides = await service.getOverridesHistory();
    res.status(200).json({ success: true, data: overrides });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await service.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const adminContext = { id: req.user.id, roles: req.user.roles };
    const authHeader = req.headers.authorization;
    const plan = await service.createPlanService(req.body, adminContext, authHeader);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const adminContext = { id: req.user.id, roles: req.user.roles };
    const authHeader = req.headers.authorization;
    const plan = await service.updatePlanService(id, req.body, adminContext, authHeader);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
};

export const archivePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const adminContext = { id: req.user.id, roles: req.user.roles };
    const authHeader = req.headers.authorization;
    const plan = await service.archivePlanService(id, adminContext, authHeader);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
};

export const restorePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const adminContext = { id: req.user.id, roles: req.user.roles };
    const authHeader = req.headers.authorization;
    const plan = await service.restorePlanService(id, adminContext, authHeader);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
};

export const applyOverride = async (req, res) => {
  try {
    const adminContext = { id: req.user.id, roles: req.user.roles };
    const authHeader = req.headers.authorization;
    const result = await service.applyOverrideService(req.body, adminContext, authHeader);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
};
