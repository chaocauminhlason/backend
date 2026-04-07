const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    phone: { type: String },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        color: { type: String, required: true },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    viewHistory: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
        duration: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    address: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    gameStats: { type: mongoose.Schema.Types.Mixed, default: {} },
    userPromoCodes: [
      {
        promoCode: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PromoCode",
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    canAccessBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
