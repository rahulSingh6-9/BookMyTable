import { getLogsService } from "./log.service.js";

export const getLogsController = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const logs = await getLogsService({
      restaurantId,
      action: req.query.action,
      performedBy: req.query.performedBy,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};