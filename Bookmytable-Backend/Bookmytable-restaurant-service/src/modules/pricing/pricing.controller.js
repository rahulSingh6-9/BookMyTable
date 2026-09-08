import * as pricingService from "./pricing.service.js";

export const getPricingConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    const config = await pricingService.getPricingConfig(branchId);
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePricingConfig = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { floor, diningAreaType, sectionType, price, password } = req.body;
    const userId = req.headers["x-user-id"];

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to update pricing" });
    }

    const config = await pricingService.updatePricingConfig(userId, branchId, {
      floor,
      diningAreaType,
      sectionType,
      price: Number(price),
      password
    });
    
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    if (error.message === "Invalid password") {
      return res.status(401).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.headers["x-user-id"];
    
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    await pricingService.validatePasswordOnly(userId, password);
    res.status(200).json({ success: true, message: "Password verified" });
  } catch (error) {
    if (error.message === "Invalid password") {
      return res.status(401).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePricingConfig = async (req, res) => {
  try {
    const { branchId, pricingId } = req.params;
    const { password } = req.body;
    const userId = req.headers["x-user-id"];

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to delete pricing" });
    }

    await pricingService.deletePricingConfig(userId, branchId, pricingId, password);
    res.status(200).json({ success: true, message: "Pricing deleted successfully" });
  } catch (error) {
    if (error.message === "Invalid password") {
      return res.status(401).json({ success: false, message: error.message });
    }
    if (error.message === "Pricing not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
