/**
 * Migration Script: User.loyaltyPoints -> LoyaltyPoint Collection
 * 
 * Chuyển dữ liệu điểm từ User model sang LoyaltyPoint collection
 * Usage: node migrations/migrateLoyaltyPoints.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const LoyaltyPoint = require("../models/loyaltyPoint");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const migrateLoyaltyPoints = async () => {
  try {
    console.log("\n🔄 Starting Loyalty Points Migration...\n");
    console.log("═".repeat(50));

    const users = await User.find({});
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const existingLoyalty = await LoyaltyPoint.findOne({ user: user._id });

        if (existingLoyalty) {
          console.log(`⊘ User ${user.email}: Already migrated`);
          skippedCount++;
          continue;
        }

        const referralCode = `REF${user._id.toString().slice(-6)}`.toUpperCase();

        const loyaltyPoint = new LoyaltyPoint({
          user: user._id,
          balance: user.loyaltyPoints || 0,
          lifetime: user.loyaltyPoints || 0,
          tier: "bronze",
          referralCode,
          transactions: [],
        });

        if (user.loyaltyPoints > 0) {
          loyaltyPoint.transactions.push({
            type: "adjust",
            amount: user.loyaltyPoints,
            reason: "Migrated from old system",
            createdAt: new Date(),
          });
        }

        await loyaltyPoint.save();
        migratedCount++;
        console.log(`✓ User ${user.email}: Migrated ${user.loyaltyPoints || 0} points`);
      } catch (error) {
        errorCount++;
        console.error(`✗ User ${user.email}: Migration failed - ${error.message}`);
      }
    }

    console.log("\n" + "═".repeat(50));
    console.log("\n📊 Migration Summary:");
    console.log(`   • Total users: ${users.length}`);
    console.log(`   • Migrated: ${migratedCount}`);
    console.log(`   • Skipped: ${skippedCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log("\n✅ Migration completed!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed\n");
  }
};

(async () => {
  await connectDB();
  await migrateLoyaltyPoints();
})();
