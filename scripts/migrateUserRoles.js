const User = require("../models/user");
const Role = require("../models/Role");
const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Migration script to convert string-based roles to ObjectId references
 * Run this after seeding permissions and roles
 */
async function migrateUserRoles() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        // Get system roles
        const adminRole = await Role.findOne({ code: "admin" });
        const userRole = await Role.findOne({ code: "user" });

        if (!adminRole || !userRole) {
            throw new Error("System roles not found. Please run permissions and roles seeder first.");
        }

        console.log("📋 Found system roles:");
        console.log(`   - Admin: ${adminRole._id}`);
        console.log(`   - User: ${userRole._id}`);

        // Find all users with string-based roles
        const usersToMigrate = await User.find({
            role: { $type: "string" }
        });

        console.log(`\n🔍 Found ${usersToMigrate.length} users to migrate`);

        let adminCount = 0;
        let userCount = 0;

        // Migrate each user
        for (const user of usersToMigrate) {
            if (user.role === "admin") {
                user.role = adminRole._id;
                adminCount++;
            } else {
                user.role = userRole._id;
                userCount++;
            }
            await user.save();
        }

        console.log("\n✅ Migration completed!");
        console.log(`   - Admins migrated: ${adminCount}`);
        console.log(`   - Users migrated: ${userCount}`);
        console.log(`   - Total: ${usersToMigrate.length}`);

        // Verify migration
        const remainingStringRoles = await User.countDocuments({
            role: { $type: "string" }
        });

        if (remainingStringRoles > 0) {
            console.warn(`\n⚠️  Warning: ${remainingStringRoles} users still have string-based roles`);
        } else {
            console.log("\n✅ All users successfully migrated to new role system");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error migrating user roles:", error);
        process.exit(1);
    }
}

// Run the migration
migrateUserRoles();
