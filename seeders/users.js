const User = require("../models/user");
const Product = require("../models/product");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

const usersSeed = async () => {
  try {
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 10);

    const products = await Product.find().limit(6);
    const productIds = products.map((p) => p._id);

    const adminRole = await Role.findOne({ code: "admin" });
    const userRole = await Role.findOne({ code: "user" });

    if (!adminRole || !userRole) {
      throw new Error("Roles not found. Please run permissions and roles seeder first.");
    }

    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role: adminRole._id,
        phone: "0912345678",
        address: "Hà Nội, Việt Nam",
        cart: [],
        wishlist: productIds.slice(0, 3),
      },
      {
        name: "Nguyễn Văn A",
        email: "user1@example.com",
        password: hashedPassword,
        role: userRole._id,
        phone: "0933445566",
        address: "TP Hồ Chí Minh, Việt Nam",
        cart: [],
        wishlist: productIds.slice(0, 2),
      },
      {
        name: "Trần Thị B",
        email: "user2@example.com",
        password: hashedPassword,
        role: userRole._id,
        phone: "0944556677",
        address: "Đà Nẵng, Việt Nam",
        cart: [],
        wishlist: productIds.slice(2, 5),
      },
      {
        name: "Lê Văn C",
        email: "user3@example.com",
        password: hashedPassword,
        role: userRole._id,
        phone: "0955667788",
        address: "Cần Thơ, Việt Nam",
        cart: [],
        wishlist: productIds.slice(1, 4),
      },
      {
        name: "Phạm Thị D",
        email: "user4@example.com",
        password: hashedPassword,
        role: userRole._id,
        phone: "0966778899",
        address: "Hải Phòng, Việt Nam",
        cart: [],
        wishlist: productIds.slice(3, 6),
      },
    ];

    const result = await User.insertMany(users);
    return result;
  } catch (error) {
    console.error("✗ Error seeding users:", error.message);
    throw error;
  }
};

module.exports = { usersSeed };