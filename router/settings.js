const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  toggleFeature,
  getPublicSettings,
} = require("../controller/settings");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Public routes (không cần auth)
router.get("/public", getPublicSettings);

// Protected routes (cần auth + admin)
router.get("/", verifyToken, isAdmin, getSettings);
router.put("/", verifyToken, isAdmin, updateSettings);
router.post("/toggle-feature", verifyToken, isAdmin, toggleFeature);

module.exports = router;