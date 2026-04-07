const Category = require("../models/category");

const categoriesSeed = [
  {
    name: "Iphone",
    slug: "iphone",
    image: {
      public_id: "CloneTopZone/Category/en3p9oorhiivbe7m8sta",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710826924/CloneTopZone/Category/en3p9oorhiivbe7m8sta.webp",
    },
  },
  {
    name: "Mac",
    slug: "mac",
    image: {
      public_id: "CloneTopZone/Category/inptpjpi7kjgwupgcjb0",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1709540906/CloneTopZone/Category/inptpjpi7kjgwupgcjb0.webp",
    },
  },
  {
    name: "Ipad",
    slug: "ipad",
    image: {
      public_id: "CloneTopZone/Category/vyj0fhhv9qgj3bpswtfv",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1709540994/CloneTopZone/Category/vyj0fhhv9qgj3bpswtfv.webp",
    },
  },
  {
    name: "Watch",
    slug: "watch",
    image: {
      public_id: "CloneTopZone/Category/ugexbyj3uevtcysfbatg",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1709541017/CloneTopZone/Category/ugexbyj3uevtcysfbatg.webp",
    },
  },
  {
    name: "Tai nghe",
    slug: "tai-nghe",
    image: {
      public_id: "CloneTopZone/Category/bk5edbmvv2okvpp215vu",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1709541064/CloneTopZone/Category/bk5edbmvv2okvpp215vu.webp",
    },
  },
  {
    name: "Phụ kện",
    slug: "phu-ken",
    image: {
      public_id: "CloneTopZone/Category/ufynwiwakbmu9m4oam9n",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710068767/CloneTopZone/Category/ufynwiwakbmu9m4oam9n.webp",
    },
  },
];

const seedCategories = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    // Insert new data
    const result = await Category.insertMany(categoriesSeed);

    return result;
  } catch (error) {
    console.error("✗ Error seeding categories:", error.message);
    throw error;
  }
};

module.exports = { seedCategories, categoriesSeed };