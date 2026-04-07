const mongoose = require("mongoose");

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    image: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    des: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, max: 100 },
    quantity: { type: Number, min: 0 },
    minStockLevel: { type: Number, default: 10 },
    maxStockLevel: { type: Number, default: 1000 },
    color: [
      {
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
    reviews: [
      {
        user: {
          type: Object,
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },
        createAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sold_out: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = generateSlug(this.name);
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
