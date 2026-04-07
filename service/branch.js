const Branch = require("../models/branch");
const BranchProduct = require("../models/branchProduct");
const Order = require("../models/order");

class BranchService {
  async createBranch(branchData) {
    const branch = new Branch(branchData);
    await branch.save();
    return branch;
  }

  async getAllBranches(query = {}) {
    const { status, type, city, page = 1, limit = 20, search } = query;
    
    const filter = { isDeleted: false };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (city) filter["address.city"] = city;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [branches, total] = await Promise.all([
      Branch.find(filter)
        .populate("manager", "name email phone")
        .populate("parentBranch", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Branch.countDocuments(filter),
    ]);

    return {
      branches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBranchById(branchId) {
    const branch = await Branch.findOne({ _id: branchId, isDeleted: false })
      .populate("manager", "name email phone")
      .populate("parentBranch", "name code");

    if (!branch) {
      throw new Error("Branch not found");
    }

    const [totalProducts, totalOrders, productStats] = await Promise.all([
      BranchProduct.countDocuments({ branch: branchId, isDeleted: false }),
      Order.countDocuments({ branch: branchId }),
      BranchProduct.aggregate([
        { $match: { branch: branchId, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$stats.totalRevenue" },
            totalSold: { $sum: "$stats.totalSold" },
          },
        },
      ]),
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue: productStats[0]?.totalRevenue || 0,
      totalSold: productStats[0]?.totalSold || 0,
      totalEmployees: branch.metadata.totalEmployees,
    };

    return { branch, stats };
  }

  async updateBranch(branchId, updateData) {
    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!branch) {
      throw new Error("Branch not found");
    }

    return branch;
  }

  async deleteBranch(branchId) {
    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, isDeleted: false },
      { $set: { isDeleted: true, status: "INACTIVE" } },
      { new: true }
    );

    if (!branch) {
      throw new Error("Branch not found");
    }

    return branch;
  }

  async getBranchStatistics(branchId, dateRange = {}) {
    const { from, to } = dateRange;
    const filter = { branch: branchId };
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [orderStats, productStats] = await Promise.all([
      Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$finalPrice" },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: "$finalPrice" },
          },
        },
      ]),
      BranchProduct.aggregate([
        { $match: { branch: branchId, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$quantity" },
            lowStockItems: {
              $sum: {
                $cond: [{ $lt: ["$quantity", "$minStockLevel"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    return {
      orders: orderStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
      inventory: productStats[0] || { totalProducts: 0, totalStock: 0, lowStockItems: 0 },
    };
  }
}

module.exports = new BranchService();
