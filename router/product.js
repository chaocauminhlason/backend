const router = require("express").Router();
const Joi = require("joi");
const productController = require("../controller/product");
const validateDto = require("../middleware/validate");
const { stringReq, arrayReq, priceReq, discountReq, numberReq } = require("../middleware/JoiSheme");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.post(
  "/create-product",
  validateDto(
    Joi.object({
      name: stringReq,
      category: stringReq,
      image: arrayReq,
      des: stringReq,
      price: priceReq,
      discount: discountReq,
      color: arrayReq,
    })
  ),
  verifyToken,
  isAdmin,
  productController.createProduct
);
router.get("/get-products", productController.getProducts);
router.get("/get-product/:id", productController.getProduct);

router.put(
  "/update-product/:id",
  validateDto(
    Joi.object({
      name: stringReq,
      category: stringReq,
      image: arrayReq,
      des: stringReq,
      price: priceReq,
      discount: discountReq,
      color: arrayReq,
    })
  ),
  verifyToken,
  isAdmin,
  productController.updateProduct
);
router.delete(
  "/delete-product/:id",
  verifyToken,
  isAdmin,
  productController.deleteProduct
);
router.post(
  "/create-reviews/:id",
  validateDto(
    Joi.object({
      rating: numberReq,
      comment: stringReq,
    })
  ),
  verifyToken,
  productController.createReviews
);
module.exports = router;
