const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const removeHeaderColors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected to MongoDB");

    console.log("\n========== REMOVING Header Color Fields ==========\n");

    // Use native MongoDB collection to bypass Mongoose schema defaults
    const db = mongoose.connection.db;
    const settingsCollection = db.collection("settings");

    const result = await settingsCollection.updateOne(
      {},
      {
        $unset: {
          "header.backgroundColor": "",
          "header.textColor": "",
          "header.hoverColor": "",
          "header.fontFamily": "",
          "header.fontSize": ""
        }
      }
    );

    console.log("Update result:", result);
    console.log("\n✓ Removed color fields from header!");

    // Verify
    const settings = await settingsCollection.findOne({});
    console.log("\nHeader after removal:", JSON.stringify(settings.header, null, 2));

    console.log("\n========================================\n");
  } catch (error) {
    console.error("✗ Error:", error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

removeHeaderColors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
