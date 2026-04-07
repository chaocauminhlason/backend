const { saveImage, deleteImage } = require("../config/uploadUtils");
const Slider = require("../models/slider");
const createSlider = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageData = saveImage(image, "slider");
      const slider = Slider.create({
        image: {
          public_id: imageData.public_id,
          url: imageData.url,
        },
      });
      resolve(slider.then((res) => res));
    } catch (e) {
      reject(e);
    }
  });
};
const getSlider = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.find();
      if (!slider) {
        reject({
          success: false,
          mes: "Không tìm thấy",
        });
        return;
      }

      resolve({
        slider,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const updateSlider = (id, { image }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findById(id);
      if (image.includes("/uploads/")) {
        return;
      }
      deleteImage(slider.image.public_id, "slider");
      const imageData = saveImage(image, "slider");
      slider.image = {
        public_id: imageData.public_id,
        url: imageData.url,
      };
      await slider.save();
      if (!slider) {
        reject({
          success: false,
          mes: "Không tìm thấy",
        });
        return;
      }

      resolve(slider.then((res) => res));
    } catch (e) {
      reject(e);
    }
  });
};
const deleteSlider = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findById(id);
      deleteImage(slider.image.public_id, "slider");
      const checkdelete = await Slider.findByIdAndDelete(id);
      if (!checkdelete) {
        reject({
          success: false,
          mes: "Không tìm thấy",
        });
        return;
      }

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
  createSlider,
  getSlider,
  updateSlider,
  deleteSlider,
};
