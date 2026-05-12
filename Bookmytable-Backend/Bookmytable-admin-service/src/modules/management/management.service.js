import Admin from "../../models/admin.model.js";
import AdminLog from "../../models/adminLog.model.js";

export const listAdmins = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }

  const admins = await Admin.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Admin.countDocuments(filter);

  return { admins, total };
};

export const createAdmin = async (data) => {
  // Check if admin already exists
  const existing = await Admin.findOne({ 
    $or: [{ userId: data.userId }, { email: data.email }] 
  });
  
  if (existing) {
    throw new Error("Admin already exists with this ID or email");
  }

  return await Admin.create(data);
};

export const updateAdmin = async (id, updates) => {
  const admin = await Admin.findByIdAndUpdate(id, updates, { new: true });
  if (!admin) throw new Error("Admin not found");
  return admin;
};

export const deleteAdmin = async (id) => {
  const admin = await Admin.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!admin) throw new Error("Admin not found");
  return admin;
};

export const getAuditLogs = async ({ page, limit, adminId, action }) => {
  const skip = (page - 1) * limit;
  const filter = {};

  if (adminId) filter.adminId = adminId;
  if (action) filter.action = action;

  const logs = await AdminLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AdminLog.countDocuments(filter);

  return { logs, total };
};
