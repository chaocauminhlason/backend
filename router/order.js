const router = require("express").Router();
const Joi = require("joi");
const orderController = require("../controller/order");
const validateDto = require("../middleware/validate");
const {
  arrayReq,
  stringReq,
  numberReq,
  objectReq,
} = require("../middleware/JoiSheme");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.post(
  "/create-order",
  verifyToken,
  validateDto(
    Joi.object({
      user: objectReq,
      payments: stringReq,
      products: arrayReq,
      totalPrice: numberReq,
      finalPrice: Joi.number().optional(),
      discountAmount: Joi.number().optional(),
      promoCode: Joi.string().allow(null).optional(),
    })
  ),
  orderController.createOrder
);
router.get("/get-order-user/:id", verifyToken, orderController.getOrderUser);
router.patch("/cancle-order/:id", verifyToken, orderController.cancleOrder);
router.delete(
  "/delete-order/:id",
  verifyToken,
  isAdmin,
  orderController.deleteOrder
);
router.patch(
  "/update-order/:id",
  // validateDto(
  //   Joi.object({
  //     status: stringReq,
  //   })
  // ),
  verifyToken,
  isAdmin,
  orderController.updateStatusOrder
);
router.get("/get-orders", verifyToken, isAdmin, orderController.getOrders);
router.get("/get-order-dasboard", verifyToken, isAdmin, orderController.getOrderDasboard);


module.exports = router;
