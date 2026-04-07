const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            // Vietnamese display name (e.g., "Quản lý sản phẩm", "Biên tập nội dung")
        },
        code: {
            type: String,
            required: true,
            unique: true,
            // Unique identifier (e.g., "product_manager", "content_editor", "admin", "user")
        },
        description: {
            type: String,
            default: "",
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],
        isSystemRole: {
            type: Boolean,
            default: false,
            // System roles (admin, user) cannot be deleted
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("Role", roleSchema);
