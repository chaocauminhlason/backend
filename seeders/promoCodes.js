const PromoCode = require("../models/promoCode");

const seedPromoCodes = async () => {
  try {
    await PromoCode.deleteMany({});

    const expiryDate30Days = new Date();
    expiryDate30Days.setDate(expiryDate30Days.getDate() + 30);

    const expiryDate60Days = new Date();
    expiryDate60Days.setDate(expiryDate60Days.getDate() + 60);

    const promoCodes = [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 100000,
        usageLimit: 100,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Mã giảm 10% cho khách hàng mới",
        source: "admin",
        usedBy: [],
      },
      {
        code: "SUMMER2024",
        discountType: "percentage",
        discountValue: 15,
        minOrderValue: 1000000,
        maxDiscount: 200000,
        usageLimit: 50,
        perUserLimit: 2,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Mã giảm giá mùa hè 2024",
        source: "admin",
        usedBy: [],
      },
      {
        code: "FREESHIP",
        discountType: "fixed",
        discountValue: 30000,
        minOrderValue: 300000,
        maxDiscount: null,
        usageLimit: 200,
        perUserLimit: 3,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Miễn phí vận chuyển 30k",
        source: "admin",
        usedBy: [],
      },
      {
        code: "REWARD5",
        discountType: "percentage",
        discountValue: 5,
        minOrderValue: 500000,
        maxDiscount: 50000,
        usageLimit: 999,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Giảm 5% cho đơn hàng từ 500k",
        pointsCost: 100,
        source: "loyalty",
        usedBy: [],
      },
      {
        code: "REWARD10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 1000000,
        maxDiscount: 150000,
        usageLimit: 999,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Giảm 10% cho đơn hàng từ 1 triệu",
        pointsCost: 300,
        source: "loyalty",
        usedBy: [],
      },
      {
        code: "REWARD15",
        discountType: "percentage",
        discountValue: 15,
        minOrderValue: 2000000,
        maxDiscount: 300000,
        usageLimit: 999,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Giảm 15% cho đơn hàng từ 2 triệu",
        pointsCost: 500,
        source: "loyalty",
        usedBy: [],
      },
      {
        code: "REWARD50K",
        discountType: "fixed",
        discountValue: 50000,
        minOrderValue: 500000,
        maxDiscount: null,
        usageLimit: 999,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Giảm 50k cho đơn hàng từ 500k",
        pointsCost: 200,
        source: "loyalty",
        usedBy: [],
      },
      {
        code: "REWARD100K",
        discountType: "fixed",
        discountValue: 100000,
        minOrderValue: 1000000,
        maxDiscount: null,
        usageLimit: 999,
        perUserLimit: 1,
        expiryDate: expiryDate60Days,
        isActive: true,
        description: "Giảm 100k cho đơn hàng từ 1 triệu",
        pointsCost: 400,
        source: "loyalty",
        usedBy: [],
      },
      {
        code: "VIP20",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 3000000,
        maxDiscount: 500000,
        usageLimit: 20,
        perUserLimit: 1,
        expiryDate: expiryDate30Days,
        isActive: true,
        description: "Mã VIP giảm 20% cho đơn 3 triệu",
        source: "special",
        usedBy: [],
      },
    ];

    const result = await PromoCode.insertMany(promoCodes);

    return result;
  } catch (error) {
    console.error("✗ Error seeding promo codes:", error.message);
    throw error;
  }
};

module.exports = { seedPromoCodes };
