const PromoCode = require("../models/promoCode");

const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: promoCodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      expiryDate,
      description,
      isActive,
      isPublic,
      pointsCost,
      redemptionCooldown,
    } = req.body;

    const existingCode = await PromoCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã tồn tại",
      });
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || 999999,
      perUserLimit: perUserLimit || 1,
      expiryDate: expiryDate || null,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
      isPublic: isPublic || false,
      pointsCost: pointsCost || null,
      redemptionCooldown: redemptionCooldown || 24,
      source: "admin",
      usedBy: [],
    });

    res.status(201).json({
      success: true,
      message: "Tạo mã thành công",
      data: promoCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      
      const existingCode = await PromoCode.findOne({
        code: updateData.code,
        _id: { $ne: id },
      });

      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá đã tồn tại",
        });
      }
    }

    const promoCode = await PromoCode.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: promoCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const togglePromoCodeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findById(id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    promoCode.isActive = !promoCode.isActive;
    await promoCode.save();

    res.status(200).json({
      success: true,
      message: `${promoCode.isActive ? "Kích hoạt" : "Tắt"} mã thành công`,
      data: promoCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
};
