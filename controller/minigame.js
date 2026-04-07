const Settings = require("../models/settings");
const User = require("../models/user");
const LoyaltyPoint = require("../models/loyaltyPoint");

const playGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, result, isPaidPlay } = req.body;

    const settings = await Settings.findOne();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (!settings?.features?.miniGames?.enabled) {
      return res.status(403).json({
        success: false,
        message: "Tính năng mini games chưa được kích hoạt",
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const gameStats = user.gameStats || {};
    const todayStats = gameStats[today] || { count: 0, pointsWon: 0, games: [], gamePlays: {} };

    const dailyLimit = settings?.miniGames?.dailyPlayLimit || 0;
    if (todayStats.count >= dailyLimit) {
      return res.status(403).json({
        success: false,
        message: `Bạn đã hết lượt chơi hôm nay (${dailyLimit} lượt)`,
        remainingPlays: 0,
      });
    }

    const freePlayLimitField = `${gameType}FreePlayLimit`;
    const freePlayLimit = settings?.miniGames?.[freePlayLimitField] || 1;
    const gamePlayStats = todayStats.gamePlays?.[gameType] || { free: 0, paid: 0 };

    if (!isPaidPlay && gamePlayStats.free >= freePlayLimit) {
      return res.status(403).json({
        success: false,
        message: `Bạn đã dùng hết ${freePlayLimit} lượt miễn phí của ${gameType} hôm nay. Hãy mua thêm lượt chơi`,
        canBuyMorePlays: true,
        pointsPerPlay: settings?.miniGames?.pointsPerFreePlay || 10,
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

    if (isPaidPlay) {
      const costPerPlay = settings?.miniGames?.pointsPerFreePlay || 10;
      if (loyaltyPoints.gamePoints < costPerPlay) {
        return res.status(400).json({
          success: false,
          message: `Bạn không đủ điểm game để mua thêm lượt chơi. Cần ${costPerPlay} điểm`,
          pointsNeeded: costPerPlay,
        });
      }
      loyaltyPoints.gamePoints -= costPerPlay;
      await loyaltyPoints.save();
    }

    const rewards = {
      spinwheel: [0, 10, 20, 30, 50, 100, 200, 500],
      scratchcard: [0, 15, 25, 50, 75, 150],
      mysterybox: [0, 20, 40, 100, 300],
    };

    const gameRewards = rewards[gameType] || [0, 10, 20, 50];
    const randomReward =
      result?.value || gameRewards[Math.floor(Math.random() * gameRewards.length)];

    const dailyMaxPoints = settings?.miniGames?.dailyMaxPoints || 500;
    const pointsCanWin = Math.max(0, dailyMaxPoints - (todayStats.pointsWon || 0));

    let finalReward = Math.min(randomReward, pointsCanWin);

    if (finalReward > 0) {
      loyaltyPoints.gamePoints += finalReward;
      loyaltyPoints.transactions.push({
        type: "bonus",
        amount: finalReward,
        reason: `Chơi ${gameType}`,
        referenceModel: "Game",
      });
      await loyaltyPoints.save();
    }

    todayStats.count += 1;
    todayStats.pointsWon = (todayStats.pointsWon || 0) + finalReward;
    if (!todayStats.gamePlays) todayStats.gamePlays = {};
    if (!todayStats.gamePlays[gameType]) todayStats.gamePlays[gameType] = { free: 0, paid: 0 };
    
    if (isPaidPlay) {
      todayStats.gamePlays[gameType].paid += 1;
    } else {
      todayStats.gamePlays[gameType].free += 1;
    }

    todayStats.games.push({
      gameType,
      reward: finalReward,
      timestamp: new Date(),
      isPaidPlay,
    });

    gameStats[today] = todayStats;
    user.gameStats = gameStats;
    user.markModified('gameStats');

    await user.save();

    const message = finalReward > 0 
      ? `Chúc mừng! Bạn nhận được ${finalReward} điểm` 
      : "Chúc bạn may mắn lần sau!";

    res.status(200).json({
      success: true,
      message,
      reward: finalReward,
      remainingPlays: dailyLimit - todayStats.count,
      pointsWonToday: todayStats.pointsWon,
      pointsCanStillWin: Math.max(0, dailyMaxPoints - todayStats.pointsWon),
      totalPoints: loyaltyPoints.gamePoints,
      isPaidPlay,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserGameStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const settings = await Settings.findOne();
    const loyaltyPoints = await LoyaltyPoint.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayStats = user.gameStats?.[today] || { count: 0, pointsWon: 0, games: [], gamePlays: {} };
    const dailyLimit = settings?.miniGames?.dailyPlayLimit || 3;
    const dailyMaxPoints = settings?.miniGames?.dailyMaxPoints || 500;

    const gamePlayStats = {
      spinwheel: {
        free: todayStats.gamePlays?.spinwheel?.free || 0,
        paid: todayStats.gamePlays?.spinwheel?.paid || 0,
        freeLimit: settings?.miniGames?.spinWheelFreePlayLimit || 1,
      },
      scratchcard: {
        free: todayStats.gamePlays?.scratchcard?.free || 0,
        paid: todayStats.gamePlays?.scratchcard?.paid || 0,
        freeLimit: settings?.miniGames?.scratchCardFreePlayLimit || 1,
      },
      mysterybox: {
        free: todayStats.gamePlays?.mysterybox?.free || 0,
        paid: todayStats.gamePlays?.mysterybox?.paid || 0,
        freeLimit: settings?.miniGames?.mysteryBoxFreePlayLimit || 1,
      },
    };

    res.status(200).json({
      success: true,
      data: {
        playsToday: todayStats.count,
        remainingPlays: dailyLimit - todayStats.count,
        dailyLimit,
        pointsWonToday: todayStats.pointsWon || 0,
        pointsCanStillWin: Math.max(0, dailyMaxPoints - (todayStats.pointsWon || 0)),
        dailyMaxPoints,
        totalPoints: loyaltyPoints?.gamePoints || 0,
        pointsPerFreePlay: settings?.miniGames?.pointsPerFreePlay || 10,
        gamePlayStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getGameHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const gameStats = user.gameStats || {};
    const history = [];

    Object.keys(gameStats)
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 7)
      .forEach((date) => {
        history.push({
          date,
          plays: gameStats[date].count,
          games: gameStats[date].games,
        });
      });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  playGame,
  getUserGameStats,
  getGameHistory,
};
