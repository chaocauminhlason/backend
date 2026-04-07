const express = require("express");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
const Payment = require("../controller/VNPay");
router.post("/vnpay", verifyToken, Payment.createPaymentVNP);
router.get("/vnpay-return", verifyToken, Payment.handleVnpayReturn);
module.exports = router;
