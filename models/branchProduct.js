const mongoose = require("mongoose");

const branchProductSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
    },
    maxStockLevel: {
      type: Number,
      default: 1000,
    },
    reorderPoint: {
      type: Number,
      default: 20,
    },
    reorderQuantity: {
      type: Number,
      default: 50,
    },
    colorInventory: [
      {
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        reserved: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
      },
    ],
    price: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    location: {
      aisle: { type: String },
      shelf: { type: String },
      bin: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailableOnline: {
      type: Boolean,
      default: true,
    },
    stats: {
      totalSold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      lastSoldDate: { type: Date },
      turnoverRate: { type: Number, default: 0 },
    },
    notes: { type: String },
    lastStockUpdate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

branchProductSchema.index({ branch: 1, product: 1 }, { unique: true });
branchProductSchema.index({ branch: 1, quantity: 1 });
branchProductSchema.index({ branch: 1, isActive: 1 });
branchProductSchema.index({ product: 1, branch: 1 });

branchProductSchema.pre("save", function (next) {
  if (this.colorInventory && this.colorInventory.length > 0) {
    this.colorInventory.forEach((item) => {
      item.available = item.quantity - (item.reserved || 0);
    });
    this.quantity = this.colorInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }
  next();
});

module.exports = mongoose.model("BranchProduct", branchProductSchema);
