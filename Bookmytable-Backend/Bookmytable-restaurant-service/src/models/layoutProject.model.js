import mongoose from "mongoose";

const layoutProjectSchema = new mongoose.Schema(
  {
    diningAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiningArea",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    canvasState: {
      diningAreas: { type: Array, default: [] },
      sections: { type: Array, default: [] },
      tables: { type: Array, default: [] },
      presets: { type: Array, default: [] },
      arrangementZones: { type: Array, default: [] },
      connections: { type: Array, default: [] },
      viewport: { 
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
      },
      zoom: { type: Number, default: 1 }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LayoutProject", layoutProjectSchema);
