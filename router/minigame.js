const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  playGame,
  getUserGameStats,
  getGameHistory,
} = require("../controller/minigame");

router.post("/play", verifyToken, playGame);
router.get("/stats", verifyToken, getUserGameStats);
router.get("/history", verifyToken, getGameHistory);

module.exports = router;
