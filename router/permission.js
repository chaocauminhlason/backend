const router = require("express").Router();
const permissionController = require("../controller/permission");
const { verifyToken, hasPermission } = require("../middleware/auth");

// Get all permissions (grouped by module)
router.get(
    "/",
    verifyToken,
    hasPermission("permissions.read"),
    permissionController.getPermissions
);

// Get permissions by module
router.get(
    "/module/:module",
    verifyToken,
    hasPermission("permissions.read"),
    permissionController.getPermissionsByModule
);

// Toggle permission active status
router.patch(
    "/:id/toggle",
    verifyToken,
    hasPermission("permissions.update"),
    permissionController.togglePermission
);

module.exports = router;
