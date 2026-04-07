const MiniGame = require("../models/miniGame");
const GamePlay = require("../models/gamePlay");
const PromoCode = require("../models/promoCode");
const LoyaltyPointService = require("./loyaltyPoint");

class MiniGameService {
  /**
   * Get all active mini games
   */
  async getActiveGames() {
    try {
      const now = new Date();
      const games = await MiniGame.find({
        isActive: true,
        endDate: { $gt: now },
      }).select("-config");

      return { success: true, data: games };
    } catch (error) {
      console.log("MiniGameService.getActiveGames error:", error);
      return { success: false };
    }
  }

  /**
   * Get game detail
   */
  async getGameDetail(gameId) {
    try {
      const game = await MiniGame.findById(gameId);

      if (!game) {
        return { success: false, message: "Game không tồn tại" };
      }

      return { success: true, data: game };
    } catch (error) {
      console.log("MiniGameService.getGameDetail error:", error);
      return { success: false };
    }
  }

  /**
   * Check if user can play today
   */
  async canUserPlayToday(userId, gameId) {
    try {
      const game = await MiniGame.findById(gameId);

      if (!game) {
        return { success: false, message: "Game không tồn tại" };
      }

      if (game.playLimitType !== "daily") {
        return { success: true, canPlay: true };
      }

      // Get today's plays
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await GamePlay.countDocuments({
        user: userId,
        game: gameId,
        playedAt: { $gte: today },
      });

      const canPlay = todayCount < game.dailyLimit;

      return {
        success: true,
        canPlay,
        played: todayCount,
        limit: game.dailyLimit,
        remaining: game.dailyLimit - todayCount,
      };
    } catch (error) {
      console.log("MiniGameService.canUserPlayToday error:", error);
      return { success: false };
    }
  }

  /**
   * Play game - select random reward
   */
  async playGame(userId, gameId) {
    try {
      // Check can play
      const canPlayResult = await this.canUserPlayToday(userId, gameId);
      if (!canPlayResult.success || !canPlayResult.canPlay) {
        return {
          success: false,
          message: `Bạn đã chơi hết lượt hôm nay (${canPlayResult.limit} lượt)`,
        };
      }

      const game = await MiniGame.findById(gameId);

      if (!game || !game.isActive) {
        return { success: false, message: "Game không khả dụng" };
      }

      if (new Date() > game.endDate) {
        return { success: false, message: "Game đã kết thúc" };
      }

      // Select reward based on probability
      const selectedReward = this.selectRewardByProbability(game.rewards);

      if (!selectedReward) {
        return { success: false, message: "Lỗi khi chọn phần thưởng" };
      }

      // Check quantity
      if (selectedReward.quantity > 0) {
        const givenCount = game.rewards
          .filter((r) => r.id === selectedReward.id)
          .reduce((sum, r) => sum + r.used, 0);

        if (givenCount >= selectedReward.quantity) {
          // Phần thưởng hết, chọn cái khác
          return this.playGame(userId, gameId); // Retry
        }
      }

      // Create game play record
      let voucherCode = null;

      if (selectedReward.prize === "voucher") {
        // Create voucher code
        voucherCode = await this.createGameVoucher(selectedReward.value);
      } else if (selectedReward.prize === "points") {
        // Add loyalty points
        await LoyaltyPointService.addBonusPoints(
          userId,
          selectedReward.value,
          `Từ trò chơi: ${game.name}`
        );
      }

      const gamePlay = new GamePlay({
        user: userId,
        game: gameId,
        reward: selectedReward,
        prizeId: selectedReward.id,
        pointsEarned:
          selectedReward.prize === "points" ? selectedReward.value : 0,
        voucherCode: voucherCode?._id,
        status: "completed",
      });

      await gamePlay.save();

      // Update game stats
      await MiniGame.findByIdAndUpdate(gameId, {
        $inc: {
          totalPlayed: 1,
          "rewards.$[elem].used": 1,
        },
      });

      return {
        success: true,
        data: {
          prizeText: selectedReward.prizeText,
          prize: selectedReward.prize,
          value: selectedReward.value,
          color: selectedReward.color,
          voucherCode: voucherCode?.code,
          gamePlayId: gamePlay._id,
        },
      };
    } catch (error) {
      console.log("MiniGameService.playGame error:", error);
      return { success: false, message: "Lỗi server" };
    }
  }

  /**
   * Select reward by probability
   */
  selectRewardByProbability(rewards) {
    if (!rewards || rewards.length === 0) return null;

    const random = Math.random() * 100;
    let cumulative = 0;

    for (let reward of rewards) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }

    // Fallback to last reward
    return rewards[rewards.length - 1];
  }

  /**
   * Create voucher from game reward
   */
  async createGameVoucher(value) {
    try {
      const code = `GAME-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

      const promoCode = new PromoCode({
        code,
        discountType: "fixed",
        discountValue: value,
        minOrderValue: 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        isActive: true,
        usageLimit: 1,
        perUserLimit: 1,
        source: "game",
        description: `Voucher từ mini game`,
      });

      return await promoCode.save();
    } catch (error) {
      console.log("MiniGameService.createGameVoucher error:", error);
      return null;
    }
  }

  /**
   * Claim reward (if needed, e.g., for async operations)
   */
  async claimReward(userId, gamePlayId) {
    try {
      const gamePlay = await GamePlay.findById(gamePlayId);

      if (!gamePlay || gamePlay.user.toString() !== userId) {
        return { success: false, message: "Không hợp lệ" };
      }

      if (gamePlay.status !== "completed") {
        return {
          success: false,
          message: "Phần thưởng đã được claim hoặc hết hạn",
        };
      }

      gamePlay.status = "claimed";
      gamePlay.claimedAt = new Date();
      await gamePlay.save();

      return { success: true, message: "Claim thành công" };
    } catch (error) {
      console.log("MiniGameService.claimReward error:", error);
      return { success: false };
    }
  }

  /**
   * Get user game history
   */
  async getUserGameHistory(userId, limit = 20) {
    try {
      const history = await GamePlay.find({ user: userId })
        .populate("game", "name type")
        .sort({ playedAt: -1 })
        .limit(limit);

      return { success: true, data: history };
    } catch (error) {
      console.log("MiniGameService.getUserGameHistory error:", error);
      return { success: false };
    }
  }

  /**
   * Create new mini game (Admin)
   */
  async createGame(data) {
    try {
      const game = new MiniGame(data);
      const saved = await game.save();

      return { success: true, data: saved };
    } catch (error) {
      console.log("MiniGameService.createGame error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get admin stats
   */
  async getGameStats(gameId) {
    try {
      const game = await MiniGame.findById(gameId);
      const plays = await GamePlay.countDocuments({ game: gameId });
      const rewards = await GamePlay.aggregate([
        { $match: { game: gameId } },
        { $group: { _id: "$prizeId", count: { $sum: 1 } } },
      ]);

      return {
        success: true,
        data: {
          game,
          totalPlays: plays,
          rewardDistribution: rewards,
        },
      };
    } catch (error) {
      console.log("MiniGameService.getGameStats error:", error);
      return { success: false };
    }
  }
}

module.exports = new MiniGameService();