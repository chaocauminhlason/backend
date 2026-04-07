const ProductSerevice = require("../service/product");
const createProduct = async (req, res) => {
  try {
    const response = await ProductSerevice.createProduct(req.body);
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

const getProducts = async (req, res) => {
  try {
    const { name, page, category, minPrice, maxPrice } = req.query;
    let limit = process.env.LIMIT || 10;
    const options = {
      page: page || 1,
      limit: limit,
      category,
      minPrice,
      maxPrice,
    };
    if (name) {
      options.name = name;
    }
    const response = await ProductSerevice.getProducts({ ...options });
    if (response)
      return res.status(200).json({
        success: true,
        products: response.product,
        totalProducts: response.totalProducts,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProductSerevice.getProduct(id);
    if (response)
      return res.status(200).json({
        success: true,
        product: response.product,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProductSerevice.deleteProduct(id);
    if (response)
      return res.status(200).json({
        success: true,
        mes: "Xóa thành công",
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProductSerevice.updateProduct(id, req.body);
    if (response)
      return res.status(200).json({
        success: true,
        product: response.product,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const createReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProductSerevice.createReviews(
      id,
      req.body,
      req.user.id
    );
    if (response.success) {
      return res.status(200).json({
        success: true,
        product: response.product,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  createReviews,
};
