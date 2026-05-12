import { getUserMembershipsService } from "./membership.service.js";

export const getMyMemberships = async (req, res, next) => {
  try {

    const userId = req.user.id;

    const memberships = await getUserMembershipsService(userId);

    return res.status(200).json({
      success: true,
      data: memberships,
    });

  } catch (error) {
    next(error);
  }
};