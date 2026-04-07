const { saveImage, deleteImage } = require("../config/uploadUtils");
const Category = require("../models/category");
const createCategory = (name, image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Category.findOne({ name: name });
      if (res) {
        reject({
          success: false,
          mes: "Tên đã tồn tại",
        });
        return;
      }
      const imageData = saveImage(image, "category");
      const category = Category.create({
        name: name,
        image: {
          public_id: imageData.public_id,
          url: imageData.url,
        },
      });
      resolve(category.then((res) => res));
    } catch (e) {
      reject(e);
    }
  });
};
const getCategory = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.find();
      if (!category) {
        reject({
          success: false,
          mes: "Không tìm thấy",
        });
        return;
      }

      resolve({
        category,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const findByIdOrSlug = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return await Category.findById(identifier);
  }
  return await Category.findOne({ slug: identifier });
};

const updateCategory = (id, props) => {
  return new Promise(async (resolve, reject) => {
    const { image, name } = props;
    try {
      const category = await findByIdOrSlug(id);
      if (!category) {
        reject({
          success: false,
          mes: "Không tìm thấy danh mục",
        });
        return;
      }
      if (image && image.includes("data:")) {
        deleteImage(category.image.public_id, "category");
        const imageData = saveImage(image, "category");
        category.image = {
          public_id: imageData.public_id,
          url: imageData.url,
        };
      }
      category.name = name;
      await category.save();
      resolve({
        success: true,
        category,
      });
    } catch (e) {
      reject({
        success: false,
        mes: e.message,
      });
    }
  });
};

const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await findByIdOrSlug(id);
      if (!category) {
        reject({
          success: false,
          mes: "Không tìm thấy danh mục",
        });
        return;
      }
      deleteImage(category.image.public_id, "category");
      await Category.findByIdAndDelete(category._id);

      resolve({
        success: true,
        mes: "Xóa thành công",
      });
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
