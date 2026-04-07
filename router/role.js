const router = require("express").Router();
const Joi = require("joi");
const roleController = require("../controller/role");
const validateDto = require("../middleware/validate");
const { stringReq, arrayReq } = require("../middleware/JoiSheme");
const { verifyToken, hasPermission } = require("../middleware/auth");

// Get all roles
router.get("/", verifyToken, hasPermission("roles.read"), roleController.getRoles);

// Get single role
router.get("/:id", verifyToken, hasPermission("roles.read"), roleController.getRole);

// Create role
router.post(
    "/",
    validateDto(
        Joi.object({
            name: stringReq,
            code: stringReq,
            description: Joi.string().allow("").optional(),
            permissions: arrayReq,
        })
    ),
    verifyToken,
    hasPermission("roles.create"),
    roleController.createRole
);

// Update role
router.put(
    "/:id",
    validateDto(
        Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().allow("").optional(),
            permissions: Joi.array().optional(),
        })
    ),
    verifyToken,
    hasPermission("roles.update"),
    roleController.updateRole
);

// Delete role
router.delete(
    "/:id",
    verifyToken,
    hasPermission("roles.delete"),
    roleController.deleteRole
);

// Assign role to user
router.post(
    "/assign",
    validateDto(
        Joi.object({
            userId: stringReq,
            roleId: stringReq,
        })
    ),
    verifyToken,
    hasPermission("users.update"),
    roleController.assignRoleToUser
);

module.exports = router;
