const router = require("express").Router();
const Joi = require("joi");
const eventController = require("../controller/event");
const validateDto = require("../middleware/validate");
const { stringReq, arrayReq, discountReq } = require("../middleware/JoiSheme");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.post(
  "/create-event",
  validateDto(
    Joi.object({
      name: stringReq,
      description: stringReq,
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      discountPercent: discountReq,
      products: arrayReq,
      banner: Joi.string().allow(null, ""),
    })
  ),
  verifyToken,
  isAdmin,
  eventController.createEvent
);

router.get("/get-active-events", eventController.getActiveEvents);
router.get("/get-events", verifyToken, isAdmin, eventController.getEvents);
router.get("/get-event/:id", eventController.getEventById);

router.put(
  "/update-event/:id",
  validateDto(
    Joi.object({
      name: stringReq,
      description: stringReq,
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      discountPercent: discountReq,
      products: arrayReq,
      banner: Joi.string().allow(null, ""),
      isActive: Joi.boolean(),
    })
  ),
  verifyToken,
  isAdmin,
  eventController.updateEvent
);

router.delete(
  "/delete-event/:id",
  verifyToken,
  isAdmin,
  eventController.deleteEvent
);

module.exports = router;
