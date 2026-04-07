const Permission = require("../models/Permission");

// Get all permissions
const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ module: 1, code: 1 });

        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                all: permissions,
                grouped: groupedPermissions,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi lấy danh sách quyền: " + error.message,
        });
    }
};

// Get permissions by module
const getPermissionsByModule = async (req, res) => {
    try {
        const { module } = req.params;
        const permissions = await Permission.find({ module }).sort({ code: 1 });

        res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi lấy quyền theo module: " + error.message,
        });
    }
};

// Toggle permission active status
const togglePermission = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                mes: "Quyền không tồn tại",
            });
        }

        permission.isActive = !permission.isActive;
        await permission.save();

        res.status(200).json({
            success: true,
            mes: `Quyền đã được ${permission.isActive ? "kích hoạt" : "vô hiệu hóa"}`,
            data: permission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi chỉnh sửa quyền: " + error.message,
        });
    }
};

module.exports = {
    getPermissions,
    getPermissionsByModule,
    togglePermission,
};
