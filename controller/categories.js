const CategogySerevice = require("../service/category");
const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const response = await CategogySerevice.createCategory(name, image);
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

const getCategory = async (req, res) => {
  try {
    const response = await CategogySerevice.getCategory();
    if (response)
      return res.status(200).json({
        success: true,
        category: response.category,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await CategogySerevice.updateCategory(id, req.body);
    if (response)
      return res.status(200).json({
        success: true,
        category: response.category,
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await CategogySerevice.deleteCategory(id);
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

module.exports = {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
