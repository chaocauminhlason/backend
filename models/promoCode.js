const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true, // VD: 10 (10%) hoặc 50000 (50k VND)
    },
    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn hàng tối thiểu
    },
    maxDiscount: {
      type: Number, // Giảm tối đa
      default: null,
    },
    usageLimit: {
      type: Number, // Số lần dùng tối đa toàn bộ
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number, // Mỗi user dùng tối đa bao nhiêu lần
      default: 1,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedCount: { type: Number, default: 1 },
        usedAt: { type: Date, default: Date.now },
        redeemedAt: { type: Date }, // Track when redeemed as reward
      },
    ],
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    description: String,
    pointsCost: {
      type: Number,
      default: null,
    },
    pointType: {
      type: String,
      enum: ["shop", "game"],
      default: "shop",
    },
    redemptionCooldown: {
      type: Number, // Cooldown in hours between redemptions of same source
      default: 24, // Default 24 hours
    },
    source: {
      // Nguồn: game, loyalty, admin, etc.
      type: String,
      enum: ["admin", "game", "loyalty", "referral", "special"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Index
promoCodeSchema.index({ expiryDate: 1 });
promoCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model("PromoCode", promoCodeSchema);