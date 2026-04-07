const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            // Format: "module.action" (e.g., "products.create", "orders.read")
        },
        name: {
            type: String,
            required: true,
            // Vietnamese display name (e.g., "Tạo sản phẩm", "Xem đơn hàng")
        },
        module: {
            type: String,
            required: true,
            // Module grouping (e.g., "products", "orders", "users")
        },
        description: {
            type: String,
            default: "",
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

permissionSchema.index({ module: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
