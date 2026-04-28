import { getAvailableTablesService } from "./availability.service.js";

export const getAvailableTables = async (req, res, next) => {
  try {
    const { restaurantId, date, startTime, endTime } = req.query;

    const tables = await getAvailableTablesService({
      restaurantId,
      date,
      startTime,
      endTime,
    });

    res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};