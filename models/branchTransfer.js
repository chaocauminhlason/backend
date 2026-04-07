const mongoose = require("mongoose");

const branchTransferSchema = new mongoose.Schema(
  {
    transferCode: {
      type: String,
      required: true,
      unique: true,
    },
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number },
        totalPrice: { type: Number },
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalValue: { type: Number, default: 0 },
    reason: {
      type: String,
      enum: [
        "RESTOCK",
        "CUSTOMER_REQUEST",
        "BALANCE_INVENTORY",
        "RETURN",
        "OTHER",
      ],
      default: "RESTOCK",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shippedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    shippingInfo: {
      carrier: { type: String },
      trackingNumber: { type: String },
      estimatedDelivery: { type: Date },
      actualDelivery: { type: Date },
      shippingCost: { type: Number, default: 0 },
    },
    notes: { type: String },
    timestamps: {
      requestedAt: { type: Date, default: Date.now },
      approvedAt: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

branchTransferSchema.index({ fromBranch: 1, status: 1 });
branchTransferSchema.index({ toBranch: 1, status: 1 });
branchTransferSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("BranchTransfer", branchTransferSchema);
