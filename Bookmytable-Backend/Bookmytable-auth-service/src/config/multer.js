import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bookmytable",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const upload = multer({ storage });