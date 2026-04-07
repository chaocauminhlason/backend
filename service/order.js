const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const LoyaltyPointService = require("./loyaltyPoint");
const Settings = require("../models/settings");
const Branch = require("../models/branch");
const BranchProduct = require("../models/branchProduct");

const createOrder = (props) => {
  return new Promise(async (resolve, reject) => {
    const { user, products, totalPrice, finalPrice, discountAmount, promoCode, payments, branch, orderType } = props;
    try {
      let branchId = branch;
      
      if (!branchId) {
        const defaultBranch = await Branch.findOne({ 
          status: "ACTIVE", 
          isDeleted: false,
          type: "HEADQUARTER" 
        }).sort({ createdAt: 1 });
        
        if (!defaultBranch) {
          const anyActiveBranch = await Branch.findOne({ 
            status: "ACTIVE", 
            isDeleted: false 
          }).sort({ createdAt: 1 });
          branchId = anyActiveBranch?._id;
        } else {
          branchId = defaultBranch._id;
        }
      }

      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          reject({
            success: false,
            mes: `Sản phẩm ${item.product} không tồn tại`,
          });
          return;
        }

        if (branchId) {
          const branchProduct = await BranchProduct.findOne({
            branch: branchId,
            product: item.product,
            isDeleted: false,
            isActive: true,
          });

          if (!branchProduct) {
            reject({
              success: false,
              mes: `Sản phẩm ${product.name} không có sẵn tại chi nhánh này`,
            });
            return;
          }

          const colorItem = branchProduct.colorInventory.find((c) => c.color === item.color);
          if (!colorItem || colorItem.available < item.quantity) {
            reject({
              success: false,
              mes: `Sản phẩm ${product.name} màu ${item.color} không đủ số lượng tại chi nhánh`,
            });
            return;
          }
        } else {
          const selectedColor = product.color.find((c) => c.color === item.color);
          if (!selectedColor || selectedColor.quantity < item.quantity) {
            reject({
              success: false,
              mes: `Sản phẩm ${product.name} màu ${item.color} không đủ số lượng`,
            });
            return;
          }
        }
      }

      const res = await Order.create({
        user: user._id,
        branch: branchId,
        orderType: orderType || "ONLINE",
        products: products,
        totalPrice: parseFloat(totalPrice),
        finalPrice: parseFloat(finalPrice || totalPrice),
        discountAmount: parseFloat(discountAmount || 0),
        promoCode: promoCode || null,
        payments: payments,
      });

      const response = await User.findById(user._id);
      if (!res) {
        reject({
          success: false,
          mes: "Có lỗi xảy ra",
        });
        return;
      }

      if (promoCode) {
        const PromoCode = require("../models/promoCode");
        const promo = await PromoCode.findOne({ code: promoCode });
        if (promo) {
          const userUsageIndex = promo.usedBy.findIndex(
            (u) => u.user.toString() === user._id.toString()
          );
          if (userUsageIndex >= 0) {
            promo.usedBy[userUsageIndex].usedCount += 1;
            promo.usedBy[userUsageIndex].usedAt = new Date();
          } else {
            promo.usedBy.push({
              user: user._id,
              usedCount: 1,
              usedAt: new Date(),
            });
          }
          promo.usageCount += 1;
          await promo.save();
        }
      }

      response.cart = [];
      await response.save();
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};

const getOrders = {
  getOrders: async ({ page, limit }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const skip = (page - 1) * limit;
        const orders = await Order.find()
          .populate({
            path: "user",
            select: "name phone address email"
          })
          .populate({
            path: "products.product",
            select: "name price image color"
          })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean()
          .exec();
        if (!orders) {
          reject({
            success: false,
            mes: "Có lỗi xảy ra",
          });
          return;
        }

        resolve(orders);
      } catch (e) {
        reject({
          success: false,
          mes: e.message,
        });
      }
    });
  },
  countOrders: async () => {
    try {

      return await Order.countDocuments();
    } catch (e) {
      throw new Error("Có lỗi xảy ra khi đếm số lượng đơn hàng.");
    }
  },
};

const getOrderUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Order.find({ user: id }).populate("products.product");
      if (!res) {
        reject({
          success: false,
          mes: "Có lỗi xảy ra",
        });
        return;
      }
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};
const getOrdersDasboard = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Order.find().select('-user');

      if (!res) {
        reject({
          success: false,
          mes: "Có lỗi xảy ra",
        });
        return;
      }
      resolve(res);
    } catch (e) {
      console.log(e)
      reject(e);

    }
  });
};
const cancleOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Order.findById(id).populate("products.product");
      if (!res) {
        reject({
          success: false,
          mes: "Không tìm thấy đơn hàng",
        });
        return;
      }

      if (res.status !== "Chờ xử lý") {
        reject({
          success: false,
          mes: "Chỉ có thể hủy đơn hàng chờ xử lý",
        });
        return;
      }

      if (res.branch) {
        for (const el of res.products) {
          const branchProduct = await BranchProduct.findOne({
            branch: res.branch,
            product: el.product._id,
            isDeleted: false,
          });
          
          if (branchProduct) {
            const colorItem = branchProduct.colorInventory.find((c) => c.color === el.color);
            if (colorItem) {
              colorItem.quantity += el.quantity;
              colorItem.available = colorItem.quantity - colorItem.reserved;
            }
            branchProduct.lastStockUpdate = Date.now();
            await branchProduct.save();
          }

          const product = await Product.findById(el.product._id);
          if (product) {
            const selectedColor = product.color.find((c) => c.color === el.color);
            if (selectedColor) {
              selectedColor.quantity += el.quantity;
            }
            product.sold_out -= el.quantity;
            await product.save();
          }
        }
      } else {
        for (const el of res.products) {
          const product = await Product.findById(el.product._id);
          if (product) {
            const selectedColor = product.color.find((c) => c.color === el.color);
            if (selectedColor) {
              selectedColor.quantity += el.quantity;
            }
            product.sold_out -= el.quantity;
            await product.save();
          }
        }
      }

      res.status = "Đã hủy";
      await res.save();
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};
const deleteOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Order.findById(id);
      if (!res) {
        reject({
          success: false,
          mes: "Không tìm thấy đơn hàng",
        });
        return;
      }
      await Order.findByIdAndDelete(id);
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};
const updateStatusOrder = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id).populate({
        path: "products.product",
        model: "Product",
        select: "name price color",
      });
      if (!order) {
        reject({
          success: false,
          mes: "Không tìm thấy đơn hàng",
        });
        return;
      }

      if (order.status === "Chờ xử lý" && data.status === "Đã xác nhận") {
        if (order.branch) {
          let checkquantity = true;
          for (const el of order.products) {
            const branchProduct = await BranchProduct.findOne({
              branch: order.branch,
              product: el.product._id,
              isDeleted: false,
            });
            
            if (!branchProduct) {
              checkquantity = false;
              break;
            }
            
            const colorItem = branchProduct.colorInventory.find((c) => c.color === el.color);
            if (!colorItem || colorItem.available < el.quantity) {
              checkquantity = false;
              break;
            }
          }
          
          if (!checkquantity) {
            reject({
              success: false,
              mes: "không đủ số lượng tại chi nhánh",
            });
            return;
          }

          for (const el of order.products) {
            const branchProduct = await BranchProduct.findOne({
              branch: order.branch,
              product: el.product._id,
              isDeleted: false,
            });
            
            if (branchProduct) {
              const colorItem = branchProduct.colorInventory.find((c) => c.color === el.color);
              if (colorItem) {
                colorItem.quantity -= el.quantity;
                colorItem.available = colorItem.quantity - colorItem.reserved;
              }
              
              branchProduct.stats.totalSold += el.quantity;
              branchProduct.stats.lastSoldDate = Date.now();
              branchProduct.lastStockUpdate = Date.now();
              
              await branchProduct.save();
            }

            const product = await Product.findById(el.product._id);
            if (product) {
              const selectedColor = product.color.find((c) => c.color === el.color);
              if (selectedColor) {
                selectedColor.quantity -= el.quantity;
              }
              product.sold_out += el.quantity;
              await product.save();
            }
          }
        } else {
          let checkquantity = true;
          for (const el of order.products) {
            const product = await Product.findById(el.product._id);
            const selectedColor = product.color.find((c) => c.color === el.color);
            if (!selectedColor || selectedColor.quantity < el.quantity) {
              checkquantity = false;
              break;
            }
          }
          if (!checkquantity) {
            reject({
              success: false,
              mes: "không đủ số lượng",
            });
            return;
          }

          for (const el of order.products) {
            const product = await Product.findById(el.product._id);
            const selectedColor = product.color.find((c) => c.color === el.color);
            if (selectedColor) {
              selectedColor.quantity -= el.quantity;
            }
            product.sold_out += el.quantity;
            await product.save();
          }
        }
      }

      const previousStatus = order.status;
      order.status = data.status;
      await order.save();

      if (previousStatus !== "Đã giao" && data.status === "Đã giao") {
        try {
          const settings = await Settings.findOne();
          if (settings?.features?.loyaltyProgram?.enabled) {
            const orderValue = order.finalPrice || order.totalPrice;
            await LoyaltyPointService.addPointsFromOrder(
              order.user,
              orderValue,
              order._id
            );
          }
        } catch (loyaltyError) {
          console.log("Error adding loyalty points:", loyaltyError);
        }
      }

      resolve(order);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderUser,
  cancleOrder,
  deleteOrder,
  updateStatusOrder,
  getOrdersDasboard
};
