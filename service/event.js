const Event = require("../models/event");
const Product = require("../models/product");
const { saveImage, deleteImage } = require("../config/uploadUtils");

const createEvent = (props) => {
  return new Promise(async (resolve, reject) => {
    const { name, description, startDate, endDate, discountPercent, products, banner } = props;
    try {
      if (new Date(startDate) >= new Date(endDate)) {
        reject({
          success: false,
          mes: "Ngày kết thúc phải sau ngày bắt đầu",
        });
        return;
      }

      let bannerData = null;
      if (banner && typeof banner === "string" && banner.startsWith("data:")) {
        const uploadedImage = await saveImage(banner, "event");
        bannerData = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url,
        };
      }

      const event = await Event.create({
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discountPercent: parseFloat(discountPercent),
        products: products || [],
        banner: bannerData,
      });

      await event.populate("products");
      resolve(event);
    } catch (e) {
      reject(e);
    }
  });
};

const getEvents = (options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 10, active } = options;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      let query = {};
      if (active !== undefined) {
        query.isActive = active === true || active === "true";
      }

      const total = await Event.countDocuments(query);
      const events = await Event.find(query)
        .populate("products", "name slug price discount color image")
        .skip(skip)
        .limit(limitNum)
        .sort({ startDate: -1 });

      resolve({
        success: true,
        events,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getActiveEvents = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const events = await Event.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .populate("products", "name slug price discount color image")
        .sort({ endDate: 1 });

      resolve({
        success: true,
        events,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getEventById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findById(id).populate(
        "products",
        "name slug price discount color image"
      );
      if (!event) {
        reject({
          success: false,
          mes: "Sự kiện không tồn tại",
        });
        return;
      }
      resolve({
        success: true,
        event,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateEvent = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findById(id);
      if (!event) {
        reject({
          success: false,
          mes: "Sự kiện không tồn tại",
        });
        return;
      }

      if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
        reject({
          success: false,
          mes: "Ngày kết thúc phải sau ngày bắt đầu",
        });
        return;
      }

      if (data.banner && typeof data.banner === "string" && data.banner.startsWith("data:")) {
        if (event.banner?.public_id) {
          deleteImage(event.banner.public_id, "event");
        }
        const uploadedImage = await saveImage(data.banner, "event");
        event.banner = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url,
        };
      }

      event.name = data.name || event.name;
      event.description = data.description || event.description;
      event.startDate = data.startDate ? new Date(data.startDate) : event.startDate;
      event.endDate = data.endDate ? new Date(data.endDate) : event.endDate;
      event.discountPercent = data.discountPercent !== undefined ? parseFloat(data.discountPercent) : event.discountPercent;
      event.products = data.products || event.products;
      event.isActive = data.isActive !== undefined ? data.isActive : event.isActive;

      await event.save();
      await event.populate("products", "name slug price discount color image");

      resolve({
        success: true,
        event,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteEvent = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findById(id);
      if (!event) {
        reject({
          success: false,
          mes: "Sự kiện không tồn tại",
        });
        return;
      }

      if (event.banner?.public_id) {
        deleteImage(event.banner.public_id, "event");
      }

      await Event.findByIdAndDelete(id);

      resolve({
        success: true,
        mes: "Sự kiện đã được xóa",
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createEvent,
  getEvents,
  getActiveEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
