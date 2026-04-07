const LoyaltyPointService = require("../service/loyaltyPoint");
const LoyaltyReward = require("../models/loyaltyReward");

const getUserLoyaltyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await LoyaltyPointService.getUserLoyaltyInfo(userId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || "Không tìm thấy thông tin điểm",
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAvailableRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await LoyaltyPointService.getAvailableRewards(userId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: "Không thể lấy danh sách phần thưởng",
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const redeemLoyaltyReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;
    
    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin phần thưởng",
      });
    }
    
    const result = await LoyaltyPointService.redeemPoints(userId, rewardId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        voucherCode: result.voucherCode,
        remainingPoints: result.remainingPoints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const loyaltyPoints = await LoyaltyPointService.getUserLoyaltyPoints(userId);
    
    if (!loyaltyPoints.success) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin điểm",
      });
    }
    
    const transactions = loyaltyPoints.data.transactions || [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: transactions.length,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addBonusPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin",
      });
    }
    
    const result = await LoyaltyPointService.addBonusPoints(
      userId,
      parseInt(points),
      reason || "Thưởng từ admin"
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Không thể thêm điểm",
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Đã thêm ${points} điểm thành công`,
      pointsAdded: result.pointsAdded,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllLoyaltyRewards = async (req, res) => {
  try {
    const rewards = await LoyaltyReward.find()
      .sort({ position: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createLoyaltyReward = async (req, res) => {
  try {
    const rewardData = req.body;
    const reward = await LoyaltyReward.create(rewardData);
    
    res.status(201).json({
      success: true,
      message: "Tạo phần thưởng thành công",
      data: reward,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLoyaltyReward = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const reward = await LoyaltyReward.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phần thưởng",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Cập nhật phần thưởng thành công",
      data: reward,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteLoyaltyReward = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reward = await LoyaltyReward.findByIdAndDelete(id);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phần thưởng",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Xóa phần thưởng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserLoyaltyInfo,
  getAvailableRewards,
  redeemLoyaltyReward,
  getTransactionHistory,
  addBonusPoints,
  getAllLoyaltyRewards,
  createLoyaltyReward,
  updateLoyaltyReward,
  deleteLoyaltyReward,
};
