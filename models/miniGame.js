const mongoose = require("mongoose");

const miniGameSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "spin_wheel",
        "scratch_card",
        "mystery_box",
        "quiz",
        "lucky_draw",
      ],
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },

    // Quy tắc chơi
    dailyLimit: {
      type: Number,
      default: 3, // Mỗi user chơi tối đa 3 lần/ngày
    },
    playLimitType: {
      type: String,
      enum: ["daily", "weekly", "unlimited"],
      default: "daily",
    },

    // Phần thưởng có sẵn
    rewards: [
      {
        id: String,
        prizeText: String, // "Giảm 50k"
        prize: {
          type: String,
          enum: ["voucher", "points", "discount"],
        },
        value: Number, // Số điểm hoặc giá trị voucher
        probability: Number, // 0-100%
        quantity: { type: Number, default: -1 }, // -1 = vô hạn
        color: String,
        icon: String,
        used: { type: Number, default: 0 }, // Bao nhiêu người đã nhận
      },
    ],

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },

    // Điều kiện chơi
    minimumOrderValue: { type: Number, default: 0 },
    requirePurchase: { type: Boolean, default: false },
    requireLogin: { type: Boolean, default: true },

    // Config cho các game khác nhau
    config: mongoose.Schema.Types.Mixed, // Lưu config tùy loại game

    totalPlayed: { type: Number, default: 0 },
    totalRewardGiven: { type: Number, default: 0 },
  },
  { timestamps: true }
);

miniGameSchema.index({ type: 1 });
miniGameSchema.index({ isActive: 1 });
miniGameSchema.index({ endDate: 1 });

module.exports = mongoose.model("MiniGame", miniGameSchema);