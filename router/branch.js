const router = require("express").Router();
const branchController = require("../controller/branch");
const auth = require("../middleware/auth");

router.post("/", auth.verifyToken, auth.isAdmin, branchController.createBranch);

router.get("/", auth.verifyToken, branchController.getAllBranches);

router.get("/:branchId", auth.verifyToken, branchController.getBranchById);

router.put("/:branchId", auth.verifyToken, auth.isAdmin, branchController.updateBranch);

router.delete("/:branchId", auth.verifyToken, auth.isAdmin, branchController.deleteBranch);

router.get("/:branchId/statistics", auth.verifyToken, branchController.getBranchStatistics);

router.post("/:branchId/products", auth.verifyToken, auth.isAdmin, branchController.addProductToBranch);

router.get("/:branchId/products", auth.verifyToken, branchController.getBranchProducts);

router.patch("/:branchId/products/:productId", auth.verifyToken, auth.isAdmin, branchController.updateBranchProduct);

router.get("/:branchId/products/low-stock", auth.verifyToken, branchController.getLowStockProducts);

router.post("/transfers", auth.verifyToken, branchController.createTransfer);

router.get("/transfers/list", auth.verifyToken, branchController.getTransfers);

router.post("/transfers/:transferId/approve", auth.verifyToken, auth.isAdmin, branchController.approveTransfer);

router.post("/transfers/:transferId/ship", auth.verifyToken, branchController.shipTransfer);

router.post("/transfers/:transferId/receive", auth.verifyToken, branchController.receiveTransfer);

module.exports = router;
