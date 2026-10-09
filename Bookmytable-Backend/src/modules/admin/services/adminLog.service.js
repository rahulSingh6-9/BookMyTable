import AdminLog from "../../../models/adminLog.model.js";

export const createAdminLog = async (data) => {
  try {
    return await AdminLog.create(data);
  } catch (err) {
    console.error("Error creating admin log:", err.message);
  }
};
