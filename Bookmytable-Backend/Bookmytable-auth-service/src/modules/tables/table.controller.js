import {
  createTableService,
  getTablesByRestaurantService,
  deleteTableService,
  updateTableStatusService,
} from "./table.service.js";

export const createTable = async (req, res, next) => {
  try {
    const table = await createTableService(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const getTablesByRestaurant = async (req, res, next) => {
  try {
    const tables = await getTablesByRestaurantService(
      req.params.restaurantId
    );

    res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    await deleteTableService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Table deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const table = await updateTableStatusService(
      req.params.id,
      req.body.status,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Table status updated",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};