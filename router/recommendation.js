const express = require("express");
const router = express.Router();
const {
  trackProductView,
  getForYouRecommendations,
  getTrending,
} = require("../controller/recommendation");
const { verifyToken } = require("../middleware/auth");

/**
 * Track product view (requires authentication)
 * POST /api/v1/recommendation/track-view
 */
router.post("/track-view", verifyToken, trackProductView);

/**
 * Get personalized recommendations for user
 * GET /api/v1/recommendation/for-you?limit=12
 * If not authenticated, returns trending products
 */
router.get("/for-you", getForYouRecommendations);

/**
 * Get trending products
 * GET /api/v1/recommendation/trending?limit=12
 */
router.get("/trending", getTrending);

module.exports = router;