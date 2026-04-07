const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const {
  getUserLoyaltyInfo,
  getAvailableRewards,
  redeemLoyaltyReward,
  getTransactionHistory,
  addBonusPoints,
  getAllLoyaltyRewards,
  createLoyaltyReward,
  updateLoyaltyReward,
  deleteLoyaltyReward,
} = require("../controller/loyalty");

router.get("/info", verifyToken, getUserLoyaltyInfo);
router.get("/rewards", verifyToken, getAvailableRewards);
router.post("/redeem", verifyToken, redeemLoyaltyReward);
router.get("/transactions", verifyToken, getTransactionHistory);

router.get("/admin/rewards", verifyToken, isAdmin, getAllLoyaltyRewards);
router.post("/admin/rewards", verifyToken, isAdmin, createLoyaltyReward);
router.put("/admin/rewards/:id", verifyToken, isAdmin, updateLoyaltyReward);
router.delete("/admin/rewards/:id", verifyToken, isAdmin, deleteLoyaltyReward);
router.post("/admin/bonus", verifyToken, isAdmin, addBonusPoints);

module.exports = router;
