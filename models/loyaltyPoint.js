const mongoose = require("mongoose");

const loyaltyPointSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0, // Điểm từ mua hàng (shop points)
    },
    gamePoints: {
      type: Number,
      default: 0, // Điểm từ minigame
    },
    lifetime: {
      type: Number,
      default: 0, // Tổng điểm từng kiếm được (tracking)
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    tierUpgradedAt: Date,
    nextTierPoints: {
      type: Number, // Điểm cần để lên tier tiếp theo
      default: 5000000, // 5M VND
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ["earn", "redeem", "expire", "bonus", "adjust"],
        },
        amount: Number,
        reason: String, // "Purchase order", "Redeem reward", ...
        reference: mongoose.Schema.Types.ObjectId,
        referenceModel: { type: String, enum: ["Order", "Reward", "Game"] },
        createdAt: { type: Date, default: Date.now },
        expiryDate: Date, // Khi nào điểm hết hạn
      },
    ],
    expiringPoints: { type: Number, default: 0 }, // Điểm sắp hết hạn (trong 30 ngày)
    referralCode: String,
    referredCount: { type: Number, default: 0 }, // Số lần được giới thiệu thành công
  },
  { timestamps: true }
);

// Index
loyaltyPointSchema.index({ balance: 1 });
loyaltyPointSchema.index({ tier: 1 });

module.exports = mongoose.model("LoyaltyPoint", loyaltyPointSchema);