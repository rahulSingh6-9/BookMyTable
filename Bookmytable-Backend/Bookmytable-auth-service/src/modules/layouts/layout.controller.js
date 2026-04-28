import {
  createLayoutService,
  getLayoutServices,
  updateLayoutService,
} from "./layout.service.js";

export const createLayout = async (req, res, next) => {
  try {
    const layout = await createLayoutService(
      req.body.restaurantId,
      req.body.layoutData
    );

    res.status(201).json({
      success: true,
      message: "Layout created",
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};

export const getLayout = async (req, res, next) => {
  try {
    const layout = await getLayoutServices(req.params.restaurantId);

    res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLayout = async (req, res, next) => {
  try {
    const layout = await updateLayoutService(
      req.params.restaurantId,
      req.body.layoutData
    );

    res.status(200).json({
      success: true,
      message: "Layout updated",
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};