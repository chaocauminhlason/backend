const mongoose = require("mongoose");
const User = require("../models/user");
const LoyaltyPoint = require("../models/loyaltyPoint");

const migrateGamePoints = async () => {
  try {
    console.log("Starting migration: user.loyaltyPoints -> LoyaltyPoint.gamePoints");

    const users = await User.find({ loyaltyPoints: { $gt: 0 } });
    console.log(`Found ${users.length} users with loyaltyPoints > 0`);

    let migrated = 0;
    let created = 0;

    for (const user of users) {
      let loyaltyPoint = await LoyaltyPoint.findOne({ user: user._id });

      if (!loyaltyPoint) {
        loyaltyPoint = new LoyaltyPoint({
          user: user._id,
          balance: 0,
          gamePoints: user.loyaltyPoints || 0,
          tier: "bronze",
        });
        created++;
      } else {
        loyaltyPoint.gamePoints = (loyaltyPoint.gamePoints || 0) + (user.loyaltyPoints || 0);
      }

      loyaltyPoint.transactions.push({
        type: "adjust",
        amount: user.loyaltyPoints || 0,
        reason: "Migration from user.loyaltyPoints",
        referenceModel: "User",
      });

      await loyaltyPoint.save();
      migrated++;

      console.log(`Migrated ${user.email}: ${user.loyaltyPoints} points -> LoyaltyPoint.gamePoints`);
    }

    console.log(`\nMigration completed!`);
    console.log(`- Total users migrated: ${migrated}`);
    console.log(`- New LoyaltyPoint records created: ${created}`);
    console.log(`- Existing LoyaltyPoint records updated: ${migrated - created}`);

    return {
      success: true,
      migrated,
      created,
    };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, error: error.message };
  }
};

// Run if called directly
if (require.main === module) {
  const dbURL = process.env.DATABASE_URL || "mongodb://localhost:27017/ecommerce";
  
  mongoose
    .connect(dbURL)
    .then(() => {
      console.log("Connected to MongoDB");
      return migrateGamePoints();
    })
    .then((result) => {
      console.log("Result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

module.exports = migrateGamePoints;
