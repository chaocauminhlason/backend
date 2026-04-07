const mongoose = require("mongoose");

const orderStatus = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPED: "Đã chuyển hàng",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    orderType: {
      type: String,
      enum: ["ONLINE", "WALK_IN", "PHONE", "MOBILE_APP"],
      default: "ONLINE",
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        color: { type: String, required: true },
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String },
    payments: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.orderStatus = orderStatus;
