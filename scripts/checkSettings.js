const mongoose = require("mongoose");
const Settings = require("../models/settings");
require("dotenv").config();

const checkSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected to MongoDB");

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log("❌ No settings found in database");
      process.exit(1);
    }

    console.log("\n========== SETTINGS DEBUG INFO ==========\n");
    
    console.log("📌 Header Configuration:");
    console.log(JSON.stringify(settings.header, null, 2));
    
    console.log("\n📌 Theme Configuration:");
    console.log(JSON.stringify(settings.theme, null, 2));
    
    console.log("\n========================================\n");

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkSettings();
