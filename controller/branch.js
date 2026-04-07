const branchService = require("../service/branch");
const BranchProduct = require("../models/branchProduct");
const BranchTransfer = require("../models/branchTransfer");
const Product = require("../models/product");

const createBranch = async (req, res) => {
  try {
    const branch = await branchService.createBranch(req.body);
    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const result = await branchService.getAllBranches(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const result = await branchService.getBranchById(req.params.branchId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await branchService.updateBranch(
      req.params.branchId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBranch = async (req, res) => {
  try {
    await branchService.deleteBranch(req.params.branchId);
    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBranchStatistics = async (req, res) => {
  try {
    const stats = await branchService.getBranchStatistics(
      req.params.branchId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const addProductToBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { productId, quantity, colorInventory, minStockLevel, location } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let branchProduct = await BranchProduct.findOne({
      branch: branchId,
      product: productId,
    });

    if (branchProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in this branch",
      });
    }

    branchProduct = new BranchProduct({
      branch: branchId,
      product: productId,
      quantity,
      colorInventory,
      minStockLevel,
      location,
    });

    await branchProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added to branch successfully",
      data: branchProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBranchProducts = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    const filter = { branch: branchId, isDeleted: false };
    if (search) {
      const products = await Product.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      filter.product = { $in: products.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;

    const [branchProducts, total] = await Promise.all([
      BranchProduct.find(filter)
        .populate("product")
        .populate("branch", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BranchProduct.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: branchProducts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBranchProduct = async (req, res) => {
  try {
    const { branchId, productId } = req.params;
    const updateData = req.body;

    const branchProduct = await BranchProduct.findOneAndUpdate(
      { branch: branchId, product: productId, isDeleted: false },
      { $set: { ...updateData, lastStockUpdate: Date.now() } },
      { new: true, runValidators: true }
    );

    if (!branchProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this branch",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product quantity updated",
      data: branchProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const { branchId } = req.params;

    const lowStockProducts = await BranchProduct.find({
      branch: branchId,
      isDeleted: false,
      $expr: { $lt: ["$quantity", "$minStockLevel"] },
    })
      .populate("product")
      .populate("branch", "name code");

    const formattedProducts = lowStockProducts.map((bp) => ({
      product: bp.product,
      branch: bp.branch,
      currentQuantity: bp.quantity,
      minStockLevel: bp.minStockLevel,
      status: bp.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }));

    res.status(200).json({
      success: true,
      data: {
        lowStockProducts: formattedProducts,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createTransfer = async (req, res) => {
  try {
    const { fromBranch, toBranch, items, reason, notes } = req.body;

    const transferCode = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => {
      const price = item.unitPrice || 0;
      return sum + price * item.quantity;
    }, 0);

    const transfer = new BranchTransfer({
      transferCode,
      fromBranch,
      toBranch,
      items,
      totalQuantity,
      totalValue,
      reason,
      notes,
      requestedBy: req.user._id,
    });

    await transfer.save();

    res.status(201).json({
      success: true,
      message: "Transfer request created",
      data: {
        transfer,
        transferCode,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const approveTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await BranchTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Transfer cannot be approved",
      });
    }

    transfer.status = "APPROVED";
    transfer.approvedBy = req.user._id;
    transfer.timestamps.approvedAt = Date.now();

    await transfer.save();

    res.status(200).json({
      success: true,
      message: "Transfer approved",
      data: transfer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const shipTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { carrier, trackingNumber, estimatedDelivery } = req.body;

    const transfer = await BranchTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Transfer must be approved first",
      });
    }

    for (const item of transfer.items) {
      const branchProduct = await BranchProduct.findOne({
        branch: transfer.fromBranch,
        product: item.product,
      });

      if (!branchProduct) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found in source branch`,
        });
      }

      const colorItem = branchProduct.colorInventory.find(
        (ci) => ci.color === item.color
      );

      if (!colorItem || colorItem.available < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.product} color ${item.color}`,
        });
      }

      colorItem.reserved += item.quantity;
      await branchProduct.save();
    }

    transfer.status = "IN_TRANSIT";
    transfer.shippedBy = req.user._id;
    transfer.shippingInfo = {
      carrier,
      trackingNumber,
      estimatedDelivery,
    };
    transfer.timestamps.shippedAt = Date.now();

    await transfer.save();

    res.status(200).json({
      success: true,
      message: "Transfer shipped",
      data: transfer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const receiveTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await BranchTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer.status !== "IN_TRANSIT") {
      return res.status(400).json({
        success: false,
        message: "Transfer must be in transit",
      });
    }

    for (const item of transfer.items) {
      const fromBranchProduct = await BranchProduct.findOne({
        branch: transfer.fromBranch,
        product: item.product,
      });

      const colorItemFrom = fromBranchProduct.colorInventory.find(
        (ci) => ci.color === item.color
      );
      colorItemFrom.quantity -= item.quantity;
      colorItemFrom.reserved -= item.quantity;
      await fromBranchProduct.save();

      let toBranchProduct = await BranchProduct.findOne({
        branch: transfer.toBranch,
        product: item.product,
      });

      if (!toBranchProduct) {
        toBranchProduct = new BranchProduct({
          branch: transfer.toBranch,
          product: item.product,
          quantity: 0,
          colorInventory: [],
        });
      }

      const colorItemTo = toBranchProduct.colorInventory.find(
        (ci) => ci.color === item.color
      );

      if (colorItemTo) {
        colorItemTo.quantity += item.quantity;
      } else {
        toBranchProduct.colorInventory.push({
          color: item.color,
          quantity: item.quantity,
        });
      }

      await toBranchProduct.save();
    }

    transfer.status = "DELIVERED";
    transfer.receivedBy = req.user._id;
    transfer.shippingInfo.actualDelivery = Date.now();
    transfer.timestamps.deliveredAt = Date.now();

    await transfer.save();

    res.status(200).json({
      success: true,
      message: "Transfer received and inventory updated",
      data: transfer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransfers = async (req, res) => {
  try {
    const { branch, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (branch) {
      filter.$or = [{ fromBranch: branch }, { toBranch: branch }];
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      BranchTransfer.find(filter)
        .populate("fromBranch", "name code")
        .populate("toBranch", "name code")
        .populate("requestedBy", "name email")
        .populate("approvedBy", "name email")
        .populate("items.product", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BranchTransfer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transfers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getBranchStatistics,
  addProductToBranch,
  getBranchProducts,
  updateBranchProduct,
  getLowStockProducts,
  createTransfer,
  approveTransfer,
  shipTransfer,
  receiveTransfer,
  getTransfers,
};
