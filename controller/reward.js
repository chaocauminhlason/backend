const User = require("../models/user");
const PromoCode = require("../models/promoCode");
const LoyaltyPoint = require("../models/loyaltyPoint");

const getRewardOptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

    const rewardOptions = await PromoCode.find({
      pointsCost: { $exists: true, $ne: null, $gt: 0 },
      isActive: true,
      isPublic: { $ne: true },
    }).select('_id code description pointsCost pointType discountType discountValue minOrderValue maxDiscount source');

    const formattedOptions = rewardOptions.map(reward => ({
      _id: reward._id,
      name: reward.code,
      description: reward.description || `Mã giảm giá ${reward.discountValue}${reward.discountType === 'percentage' ? '%' : 'đ'}`,
      pointsCost: reward.pointsCost,
      pointType: reward.pointType || 'shop',
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      minOrderValue: reward.minOrderValue,
      maxDiscount: reward.maxDiscount,
      source: reward.source,
    }));

    res.status(200).json({
      success: true,
      data: formattedOptions,
      userPoints: {
        shopPoints: loyaltyPoints?.balance || 0,
        gamePoints: loyaltyPoints?.gamePoints || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const redeemReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    let loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });
    if (!loyaltyPoints) {
      loyaltyPoints = new LoyaltyPoint({
        user: userId,
        balance: 0,
        gamePoints: 0,
        tier: "bronze",
      });
      await loyaltyPoints.save();
    }

    const reward = await PromoCode.findOne({
      _id: rewardId,
      pointsCost: { $exists: true, $ne: null, $gt: 0 },
      isActive: true,
      isPublic: { $ne: true },
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Phần thưởng không tồn tại",
      });
    }

    const pointType = reward.pointType || "shop";
    const userPoints = pointType === "game" ? loyaltyPoints.gamePoints : loyaltyPoints.balance;

    if (userPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Không đủ điểm ${pointType === "game" ? "game" : "shop"} để đổi phần thưởng này`,
      });
    }

    const userRedeemedCodes = await PromoCode.find({
      _id: { $in: user.userPromoCodes?.map((item) => item.promoCode) || [] },
    });

    const hasSameDiscountType = userRedeemedCodes.some(
      (code) =>
        code.discountType === reward.discountType &&
        code.discountValue === reward.discountValue &&
        code.source === reward.source
    );

    if (hasSameDiscountType) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã đổi loại voucher này rồi. Mỗi loại voucher chỉ được đổi 1 lần`,
      });
    }

    const code = `GAME${Date.now().toString().slice(-8)}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const promoCode = await PromoCode.create({
      code,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      minOrderValue: reward.minOrderValue,
      maxDiscount: reward.maxDiscount || null,
      usageLimit: 1,
      perUserLimit: 1,
      expiryDate,
      isActive: true,
      description: reward.description || reward.code,
      source: "game",
      redemptionCooldown: reward.redemptionCooldown,
      usedBy: [
        {
          user: userId,
          usedCount: 0,
          redeemedAt: new Date(),
        },
      ],
    });

    if (pointType === "game") {
      loyaltyPoints.gamePoints -= reward.pointsCost;
    } else {
      loyaltyPoints.balance -= reward.pointsCost;
    }

    loyaltyPoints.transactions.push({
      type: "redeem",
      amount: reward.pointsCost,
      reason: `Đổi mã ${code}`,
      reference: promoCode._id,
      referenceModel: "PromoCode",
    });

    await loyaltyPoints.save();

    if (!user.userPromoCodes) {
      user.userPromoCodes = [];
    }
    user.userPromoCodes.push({
      promoCode: promoCode._id,
      redeemedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Đổi thành công! Mã của bạn: ${code}`,
      data: {
        code,
        promoCode,
        remainingPoints: {
          shopPoints: loyaltyPoints.balance,
          gamePoints: loyaltyPoints.gamePoints,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserPromoCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "userPromoCodes.promoCode",
      model: "PromoCode",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const userRedeemed = user.userPromoCodes
      ?.filter((item) => {
        const promo = item.promoCode;
        if (!promo || !promo.isActive) return false;
        if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) return false;
        
        const userUsage = promo.usedBy?.find(
          (u) => u.user.toString() === userId.toString()
        );
        if (userUsage && userUsage.usedCount >= promo.perUserLimit) return false;
        
        return true;
      })
      .map((item) => {
        const promo = item.promoCode;
        const userUsage = promo.usedBy?.find(
          (u) => u.user.toString() === userId.toString()
        );

        return {
          _id: promo._id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          minOrderValue: promo.minOrderValue,
          maxDiscount: promo.maxDiscount,
          expiryDate: promo.expiryDate,
          description: promo.description,
          source: promo.source,
          isPublic: false,
          redeemedAt: item.redeemedAt,
          usedCount: userUsage?.usedCount || 0,
          usedAt: userUsage?.usedAt || null,
        };
      }) || [];

    const publicPromoCodes = await PromoCode.find({
      isPublic: true,
      isActive: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null }
      ]
    });

    const publicPromoCodesFiltered = publicPromoCodes
      .filter((promo) => {
        if (promo.usageLimit && promo.usedBy?.length >= promo.usageLimit) return false;
        
        const userUsage = promo.usedBy?.find(
          (u) => u.user.toString() === userId.toString()
        );
        if (userUsage && userUsage.usedCount >= promo.perUserLimit) return false;
        
        return true;
      })
      .map((promo) => {
        const userUsage = promo.usedBy?.find(
          (u) => u.user.toString() === userId.toString()
        );

        return {
          _id: promo._id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          minOrderValue: promo.minOrderValue,
          maxDiscount: promo.maxDiscount,
          expiryDate: promo.expiryDate,
          description: promo.description,
          source: promo.source,
          isPublic: true,
          usedCount: userUsage?.usedCount || 0,
          usedAt: userUsage?.usedAt || null,
        };
      });

    const allPromoCodes = [...publicPromoCodesFiltered, ...userRedeemed];

    res.status(200).json({
      success: true,
      data: allPromoCodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const validatePromoCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, orderValue } = req.body;

    const promoCode = await PromoCode.findOne({ code, isActive: true });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Mã không hợp lệ hoặc đã hết hạn",
      });
    }

    if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Mã đã hết hạn",
      });
    }

    if (promoCode.minOrderValue && orderValue < promoCode.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${promoCode.minOrderValue.toLocaleString()}đ`,
      });
    }

    const userUsage = promoCode.usedBy?.find(
      (u) => u.user.toString() === userId.toString()
    );
    if (userUsage && userUsage.usedCount >= promoCode.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã sử dụng hết lượt dùng mã này",
      });
    }

    if (promoCode.usedBy?.length >= promoCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Mã đã hết lượt sử dụng",
      });
    }

    let discountAmount = 0;
    if (promoCode.discountType === "percentage") {
      discountAmount = (orderValue * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else if (promoCode.discountType === "fixed") {
      discountAmount = promoCode.discountValue;
    }

    res.status(200).json({
      success: true,
      message: "Mã hợp lệ",
      data: {
        code: promoCode.code,
        discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        maxDiscount: promoCode.maxDiscount,
        finalPrice: orderValue - discountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRewardOptions,
  redeemReward,
  getUserPromoCodes,
  validatePromoCode,
};
