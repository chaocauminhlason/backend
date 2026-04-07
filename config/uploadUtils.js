const fs = require("fs");
const path = require("path");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads");
const subdirs = ["category", "product", "blog", "slider"];

subdirs.forEach((subdir) => {
  const dir = path.join(uploadsDir, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Save a base64 image to local storage
 * @param {string} base64String - Base64 encoded image string
 * @param {string} folder - Folder name (category, product, blog, slider)
 * @returns {Object} - { public_id, url }
 */
const saveImage = (base64String, folder) => {
  try {
    // Extract base64 data
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 image format");
    }

    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${folder}_${timestamp}_${random}.png`;

    // Save file
    const filepath = path.join(uploadsDir, folder, filename);
    fs.writeFileSync(filepath, buffer);

    return {
      public_id: filename.replace(".png", ""),
      url: `/uploads/${folder}/${filename}`,
    };
  } catch (error) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

/**
 * Delete an image from local storage
 * @param {string} public_id - The filename without extension
 * @param {string} folder - Folder name (category, product, blog, slider)
 */
const deleteImage = (public_id, folder) => {
  try {
    if (!public_id || !folder) {
      return; // Skip if no public_id provided
    }

    const filename = `${public_id}.png`;
    const filepath = path.join(uploadsDir, folder, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.warn(`Failed to delete image: ${error.message}`);
  }
};

module.exports = {
  saveImage,
  deleteImage,
};