import AdminLog from "../../../models/adminLog.model.js";
import User from "../../../models/user.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import SystemLog from "../../../models/systemLog.model.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { action, adminId, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (adminId) filter.adminId = adminId;

    const logs = await AdminLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Enrich logs with names for frontend display
    const enrichedLogs = await Promise.all(logs.map(async (log) => {
      const enriched = { ...log };
      
      // 1. Performed By (Admin)
      if (log.adminId) {
        const admin = await User.findById(log.adminId).select("name email roles").lean();
        enriched.performedBy = admin ? (admin.name || admin.email) : log.adminId;
        enriched.role = admin ? (admin.roles?.[0] || "admin") : "admin";
      }

      // 2. Restaurant Info (if target is restaurant)
      if (log.targetId) {
        const restaurant = await Restaurant.findById(log.targetId).select("branchName name").lean();
        if (restaurant) {
          enriched.restaurantInfo = { name: restaurant.branchName || restaurant.name };
          enriched.restaurant = restaurant._id.toString();
        }
      }

      return enriched;
    }));

    const total = await AdminLog.countDocuments(filter);

    res.json({
      success: true,
      data: enrichedLogs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const { service, level, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (service) filter.service = service;
    if (level) filter.level = level;

    const logs = await SystemLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await SystemLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
