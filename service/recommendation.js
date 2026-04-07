const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

/**
 * Track user view history
 * @param {string} userId
 * @param {string} productId
 * @param {number} duration - view duration in seconds
 */
const trackView = async (userId, productId, duration = 0) => {
  try {
    if (!userId || !productId) {
      throw new Error("UserId and ProductId are required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if product already viewed today
    const existingView = user.viewHistory.find(
      (view) =>
        view.product.toString() === productId &&
        new Date(view.viewedAt).toDateString() === new Date().toDateString()
    );

    if (existingView) {
      // Update duration and viewedAt for today's view
      existingView.duration += duration;
      existingView.viewedAt = new Date();
    } else {
      // Add new view
      user.viewHistory.push({
        product: productId,
        viewedAt: new Date(),
        duration,
      });
    }

    // Keep only last 100 views (manage data size)
    if (user.viewHistory.length > 100) {
      user.viewHistory = user.viewHistory.slice(-100);
    }

    await user.save();
    return { success: true, message: "View tracked" };
  } catch (error) {
    throw error;
  }
};

/**
 * Find similar users based on view history
 * @param {string} userId
 * @param {number} limit
 */
const findSimilarUsers = async (userId, limit = 5) => {
  try {
    const user = await User.findById(userId).populate("viewHistory.product");
    if (!user) return [];

    // Get user's viewed product IDs
    const userViewedProducts = user.viewHistory.map((v) => v.product._id);

    if (userViewedProducts.length === 0) return [];

    // Find other users who viewed same products
    const similarUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
          "viewHistory.product": { $in: userViewedProducts },
        },
      },
      {
        $addFields: {
          commonViews: {
            $size: {
              $filter: {
                input: "$viewHistory",
                as: "view",
                cond: { $in: ["$$view.product", userViewedProducts] },
              },
            },
          },
        },
      },
      {
        $sort: { commonViews: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: { _id: 1, commonViews: 1 },
      },
    ]);

    return similarUsers;
  } catch (error) {
    throw error;
  }
};

/**
 * Collaborative Filtering - Get products viewed by similar users
 * @param {string} userId
 * @param {number} limit
 */
const getCollaborativeRecommendations = async (userId, limit = 20) => {
  try {
    const user = await User.findById(userId).populate("viewHistory.product");
    if (!user) return [];

    const userViewedProductIds = user.viewHistory.map((v) => v.product._id.toString());
    const similarUsers = await findSimilarUsers(userId, 10);

    // Get products viewed by similar users (but not by current user)
    const recommendedProducts = await Product.aggregate([
      {
        $match: {
          _id: {
            $nin: userViewedProductIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $addFields: {
          collaborativeScore: {
            $cond: [
              {
                $in: [
                  "$_id",
                  {
                    $reduce: {
                      input: similarUsers,
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          "$$value",
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: {
                                    $cond: [
                                      {
                                        $eq: [
                                          { $literal: userId },
                                          { $literal: userId },
                                        ],
                                      },
                                      [],
                                      [],
                                    ],
                                  },
                                  as: "item",
                                  cond: true,
                                },
                              },
                              as: "item",
                              in: "$$item",
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $limit: limit,
      },
    ]);

    return recommendedProducts;
  } catch (error) {
    throw error;
  }
};

/**
 * Content-Based - Get products in same category
 * @param {string} userId
 * @param {number} limit
 */
const getContentBasedRecommendations = async (userId, limit = 20) => {
  try {
    const user = await User.findById(userId).populate("viewHistory.product");
    if (!user || user.viewHistory.length === 0) return [];

    // Get categories from viewed products
    const viewedProducts = user.viewHistory.map((v) => v.product);
    const categoryIds = [...new Set(viewedProducts.map((p) => p.category))];

    if (categoryIds.length === 0) return [];

    const userViewedProductIds = user.viewHistory.map((v) => v.product._id);

    // Get products in same categories (excluding already viewed)
    const recommendedProducts = await Product.find({
      category: { $in: categoryIds },
      _id: { $nin: userViewedProductIds },
    })
      .limit(limit)
      .lean();

    return recommendedProducts;
  } catch (error) {
    throw error;
  }
};

/**
 * Trending/Popular - Get products by popularity score
 * @param {number} limit
 * @param {string} excludeUserId
 */
const getTrendingProducts = async (limit = 20, excludeUserId = null) => {
  try {
    let excludedProducts = [];

    if (excludeUserId) {
      const user = await User.findById(excludeUserId).populate("viewHistory.product");
      if (user) {
        excludedProducts = user.viewHistory.map((v) => v.product._id);
      }
    }

    const trendingProducts = await Product.aggregate([
      {
        $match: {
          _id: { $nin: excludedProducts },
        },
      },
      {
        $addFields: {
          purchaseCount: {
            $cond: [{ $isArray: "$reviews" }, { $size: "$reviews" }, 0],
          },
          avgRating: {
            $cond: [{ $isArray: "$reviews" }, { $avg: "$reviews.rating" }, 0],
          },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$purchaseCount", 0] }, 0.5] },
              { $multiply: [{ $ifNull: ["$avgRating", 0] }, 0.5] },
            ],
          },
        },
      },
      {
        $sort: { popularityScore: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          category: 1,
          ratings: 1,
          reviews: 1,
          popularityScore: 1,
        },
      },
    ]);

    return trendingProducts;
  } catch (error) {
    throw error;
  }
};

/**
 * Get hybrid recommendations (combined from all strategies)
 * @param {string} userId
 * @param {number} limit
 * @param {string} categoryId - optional category filter
 */
const getHybridRecommendations = async (userId, limit = 12, categoryId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get recommendations from all strategies in parallel
    const [collaborative, contentBased, trending] = await Promise.all([
      getCollaborativeRecommendations(userId, limit),
      getContentBasedRecommendations(userId, limit),
      getTrendingProducts(limit, userId),
    ]);

    // Merge all recommendations with weighted scores
    const scoreMap = new Map();

    // Collaborative (weight: 0.4)
    collaborative.forEach((product) => {
      const id = product._id.toString();
      const current = scoreMap.get(id) || { product, score: 0 };
      current.score += 0.4;
      scoreMap.set(id, current);
    });

    // Content-based (weight: 0.35)
    contentBased.forEach((product) => {
      const id = product._id.toString();
      const current = scoreMap.get(id) || { product, score: 0 };
      current.score += 0.35;
      scoreMap.set(id, current);
    });

    // Trending (weight: 0.25)
    trending.forEach((product) => {
      const id = product._id.toString();
      const current = scoreMap.get(id) || { product, score: 0 };
      current.score += 0.25;
      scoreMap.set(id, current);
    });

    // Sort by score and return top N
    const recommendations = Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    return recommendations;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recommendations (simple version for API)
 * @param {string} userId
 * @param {number} limit - default 12
 */
const getRecommendations = async (userId, limit = 12) => {
  try {
    if (!userId) {
      // If no user, return trending products
      return await getTrendingProducts(limit);
    }

    const recommendations = await getHybridRecommendations(userId, limit);
    return recommendations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  trackView,
  findSimilarUsers,
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getTrendingProducts,
  getHybridRecommendations,
  getRecommendations,
};