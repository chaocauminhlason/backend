const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getRewardOptions,
  redeemReward,
  getUserPromoCodes,
  validatePromoCode,
} = require("../controller/reward");

router.get("/options", verifyToken, getRewardOptions);
router.post("/redeem", verifyToken, redeemReward);
router.get("/promo-codes", verifyToken, getUserPromoCodes);
router.post("/validate", verifyToken, validatePromoCode);

module.exports = router;
