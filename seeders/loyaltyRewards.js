const LoyaltyReward = require("../models/loyaltyReward");

const seedLoyaltyRewards = async () => {
  try {
    const existingRewards = await LoyaltyReward.find();
    
    if (existingRewards.length > 0) {
      return;
    }

    const rewards = [
      {
        name: "Voucher 50.000đ",
        description: "Giảm 50.000đ cho đơn hàng từ 500.000đ",
        pointRequired: 5000,
        rewardType: "voucher",
        value: 50000,
        quantity: -1,
        minTier: "bronze",
        category: "discount",
        position: 1,
        isActive: true,
      },
      {
        name: "Voucher 100.000đ",
        description: "Giảm 100.000đ cho đơn hàng từ 1.000.000đ",
        pointRequired: 10000,
        rewardType: "voucher",
        value: 100000,
        quantity: -1,
        minTier: "silver",
        category: "discount",
        position: 2,
        isActive: true,
      },
      {
        name: "Voucher 200.000đ",
        description: "Giảm 200.000đ cho đơn hàng từ 2.000.000đ",
        pointRequired: 20000,
        rewardType: "voucher",
        value: 200000,
        quantity: -1,
        minTier: "gold",
        category: "discount",
        position: 3,
        isActive: true,
      },
      {
        name: "Voucher 500.000đ",
        description: "Giảm 500.000đ cho đơn hàng từ 5.000.000đ",
        pointRequired: 50000,
        rewardType: "voucher",
        value: 500000,
        quantity: -1,
        minTier: "platinum",
        category: "discount",
        position: 4,
        isActive: true,
      },
      {
        name: "Miễn phí vận chuyển",
        description: "Miễn phí ship cho đơn hàng bất kỳ",
        pointRequired: 2000,
        rewardType: "shipping",
        value: 30000,
        quantity: -1,
        minTier: "bronze",
        category: "shipping",
        position: 5,
        isActive: true,
      },
      {
        name: "Tặng 5000 điểm",
        description: "Nhận ngay 5000 điểm vào tài khoản",
        pointRequired: 4000,
        rewardType: "points",
        value: 5000,
        quantity: 100,
        minTier: "silver",
        category: "points",
        position: 6,
        isActive: true,
      },
    ];

    await LoyaltyReward.insertMany(rewards);
    console.log("✓ Loyalty rewards seeded successfully");
  } catch (error) {
    console.error("✗ Error seeding loyalty rewards:", error.message);
    throw error;
  }
};

module.exports = { seedLoyaltyRewards };
