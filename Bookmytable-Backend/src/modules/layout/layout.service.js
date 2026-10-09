import DiningArea from '../../models/diningArea.model.js';
import LayoutProject from '../../models/layoutProject.model.js';
import Restaurant from '../../models/restaurant.model.js';

export const getDiningAreasService = async (branchId) => {
  const branch = await Restaurant.findById(branchId);
  if (!branch) {
    const error = new Error("Branch not found");
    error.status = 404;
    throw error;
  }

  const diningAreas = await DiningArea.find({
    branch: branchId,
    isDeleted: false,
    isActive: true,
  }).populate('activeLayoutId').sort({ createdAt: -1 });
   
  return diningAreas;
};

export const createDiningAreaService = async (branchId, userId, data) => {
  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  // 1. Create Dining Area metadata without layout id first
  const diningArea = await DiningArea.create({
    branch: branchId,
    brand: branch.brandId,
    name: data.name,
    floor: data.floor,
    type: data.type || "indoor",
    description: data.description,
    isActive: true,
  });

  // 2. Create LayoutProject with diningAreaId
  const defaultSections = data.defaultSections || [];
  
  const layoutProject = await LayoutProject.create({
    diningAreaId: diningArea._id,
    version: 1,
    canvasState: {
      sections: defaultSections,
      tables: [],
      presets: [],
      arrangementZones: [],
      connections: [],
      viewport: { x: 0, y: 0 },
      zoom: 1
    }
  });

  // 3. Link layout to dining area and save
  diningArea.activeLayoutId = layoutProject._id;
  await diningArea.save();

  return diningArea;
};

export const getLayoutProjectService = async (layoutId) => {
  const layoutProject = await LayoutProject.findById(layoutId);
  if (!layoutProject) {
    const error = new Error("Layout Project not found");
    error.status = 404;
    throw error;
  }
  return layoutProject;
};

export const updateLayoutProjectService = async (layoutId, data) => {
  const layoutProject = await LayoutProject.findById(layoutId);
  if (!layoutProject) {
    const error = new Error("Layout Project not found");
    error.status = 404;
    throw error;
  }

  // Expect data to contain canvasState
  if (data.canvasState) {
    layoutProject.canvasState = data.canvasState;
  }
  
  layoutProject.version += 1;
  await layoutProject.save();

  return layoutProject;
};

export const deleteDiningAreaService = async (diningAreaId) => {
  const diningArea = await DiningArea.findById(diningAreaId);
  if (!diningArea) {
    const error = new Error("Dining Area not found");
    error.status = 404;
    throw error;
  }

  diningArea.isDeleted = true;
  diningArea.isActive = false;
  await diningArea.save();

  return diningArea;
};
