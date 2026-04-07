const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure cloudinary with values from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Save a base64 image to Cloudinary
 * @param {string} base64String - Base64 encoded image string
 * @param {string} folder - Folder name (category, product, blog, slider)
 * @returns {Promise<Object>} - { public_id, url }
 */
const saveImage = async (base64String, folder) => {
  try {
    // Determine the folder path in Cloudinary (e.g. CloneTopZone/Product)
    const folderPath = `CloneTopZone/${folder.charAt(0).toUpperCase() + folder.slice(1)}`;
    
    // Upload directly using Cloudinary's built-in base64 support
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folderPath,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Failed to save image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} public_id - The Cloudinary public_id
 * @param {string} folder - Folder name (category, product, blog, slider)
 */
const deleteImage = async (public_id, folder) => {
  try {
    if (!public_id) {
      return; // Skip if no public_id provided
    }

    // Destroy the image on Cloudinary
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.warn(`Failed to delete image: ${error.message}`);
  }
};

module.exports = {
  saveImage,
  deleteImage,
};