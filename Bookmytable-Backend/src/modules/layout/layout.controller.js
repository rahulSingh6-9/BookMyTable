import * as layoutService from "./layout.service.js";

export const getDiningAreas = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const diningAreas = await layoutService.getDiningAreasService(branchId);
    res.status(200).json({
      success: true,
      message: "Dining Areas retrieved successfully",
      data: diningAreas,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const createDiningArea = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const userId = req.user.id;
    const diningArea = await layoutService.createDiningAreaService(branchId, userId, req.body);
    res.status(201).json({
      success: true,
      message: "Dining Area created successfully",
      data: diningArea,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || "Bad Request",
    });
  }
};

export const deleteDiningArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    await layoutService.deleteDiningAreaService(id);
    res.status(200).json({
      success: true,
      message: "Dining Area deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getLayoutProject = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    const layoutProject = await layoutService.getLayoutProjectService(layoutId);
    res.status(200).json({
      success: true,
      message: "Layout Project retrieved successfully",
      data: layoutProject,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateLayoutProject = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    const layoutProject = await layoutService.updateLayoutProjectService(layoutId, req.body);
    res.status(200).json({
      success: true,
      message: "Layout Project updated successfully",
      data: layoutProject,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
