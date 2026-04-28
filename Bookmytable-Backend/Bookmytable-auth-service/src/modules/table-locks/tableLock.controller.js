import {
  createLockService,
  releaseLockService,
  getLocksByRestaurantService,
} from "./tableLock.service.js";

export const createLock = async (req, res, next) => {
  try {
    const lock = await createLockService(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Table locked 🔒",
      data: lock,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseLock = async (req, res, next) => {
  try {
    await releaseLockService(req.params.tableId, req.user._id);

    res.status(200).json({
      success: true,
      message: "Lock released",
    });
  } catch (error) {
    next(error);
  }
};

export const getLocksByRestaurant = async (req, res, next) => {
  try {
    const locks = await getLocksByRestaurantService(
      req.params.restaurantId
    );

    res.status(200).json({
      success: true,
      data: locks,
    });
  } catch (error) {
    next(error);
  }
};