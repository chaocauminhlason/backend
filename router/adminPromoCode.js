const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
} = require("../controller/adminPromoCode");

router.get("/promo-codes", verifyToken, getAllPromoCodes);
router.post("/promo-codes", verifyToken, createPromoCode);
router.put("/promo-codes/:id", verifyToken, updatePromoCode);
router.delete("/promo-codes/:id", verifyToken, deletePromoCode);
router.patch("/promo-codes/:id/toggle", verifyToken, togglePromoCodeStatus);

module.exports = router;
