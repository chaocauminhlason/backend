const mongoose = require("mongoose");

const gamePlaySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MiniGame",
      required: true,
    },
    reward: {
      prizeText: String,
      prize: {
        type: String,
        enum: ["voucher", "points", "discount"],
      },
      value: Number,
    },
    prizeId: String, // ID của reward trong game
    pointsEarned: Number,
    voucherCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
    },
    status: {
      type: String,
      enum: ["completed", "claimed", "expired"],
      default: "completed",
    },
    playedAt: { type: Date, default: Date.now },
    claimedAt: Date,
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    },
  },
  { timestamps: true }
);

gamePlaySchema.index({ user: 1, game: 1, playedAt: -1 });
gamePlaySchema.index({ status: 1 });
gamePlaySchema.index({ expiryDate: 1 });

module.exports = mongoose.model("GamePlay", gamePlaySchema);