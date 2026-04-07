const mongoose = require("mongoose");
const path = require("path");
const Settings = require("../models/settings");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const migrateHeaderToTheme = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected to MongoDB");
    let settings = await Settings.findOne();

    if (!settings) {
      console.log("No settings found to migrate");
      return;
    }

    // Convert to plain object for easier access
    settings = settings.toObject();

    console.log("\n========== MIGRATION: Header Colors to Theme ==========\n");
    console.log("Current header:", JSON.stringify(settings.header, null, 2));
    console.log("Current theme header colors:", {
      headerBackgroundColor: settings.theme?.headerBackgroundColor,
      headerTextColor: settings.theme?.headerTextColor,
      headerHoverColor: settings.theme?.headerHoverColor,
      headerFontFamily: settings.theme?.headerFontFamily,
      headerFontSize: settings.theme?.headerFontSize,
    });

    // Move header colors to theme
    const setOps = {};
    const unsetOps = {};
    let needsUpdate = false;

    // If header has colors, move them to theme (overwrite existing theme values)
    if (settings.header) {
      if (settings.header.backgroundColor) {
        setOps["theme.headerBackgroundColor"] = settings.header.backgroundColor;
        unsetOps["header.backgroundColor"] = "";
        needsUpdate = true;
        console.log(`Moving header.backgroundColor (${settings.header.backgroundColor}) to theme.headerBackgroundColor`);
      }

      if (settings.header.textColor) {
        setOps["theme.headerTextColor"] = settings.header.textColor;
        unsetOps["header.textColor"] = "";
        needsUpdate = true;
        console.log(`Moving header.textColor (${settings.header.textColor}) to theme.headerTextColor`);
      }

      if (settings.header.hoverColor) {
        setOps["theme.headerHoverColor"] = settings.header.hoverColor;
        unsetOps["header.hoverColor"] = "";
        needsUpdate = true;
        console.log(`Moving header.hoverColor (${settings.header.hoverColor}) to theme.headerHoverColor`);
      }

      if (settings.header.fontFamily) {
        setOps["theme.headerFontFamily"] = settings.header.fontFamily;
        unsetOps["header.fontFamily"] = "";
        needsUpdate = true;
        console.log(`Moving header.fontFamily (${settings.header.fontFamily}) to theme.headerFontFamily`);
      }

      if (settings.header.fontSize !== undefined) {
        setOps["theme.headerFontSize"] = settings.header.fontSize;
        unsetOps["header.fontSize"] = "";
        needsUpdate = true;
        console.log(`Moving header.fontSize (${settings.header.fontSize}) to theme.headerFontSize`);
      }
    }

    // Set defaults only if nothing was moved from header
    if (!setOps["theme.headerBackgroundColor"] && !settings.theme?.headerBackgroundColor) {
      setOps["theme.headerBackgroundColor"] = "#1a1a1a";
      needsUpdate = true;
      console.log("Setting default theme.headerBackgroundColor: #1a1a1a");
    }

    if (!setOps["theme.headerTextColor"] && !settings.theme?.headerTextColor) {
      setOps["theme.headerTextColor"] = "#ffffff";
      needsUpdate = true;
      console.log("Setting default theme.headerTextColor: #ffffff");
    }

    if (!setOps["theme.headerHoverColor"] && !settings.theme?.headerHoverColor) {
      setOps["theme.headerHoverColor"] = "#ff6b6b";
      needsUpdate = true;
      console.log("Setting default theme.headerHoverColor: #ff6b6b");
    }

    if (!setOps["theme.headerFontFamily"] && !settings.theme?.headerFontFamily) {
      setOps["theme.headerFontFamily"] = "'Roboto', sans-serif";
      needsUpdate = true;
      console.log("Setting default theme.headerFontFamily: 'Roboto', sans-serif");
    }

    if (!setOps["theme.headerFontSize"] && !settings.theme?.headerFontSize) {
      setOps["theme.headerFontSize"] = 16;
      needsUpdate = true;
      console.log("Setting default theme.headerFontSize: 16");
    }

    console.log("\nneedsUpdate:", needsUpdate);
    console.log("setOps:", setOps);
    console.log("unsetOps:", unsetOps);

    if (needsUpdate) {
      const updateQuery = {};
      if (Object.keys(setOps).length > 0) {
        updateQuery.$set = setOps;
      }
      if (Object.keys(unsetOps).length > 0) {
        updateQuery.$unset = unsetOps;
      }

      console.log("updateQuery:", JSON.stringify(updateQuery, null, 2));
      await Settings.updateOne({}, updateQuery);
      console.log("\n✓ Migration completed successfully!");
    } else {
      console.log("\n✓ No migration needed - settings already up to date");
    }

    console.log("\n========================================\n");
  } catch (error) {
    console.error("✗ Migration error:", error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

migrateHeaderToTheme()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
