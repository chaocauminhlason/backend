const OrderSerevice = require("../service/order");

const createOrder = async (req, res) => {
  try {
    const response = await OrderSerevice.createOrder(req.body);
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || parseInt(process.env.LIMIT) || 10;
    const response = await OrderSerevice.getOrders.getOrders({ page, limit });
    const totalOrders = await OrderSerevice.getOrders.countOrders();
    if (response) {
      return res.status(200).json({
        success: true,
        totalPages: totalOrders,
        currentPage: page,
        orders: response,


      });
    } else {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy đơn hàng nào.",
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra.",
    });
  }
};

const getOrderDasboard = async (req, res) => {
  try {

    const response = await OrderSerevice.getOrdersDasboard();
    if (response) {
      return res.status(200).json({
        success: true,
        orders: response,
      });
    } else {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy đơn hàng nào.",
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra.",
    });
  }
};


const getOrderUser = async (req, res) => {
  try {
    const response = await OrderSerevice.getOrderUser(req.params.id);
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const cancleOrder = async (req, res) => {
  try {
    const response = await OrderSerevice.cancleOrder(req.params.id);
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const response = await OrderSerevice.deleteOrder(req.params.id);
    if (response)
      return res.status(200).json({
        success: true,
        mes: "Xóa đơn hàng thành công",
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const updateStatusOrder = async (req, res) => {
  try {
    const response = await OrderSerevice.updateStatusOrder(
      req.params.id,
      req.body
    );
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
module.exports = {
  createOrder,
  getOrderUser,
  getOrders,
  cancleOrder,
  deleteOrder,
  updateStatusOrder,
  getOrderDasboard
};
