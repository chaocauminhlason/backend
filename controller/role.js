const Role = require("../models/Role");
const Permission = require("../models/Permission");
const User = require("../models/user");

// Get all roles with their permissions
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate("permissions").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: roles,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi lấy danh sách vai trò: " + error.message,
        });
    }
};

// Get single role by ID
const getRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id).populate("permissions");

        if (!role) {
            return res.status(404).json({
                success: false,
                mes: "Vai trò không tồn tại",
            });
        }

        res.status(200).json({
            success: true,
            data: role,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi lấy vai trò: " + error.message,
        });
    }
};

// Create new role
const createRole = async (req, res) => {
    try {
        const { name, code, description, permissions } = req.body;

        // Check if role code already exists
        const existingRole = await Role.findOne({ code });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                mes: "Mã vai trò đã tồn tại",
            });
        }

        // Validate permissions exist
        if (permissions && permissions.length > 0) {
            const validPermissions = await Permission.find({
                _id: { $in: permissions },
            });

            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    mes: "Một số quyền không hợp lệ",
                });
            }
        }

        const newRole = await Role.create({
            name,
            code,
            description,
            permissions: permissions || [],
            isSystemRole: false,
        });

        const populatedRole = await Role.findById(newRole._id).populate("permissions");

        res.status(201).json({
            success: true,
            mes: "Tạo vai trò thành công",
            data: populatedRole,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi tạo vai trò: " + error.message,
        });
    }
};

// Update role
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                mes: "Vai trò không tồn tại",
            });
        }

        // Don't allow updating system roles' core properties
        if (role.isSystemRole && (req.body.code || req.body.isSystemRole === false)) {
            return res.status(403).json({
                success: false,
                mes: "Không thể chỉnh sửa thuộc tính cốt lõi của vai trò hệ thống",
            });
        }

        // Validate permissions if provided
        if (permissions && permissions.length > 0) {
            const validPermissions = await Permission.find({
                _id: { $in: permissions },
            });

            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    mes: "Một số quyền không hợp lệ",
                });
            }
        }

        // Update fields
        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions !== undefined) role.permissions = permissions;

        await role.save();

        const updatedRole = await Role.findById(id).populate("permissions");

        res.status(200).json({
            success: true,
            mes: "Cập nhật vai trò thành công",
            data: updatedRole,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi cập nhật vai trò: " + error.message,
        });
    }
};

// Delete role
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                mes: "Vai trò không tồn tại",
            });
        }

        // Prevent deletion of system roles
        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                mes: "Không thể xóa vai trò hệ thống",
            });
        }

        // Check if any users have this role
        const usersWithRole = await User.countDocuments({ role: id });
        if (usersWithRole > 0) {
            return res.status(400).json({
                success: false,
                mes: `Không thể xóa vai trò có ${usersWithRole} người dùng đang sử dụng`,
            });
        }

        await Role.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            mes: "Xóa vai trò thành công",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi xóa vai trò: " + error.message,
        });
    }
};

// Assign role to user
const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        if (!userId || !roleId) {
            return res.status(400).json({
                success: false,
                mes: "Thiếu userId hoặc roleId",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                mes: "Người dùng không tồn tại",
            });
        }

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                mes: "Vai trò không tồn tại",
            });
        }

        user.role = roleId;
        await user.save();

        const updatedUser = await User.findById(userId).populate({
            path: "role",
            populate: { path: "permissions" },
        });

        res.status(200).json({
            success: true,
            mes: "Gán vai trò thành công",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mes: "Lỗi khi gán vai trò: " + error.message,
        });
    }
};

module.exports = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
};
