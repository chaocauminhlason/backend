const PromoCode = require("../models/promoCode");
const Order = require("../models/order");

class PromoCodeService {
  /**
   * Validate promo code
   */
  async validatePromoCode(code, userId, orderValue) {
    try {
      // Tìm mã
      const promoCode = await PromoCode.findOne({
        code: code.toUpperCase(),
      });

      if (!promoCode) {
        return { success: false, message: "Mã không tồn tại" };
      }

      // Check inactive
      if (!promoCode.isActive) {
        return { success: false, message: "Mã đã bị vô hiệu hóa" };
      }

      // Check expired
      if (new Date() > promoCode.expiryDate) {
        return { success: false, message: "Mã đã hết hạn" };
      }

      // Check minimum order value
      if (orderValue < promoCode.minOrderValue) {
        return {
          success: false,
          message: `Đơn hàng tối thiểu ${promoCode.minOrderValue.toLocaleString()} VND`,
        };
      }

      // Check usage limit
      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        return { success: false, message: "Mã đã hết lượt dùng" };
      }

      // Check per user limit
      if (promoCode.perUserLimit) {
        const userUsageCount = promoCode.usedBy.filter(
          (u) => u.user.toString() === userId
        ).length;
        if (userUsageCount >= promoCode.perUserLimit) {
          return {
            success: false,
            message: `Bạn chỉ có thể dùng mã này tối đa ${promoCode.perUserLimit} lần`,
          };
        }
      }

      return { success: true, promoCode };
    } catch (error) {
      console.log("PromoCodeService.validatePromoCode error:", error);
      return { success: false, message: "Lỗi server" };
    }
  }

  /**
   * Tính toán discount
   */
  calculateDiscount(promoCode, orderValue) {
    let discountAmount = 0;

    if (promoCode.discountType === "percentage") {
      discountAmount = (orderValue * promoCode.discountValue) / 100;

      // Kiểm max discount
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      // fixed amount
      discountAmount = promoCode.discountValue;
    }

    return Math.min(discountAmount, orderValue); // Không được discount > giá đơn hàng
  }

  /**
   * Apply promo code khi tạo order
   */
  async applyPromoCode(code, userId, orderValue) {
    try {
      const validation = await this.validatePromoCode(code, userId, orderValue);

      if (!validation.success) {
        return validation;
      }

      const promoCode = validation.promoCode;
      const discountAmount = this.calculateDiscount(promoCode, orderValue);

      return {
        success: true,
        promoCode: {
          _id: promoCode._id,
          code: promoCode.code,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
        },
        discountAmount,
        finalPrice: orderValue - discountAmount,
      };
    } catch (error) {
      console.log("PromoCodeService.applyPromoCode error:", error);
      return { success: false, message: "Lỗi server" };
    }
  }

  /**
   * Update usage after order completed
   */
  async updateUsageAfterOrder(promoCodeId, userId) {
    try {
      await PromoCode.findByIdAndUpdate(promoCodeId, {
        $inc: { usageCount: 1 },
        $push: {
          usedBy: {
            user: userId,
            usedAt: new Date(),
          },
        },
      });
      return { success: true };
    } catch (error) {
      console.log("PromoCodeService.updateUsageAfterOrder error:", error);
      return { success: false };
    }
  }

  /**
   * Create promo code (Admin only)
   */
  async createPromoCode(data) {
    try {
      const newPromoCode = new PromoCode({
        ...data,
        code: data.code.toUpperCase(),
      });

      const saved = await newPromoCode.save();
      return { success: true, data: saved };
    } catch (error) {
      console.log("PromoCodeService.createPromoCode error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * List all promo codes (Admin)
   */
  async getPromoCodesList(filter = {}) {
    try {
      const promoCodes = await PromoCode.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      return { success: true, data: promoCodes };
    } catch (error) {
      console.log("PromoCodeService.getPromoCodesList error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check active promo codes for user
   */
  async getActivePromoCodes() {
    try {
      const now = new Date();
      const promoCodes = await PromoCode.find({
        isActive: true,
        expiryDate: { $gt: now },
      })
        .select("code discountType discountValue minOrderValue maxDiscount")
        .limit(20);

      return { success: true, data: promoCodes };
    } catch (error) {
      console.log("PromoCodeService.getActivePromoCodes error:", error);
      return { success: false };
    }
  }
}

module.exports = new PromoCodeService();