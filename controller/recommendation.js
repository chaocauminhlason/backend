const {
  trackView,
  getRecommendations,
  getHybridRecommendations,
  getTrendingProducts,
} = require("../service/recommendation");

/**
 * Track product view
 * POST /api/v1/recommendation/track-view
 * Body: { productId, duration }
 */
const trackProductView = async (req, res) => {
  try {
    const { productId, duration } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId is required",
      });
    }

    const result = await trackView(userId, productId, duration || 0);

    return res.status(200).json({
      success: true,
      message: "View tracked successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error tracking view",
    });
  }
};

/**
 * Get recommendations for user
 * GET /api/v1/recommendation/for-you?limit=12
 */
const getForYouRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 12, categoryId } = req.query;

    if (!userId) {
      // Return trending if not authenticated
      const trending = await getTrendingProducts(parseInt(limit));
      return res.status(200).json({
        success: true,
        message: "Trending products",
        data: trending,
        isAuthenticated: false,
      });
    }

    const recommendations = await getHybridRecommendations(
      userId,
      parseInt(limit),
      categoryId
    );

    return res.status(200).json({
      success: true,
      message: "Personalized recommendations",
      data: recommendations,
      isAuthenticated: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting recommendations",
    });
  }
};

/**
 * Get trending products
 * GET /api/v1/recommendation/trending?limit=12
 */
const getTrending = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const trending = await getTrendingProducts(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Trending products",
      data: trending,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting trending products",
    });
  }
};

module.exports = {
  trackProductView,
  getForYouRecommendations,
  getTrending,
};