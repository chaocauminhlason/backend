const mongoose = require("mongoose");
const Settings = require("../models/settings");
require("dotenv").config();

const migrateSettingsTheme = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected to MongoDB");

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log("❌ No settings found. Please run the seeder first.");
      process.exit(1);
    }

    if (!settings.theme || Object.keys(settings.theme).length < 10) {
      console.log("📝 Updating settings with theme configuration...");
      
      settings.theme = {
        primaryColor: "#007bff",
        secondaryColor: "#6c757d",
        accentColor: "#28a745",
        successColor: "#28a745",
        dangerColor: "#dc3545",
        warningColor: "#ffc107",
        infoColor: "#17a2b8",
        backgroundColor: "#ffffff",
        backgroundSecondaryColor: "#f8f9fa",
        surfaceColor: "#ffffff",
        cardBackgroundColor: "#ffffff",
        textColor: "#212529",
        textSecondaryColor: "#6c757d",
        textLightColor: "#868e96",
        borderColor: "#dee2e6",
        borderLightColor: "#e9ecef",
        hoverColor: "#0056b3",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        linkColor: "#007bff",
        linkHoverColor: "#0056b3",
        buttonPrimaryBg: "#007bff",
        buttonPrimaryText: "#ffffff",
        buttonSecondaryBg: "#6c757d",
        buttonSecondaryText: "#ffffff",
        inputBorderColor: "#ced4da",
        inputBackgroundColor: "#ffffff",
        inputTextColor: "#212529",
        footerBackgroundColor: "#1a1a1a",
        footerTextColor: "#ffffff",
        borderRadius: 8,
        fontFamily: "'Roboto', sans-serif",
        fontSize: 16,
      };

      await settings.save();
      console.log("✅ Settings theme updated successfully!");
    } else {
      console.log("✓ Theme already exists in settings");
    }

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error migrating settings:", error.message);
    process.exit(1);
  }
};

migrateSettingsTheme();
