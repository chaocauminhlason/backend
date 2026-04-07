const mongoose = require("mongoose");

const loyaltyRewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // VD: "500k Voucher"
    description: String,
    pointRequired: {
      type: Number,
      required: true, // Cần bao nhiêu điểm để đổi
    },
    rewardType: {
      type: String,
      enum: ["voucher", "discount", "product", "shipping", "points"],
      required: true,
    },
    value: { type: Number }, // Giá trị voucher/discount
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
    },
    quantity: { type: Number, default: 100 }, // Số lượng reward
    used: { type: Number, default: 0 },
    minTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    isActive: { type: Boolean, default: true },
    image: String,
    category: {
      type: String,
      enum: [
        "discount",
        "shipping",
        "product",
        "points",
        "special"],
      default: "discount",
    },
    expiryDate: Date,
    position: { type: Number, default: 0 }, // Vị trí hiển thị
  },
  { timestamps: true }
);

loyaltyRewardSchema.index({ rewardType: 1 });
loyaltyRewardSchema.index({ minTier: 1 });
loyaltyRewardSchema.index({ isActive: 1 });

module.exports = mongoose.model("LoyaltyReward", loyaltyRewardSchema);