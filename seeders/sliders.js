const Slider = require("../models/slider");

const slidersSeed = [
  {
    image: {
      public_id: "CloneTopZone/Slider/tiwrf8hvlazsjkjqriqm",
      url: "http://res.cloudinary.com/dnicqkz3v/image/upload/v1709521847/CloneTopZone/Slider/tiwrf8hvlazsjkjqriqm.webp",
    },
  },
  {
    image: {
      public_id: "CloneTopZone/Slider/akg8mhms5ed3dmbty2ro",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1709521913/CloneTopZone/Slider/akg8mhms5ed3dmbty2ro.webp",
    },
  },
  {
    image: {
      public_id: "CloneTopZone/Slider/nrk1yftao3ctmeqhi6c1",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710258171/CloneTopZone/Slider/nrk1yftao3ctmeqhi6c1.webp",
    },
  },
  {
    image: {
      public_id: "CloneTopZone/Slider/utdwflh9mvlamavaa78l",
      url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1711693018/CloneTopZone/Slider/utdwflh9mvlamavaa78l.webp",
    },
  },
];

const seedSliders = async () => {
  try {
    // Clear existing data
    await Slider.deleteMany({});
  
    // Insert new data
    const result = await Slider.insertMany(slidersSeed);

    return result;
  } catch (error) {
    console.error("✗ Error seeding sliders:", error.message);
    throw error;
  }
};

module.exports = { seedSliders };