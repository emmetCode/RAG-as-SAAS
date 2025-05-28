/*import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import logger from "../logger/wiston.logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw", // for PDF
      folder: "pdf_uploads",
    });
    // file has been uploaded successfull

    await fs.unlink(localFilePath);
    return response;
  } catch (error) {
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkErr) {
      logger.warn("Failed to delete temp file:", unlinkErr.message);
    }

    // Let the calling code handle the failure properly
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export { uploadOnCloudinary };*/
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import logger from "../logger/wiston.logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const ext = path.extname(localFilePath).toLowerCase();

    // Dynamically determine resource type
    let resourceType = "image";
    if (ext === ".pdf" || ext === ".docx" || ext === ".txt" || ext === ".csv") {
      resourceType = "raw";
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: "uploads", // You can also customize folder by type or user
    });

    await fs.unlink(localFilePath); // Delete temp file after upload
    return response;
  } catch (error) {
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkErr) {
      logger.warn("Failed to delete temp file:", unlinkErr.message);
    }

    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export { uploadOnCloudinary };
