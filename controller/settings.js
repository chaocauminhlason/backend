const Settings = require("../models/settings");

// Get all settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Nếu không có settings, tạo default
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Nếu không có settings, tạo mới
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      // Update các field được cung cấp
      Object.keys(req.body).forEach((key) => {
        if (key !== "_id" && key !== "__v" && key !== "createdAt") {
          settings[key] = req.body[key];
        }
      });
    }

    await settings.save();
    
    res.status(200).json({
      success: true,
      message: "Cập nhật cài đặt thành công",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update specific feature toggle
const toggleFeature = async (req, res) => {
  try {
    const { featureKey, enabled } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Ví dụ: featureKey = "features.promoCode.enabled"
    const keys = featureKey.split(".");
    let obj = settings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = enabled;
    await settings.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật tính năng thành công",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get public settings (không cần auth)
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Chỉ return public fields
    const publicSettings = {
      websiteName: settings.websiteName,
      websiteLogo: settings.websiteLogo,
      websiteDescription: settings.websiteDescription,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      features: settings.features,
      miniGames: settings.miniGames,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      header: settings.header,
      theme: settings.theme,
    };

    res.status(200).json({
      success: true,
      data: publicSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  toggleFeature,
  getPublicSettings,
};