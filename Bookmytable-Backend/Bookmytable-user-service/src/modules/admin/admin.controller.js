import { fetchAllUsersForAdmin } from "./admin.service.js" 


export const getAllUsers = async (req, res, next) => {
   try{
    const result = await getAllUsersService()

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        count: result.length,
        data: result,
    })

   } catch(error) {
    next(error)
   }
}


export const getAllUsersForAdmin = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await fetchAllUsersForAdmin({
      page: Number(page) || 1,
      limit: Number(limit) || 100,
    });

    res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

import User from "../../models/user.model.js";

export const internalSyncUser = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required for new accounts" });
      }
      user = await User.create({
        email,
        name,
        password,
        roles: [role || "customer"] 
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
