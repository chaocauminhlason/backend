const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["HEADQUARTER", "BRANCH", "WAREHOUSE", "STORE"],
      default: "BRANCH",
    },
    address: {
      street: { type: String, required: true },
      ward: { type: String },
      district: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      fax: { type: String },
      website: { type: String },
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    parentBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    settings: {
      timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
      currency: { type: String, default: "VND" },
      language: { type: String, default: "vi" },
      businessHours: {
        monday: { open: String, close: String, isClosed: Boolean },
        tuesday: { open: String, close: String, isClosed: Boolean },
        wednesday: { open: String, close: String, isClosed: Boolean },
        thursday: { open: String, close: String, isClosed: Boolean },
        friday: { open: String, close: String, isClosed: Boolean },
        saturday: { open: String, close: String, isClosed: Boolean },
        sunday: { open: String, close: String, isClosed: Boolean },
      },
      autoApproveOrders: { type: Boolean, default: false },
      allowOnlineOrders: { type: Boolean, default: true },
      allowWalkInOrders: { type: Boolean, default: true },
    },
    financial: {
      bankName: { type: String },
      bankAccount: { type: String },
      taxCode: { type: String },
      monthlyRevenue: { type: Number, default: 0 },
      yearlyRevenue: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "CLOSED", "UNDER_CONSTRUCTION"],
      default: "ACTIVE",
    },
    openingDate: { type: Date },
    closingDate: { type: Date },
    metadata: {
      totalEmployees: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

branchSchema.index({ type: 1, status: 1 });
branchSchema.index({ "address.city": 1 });
branchSchema.index({ manager: 1 });

module.exports = mongoose.model("Branch", branchSchema);
