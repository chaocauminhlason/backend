const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const Category = require("../models/category");
const Branch = require("../models/branch");
const BranchProduct = require("../models/branchProduct");

const { saveImage, deleteImage } = require("../config/uploadUtils");
const createProduct = (props) => {
  return new Promise(async (resolve, reject) => {
    const { name, image, category, des, price, discount, color } = props;
    try {
      const res = await Product.findOne({ name: name });
      if (res) {
        reject({
          success: false,
          mes: "Tên đã tồn tại",
        });
        return;
      }

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        reject({
          success: false,
          mes: "Danh mục không tồn tại",
        });
        return;
      }

      const uploadImagesPromises = image.map((img) => {
        return saveImage(img, "product");
      });
      const listImage = await Promise.all(uploadImagesPromises);
      const product = await Product.create({
        name: name,
        category: category,
        des: des,
        price: parseFloat(price),
        discount: parseFloat(discount),
        color: color.map((c) => ({
          color: c.color,
          quantity: parseInt(c.quantity),
        })),
        image: listImage.map((item) => ({
          public_id: item.public_id,
          url: item.url,
        })),
      });

      const activeBranches = await Branch.find({ status: "ACTIVE", isDeleted: false });
      
      const branchProductPromises = activeBranches.map(async (branch) => {
        const colorInventory = color.map((c) => ({
          color: c.color,
          quantity: parseInt(c.quantity),
          reserved: 0,
          available: parseInt(c.quantity),
        }));

        return BranchProduct.create({
          branch: branch._id,
          product: product._id,
          quantity: color.reduce((sum, c) => sum + parseInt(c.quantity), 0),
          colorInventory: colorInventory,
          price: parseFloat(price),
          discount: parseFloat(discount),
          isActive: true,
          isAvailableOnline: true,
        });
      });

      await Promise.all(branchProductPromises);

      resolve(product);
    } catch (e) {
      reject(e);
    }
  });
};

const getProducts = (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, limit, category, page = 1, minPrice, maxPrice } = options;
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;
      
      let query = {};
      
      if (name) {
        const regex = new RegExp(name, "i");
        query.name = regex;
      }
      
      if (category) {
        let categoryId = category;
        
        if (!category.match(/^[0-9a-fA-F]{24}$/)) {
          const foundCategory = await Category.findOne({ slug: category });
          if (foundCategory) {
            categoryId = foundCategory._id;
          } else {
            resolve({
              success: false,
              message: "Không tìm thấy danh mục",
            });
            return;
          }
        }
        query.category = categoryId;
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) {
          query.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice !== undefined) {
          query.price.$lte = parseFloat(maxPrice);
        }
      }
      
      const totalProducts = await Product.countDocuments(query);
      const product = await Product.find(query)
        .populate("category")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });
      
      if (product) {
        resolve({
          success: true,
          product,
          totalProducts,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalProducts / limitNumber),
        });
      } else {
        resolve({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
const findByIdOrSlug = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return await Product.findById(identifier);
  }
  return await Product.findOne({ slug: identifier });
};

const getProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await findByIdOrSlug(id);
      if (!product) {
        resolve({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
        return;
      }
      await product.populate("category");
      resolve({
        success: true,
        product,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await findByIdOrSlug(id);
      if (!product) {
        resolve({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
        return;
      }
      for (const el of product.image) {
        deleteImage(el.public_id, "product");
      }
      
      await BranchProduct.updateMany(
        { product: product._id },
        { $set: { isDeleted: true } }
      );
      
      await Product.findByIdAndDelete(product._id);
      resolve({
        success: true,
        message: "Sản phẩm đã được xóa thành công",
      });
    } catch (err) {
      reject(err);
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await findByIdOrSlug(id);
      if (!product) {
        resolve({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
        return;
      }

      const categoryExists = await Category.findById(data.category);
      if (!categoryExists) {
        resolve({
          success: false,
          message: "Danh mục không tồn tại",
        });
        return;
      }

      if (data?.image && data.image.length > 0 && typeof data.image[0] === "string" && data.image[0].startsWith("data:")) {
        for (const el of product.image) {
          deleteImage(el.public_id, "product");
        }
        const uploadImagesPromises = data.image.map((img) => {
          return saveImage(img, "product");
        });
        const listImage = await Promise.all(uploadImagesPromises);
        product.image = listImage.map((item) => ({
          public_id: item.public_id,
          url: item.url,
        }));
      }
      product.name = data.name;
      product.category = data.category;
      product.des = data.des;
      product.price = parseFloat(data.price);
      product.discount = parseFloat(data.discount);
      product.color = data.color.map((c) => ({
        color: c.color,
        quantity: parseInt(c.quantity),
      }));
      await product.save();

      const branchProducts = await BranchProduct.find({ 
        product: product._id, 
        isDeleted: false 
      });

      const updatePromises = branchProducts.map(async (bp) => {
        const newColorInventory = data.color.map((c) => {
          const existingColor = bp.colorInventory.find(ci => ci.color === c.color);
          return {
            color: c.color,
            quantity: parseInt(c.quantity),
            reserved: existingColor?.reserved || 0,
            available: parseInt(c.quantity) - (existingColor?.reserved || 0),
          };
        });

        bp.colorInventory = newColorInventory;
        bp.quantity = newColorInventory.reduce((sum, ci) => sum + ci.quantity, 0);
        bp.price = parseFloat(data.price);
        bp.discount = parseFloat(data.discount);
        bp.lastStockUpdate = Date.now();
        
        return bp.save();
      });

      await Promise.all(updatePromises);

      resolve({
        product,
      });
    } catch (err) {
      reject(err);
    }
  });
};
const createReviews = (productId, data, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { comment, rating } = data;
      const user = await User.findById(userId).select("name");
      const product = await Product.findById(productId);
      if (!product) {
        reject({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
        return;
      }
      const orders = await Order.find({
        user: userId,
        status: "Đã giao",
      }).populate("products.product");
      const checkOrder = orders.some((order) =>
        order.products.some((orderProduct) =>
          orderProduct.product.equals(product._id)
        )
      );
      if (!checkOrder) {
        reject({
          success: false,
          message: "Bạn chưa mua sản phẩm này",
        });
        return;
      }
      product.reviews.unshift({
        user: user,
        rating: rating,
        comment: comment,
      });
      const total =
        product.reviews.reduce((acc, cur) => acc + cur.rating, 0) /
        product.reviews.length;
      product.ratings = total;
      await product.save();
      resolve({
        success: true,
        product,
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  createReviews,
};
