const LoyaltyPoint = require("../models/loyaltyPoint");
const LoyaltyReward = require("../models/loyaltyReward");
const PromoCode = require("../models/promoCode");
const Settings = require("../models/settings");

class LoyaltyPointService {
  constructor() {
    this.settings = null;
    this.TIER_THRESHOLDS = {
      bronze: 0,
      silver: 5000000,
      gold: 20000000,
      platinum: 50000000,
    };
    this.POINTS_MULTIPLIER = {
      bronze: 1,
      silver: 1.2,
      gold: 1.5,
      platinum: 2,
    };
    this.POINTS_PER_DONG = 1;
    this.POINT_EXPIRY_DAYS = 365;
  }

  async loadSettings() {
    try {
      const settings = await Settings.findOne();
      if (settings && settings.loyalty) {
        this.settings = settings.loyalty;
        
        if (settings.loyalty.pointsPerDong) {
          this.POINTS_PER_DONG = settings.loyalty.pointsPerDong;
        }
        
        if (settings.loyalty.pointExpiryDays) {
          this.POINT_EXPIRY_DAYS = settings.loyalty.pointExpiryDays;
        }
        
        if (settings.loyalty.tiers) {
          const tiers = settings.loyalty.tiers;
          this.TIER_THRESHOLDS = {
            bronze: tiers.bronze?.minSpent || 0,
            silver: tiers.silver?.minSpent || 5000000,
            gold: tiers.gold?.minSpent || 20000000,
            platinum: tiers.platinum?.minSpent || 50000000,
          };
          this.POINTS_MULTIPLIER = {
            bronze: tiers.bronze?.pointMultiplier || 1,
            silver: tiers.silver?.pointMultiplier || 1.2,
            gold: tiers.gold?.pointMultiplier || 1.5,
            platinum: tiers.platinum?.pointMultiplier || 2,
          };
        }
      }
    } catch (error) {
      console.log("LoyaltyPointService.loadSettings error:", error);
    }
  }

  /**
   * Get or create loyalty points for user
   */
  async getUserLoyaltyPoints(userId) {
    try {
      let loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

      if (!loyaltyPoints) {
        loyaltyPoints = new LoyaltyPoint({
          user: userId,
          balance: 0,
          tier: "bronze",
          referralCode: this.generateReferralCode(userId),
        });
        await loyaltyPoints.save();
      }

      return { success: true, data: loyaltyPoints };
    } catch (error) {
      console.log("LoyaltyPointService.getUserLoyaltyPoints error:", error);
      return { success: false };
    }
  }

  /**
   * Add points after purchase
   */
  async addPointsFromOrder(userId, orderValue, orderId) {
    try {
      await this.loadSettings();
      
      const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

      if (!loyaltyPoints) {
        await this.getUserLoyaltyPoints(userId);
        return this.addPointsFromOrder(userId, orderValue, orderId);
      }

      const basePoints = orderValue * this.POINTS_PER_DONG;
      const pointsToAdd = Math.floor(
        basePoints * this.POINTS_MULTIPLIER[loyaltyPoints.tier]
      );
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.POINT_EXPIRY_DAYS);

      // Update balance
      loyaltyPoints.balance += pointsToAdd;
      loyaltyPoints.lifetime += pointsToAdd;

      // Add transaction
      loyaltyPoints.transactions.push({
        type: "earn",
        amount: pointsToAdd,
        reason: `Mua hàng - Đơn #${orderId}`,
        reference: orderId,
        referenceModel: "Order",
        expiryDate,
      });

      // Update tier if needed
      await this.updateTier(loyaltyPoints);

      await loyaltyPoints.save();

      return { success: true, pointsAdded: pointsToAdd };
    } catch (error) {
      console.log("LoyaltyPointService.addPointsFromOrder error:", error);
      return { success: false };
    }
  }

  /**
   * Redeem points for reward
   */
  async redeemPoints(userId, rewardId) {
    try {
      const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });
      const reward = await LoyaltyReward.findById(rewardId);

      if (!loyaltyPoints || !reward) {
        return { success: false, message: "Dữ liệu không hợp lệ" };
      }

      // Check points
      if (loyaltyPoints.balance < reward.pointRequired) {
        return {
          success: false,
          message: `Bạn cần ${reward.pointRequired} điểm (hiện có ${loyaltyPoints.balance})`,
        };
      }

      // Check tier
      if (this.isTierLower(loyaltyPoints.tier, reward.minTier)) {
        return {
          success: false,
          message: `Phần thưởng yêu cầu tier ${reward.minTier} trở lên`,
        };
      }

      // Check reward quantity
      if (reward.quantity > 0 && reward.used >= reward.quantity) {
        return { success: false, message: "Phần thưởng đã hết" };
      }

      // Deduct points
      loyaltyPoints.balance -= reward.pointRequired;
      loyaltyPoints.transactions.push({
        type: "redeem",
        amount: reward.pointRequired,
        reason: `Đổi ${reward.name}`,
        reference: rewardId,
        referenceModel: "Reward",
      });

      await loyaltyPoints.save();

      // Update reward used count
      await LoyaltyReward.findByIdAndUpdate(rewardId, {
        $inc: { used: 1 },
      });

      // If reward has promo code, create new promo code for user
      let voucherCode = null;
      if (reward.rewardType === "voucher" && reward.promoCode) {
        voucherCode = await this.createVoucherForUser(userId, reward);
      }

      return {
        success: true,
        message: "Đổi thành công",
        voucherCode,
        remainingPoints: loyaltyPoints.balance,
      };
    } catch (error) {
      console.log("LoyaltyPointService.redeemPoints error:", error);
      return { success: false, message: "Lỗi server" };
    }
  }

  /**
   * Add bonus points
   */
  async addBonusPoints(userId, points, reason) {
    try {
      const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

      if (!loyaltyPoints) {
        await this.getUserLoyaltyPoints(userId);
        return this.addBonusPoints(userId, points, reason);
      }

      loyaltyPoints.balance += points;
      loyaltyPoints.lifetime += points;
      loyaltyPoints.transactions.push({
        type: "bonus",
        amount: points,
        reason: reason || "Thưởng đặc biệt",
      });

      await loyaltyPoints.save();

      return { success: true, pointsAdded: points };
    } catch (error) {
      console.log("LoyaltyPointService.addBonusPoints error:", error);
      return { success: false };
    }
  }

  /**
   * Update user tier based on lifetime points
   */
  async updateTier(loyaltyPoints) {
    await this.loadSettings();
    
    const currentLifetime = loyaltyPoints.lifetime;
    let newTier = "bronze";

    if (currentLifetime >= this.TIER_THRESHOLDS.platinum) {
      newTier = "platinum";
    } else if (currentLifetime >= this.TIER_THRESHOLDS.gold) {
      newTier = "gold";
    } else if (currentLifetime >= this.TIER_THRESHOLDS.silver) {
      newTier = "silver";
    }

    if (newTier !== loyaltyPoints.tier) {
      loyaltyPoints.tier = newTier;
      loyaltyPoints.tierUpgradedAt = new Date();

      let bonusPoints = 0;
      if (this.settings && this.settings.tiers && this.settings.tiers[newTier]) {
        bonusPoints = this.settings.tiers[newTier].bonusPointsOnTierUp || 0;
      } else {
        const defaultBonus = {
          silver: 500,
          gold: 1000,
          platinum: 2000,
        };
        bonusPoints = defaultBonus[newTier] || 0;
      }

      if (bonusPoints > 0) {
        loyaltyPoints.balance += bonusPoints;
        loyaltyPoints.transactions.push({
          type: "bonus",
          amount: bonusPoints,
          reason: `Thăng cấp lên tier ${newTier}`,
        });
      }
    }

    // Calculate next tier threshold
    if (newTier === "platinum") {
      loyaltyPoints.nextTierPoints = null;
    } else {
      const tierOrder = ["bronze", "silver", "gold", "platinum"];
      const nextTierIndex = tierOrder.indexOf(newTier) + 1;
      loyaltyPoints.nextTierPoints =
        this.TIER_THRESHOLDS[tierOrder[nextTierIndex]] - currentLifetime;
    }
  }

  /**
   * Helper: check if tier1 is lower than tier2
   */
  isTierLower(tier1, tier2) {
    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    return tierOrder.indexOf(tier1) < tierOrder.indexOf(tier2);
  }

  /**
   * Create voucher code for redeemed reward
   */
  async createVoucherForUser(userId, reward) {
    try {
      const newCode = `REWARD-${userId}-${Date.now()}`.slice(0, 20);

      const promoCode = new PromoCode({
        code: newCode,
        discountType: reward.promoCode.discountType || "fixed",
        discountValue: reward.value,
        minOrderValue: 0,
        expiryDate: reward.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 1,
        perUserLimit: 1,
        usedBy: [],
        source: "loyalty",
        description: `Đổi từ phần thưởng: ${reward.name}`,
      });

      const saved = await promoCode.save();
      return saved;
    } catch (error) {
      console.log("LoyaltyPointService.createVoucherForUser error:", error);
      return null;
    }
  }

  /**
   * Generate referral code
   */
  generateReferralCode(userId) {
    const code = `REF${userId}`.slice(0, 12);
    return code + Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  /**
   * Get loyalty info for user dashboard
   */
  async getUserLoyaltyInfo(userId) {
    try {
      const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });
      const rewards = await LoyaltyReward.find({ isActive: true });

      if (!loyaltyPoints) {
        return { success: false, message: "Không tìm thấy dữ liệu" };
      }

      return {
        success: true,
        data: {
          balance: loyaltyPoints.balance,
          gamePoints: loyaltyPoints.gamePoints || 0,
          lifetime: loyaltyPoints.lifetime,
          tier: loyaltyPoints.tier,
          tierUpgradedAt: loyaltyPoints.tierUpgradedAt,
          nextTierPoints: loyaltyPoints.nextTierPoints,
          referralCode: loyaltyPoints.referralCode,
          referredCount: loyaltyPoints.referredCount,
          recentTransactions: loyaltyPoints.transactions.slice(-10),
        },
      };
    } catch (error) {
      console.log("LoyaltyPointService.getUserLoyaltyInfo error:", error);
      return { success: false };
    }
  }

  /**
   * List available rewards for user
   */
  async getAvailableRewards(userId) {
    try {
      const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

      if (!loyaltyPoints) {
        return { success: false };
      }

      const rewards = await LoyaltyReward.find({
        isActive: true,
        minTier: {
          $in: ["bronze", loyaltyPoints.tier], // Same or lower tier
        },
      }).sort({ position: 1 });

      const formatted = rewards.map((r) => ({
        ...r.toObject(),
        canRedeem: loyaltyPoints.balance >= r.pointRequired,
        available: r.quantity < 0 || r.used < r.quantity,
      }));

      return { success: true, data: formatted };
    } catch (error) {
      console.log("LoyaltyPointService.getAvailableRewards error:", error);
      return { success: false };
    }
  }
}

module.exports = new LoyaltyPointService();