const Permission = require("../models/Permission");
const Role = require("../models/Role");

const PERMISSIONS = [
    // Products Module
    { code: "products.create", name: "Tạo sản phẩm", module: "products", description: "Tạo sản phẩm mới" },
    { code: "products.read", name: "Xem sản phẩm", module: "products", description: "Xem danh sách và chi tiết sản phẩm" },
    { code: "products.update", name: "Sửa sản phẩm", module: "products", description: "Chỉnh sửa thông tin sản phẩm" },
    { code: "products.delete", name: "Xóa sản phẩm", module: "products", description: "Xóa sản phẩm" },

    // Orders Module
    { code: "orders.read", name: "Xem đơn hàng", module: "orders", description: "Xem đơn hàng của mình" },
    { code: "orders.view_all", name: "Xem tất cả đơn hàng", module: "orders", description: "Xem tất cả đơn hàng trong hệ thống" },
    { code: "orders.update_status", name: "Cập nhật trạng thái đơn hàng", module: "orders", description: "Thay đổi trạng thái đơn hàng" },
    { code: "orders.delete", name: "Xóa đơn hàng", module: "orders", description: "Xóa đơn hàng" },

    // Users Module
    { code: "users.read", name: "Xem người dùng", module: "users", description: "Xem thông tin người dùng" },
    { code: "users.view_all", name: "Xem tất cả người dùng", module: "users", description: "Xem danh sách tất cả người dùng" },
    { code: "users.update", name: "Sửa người dùng", module: "users", description: "Chỉnh sửa thông tin người dùng" },
    { code: "users.delete", name: "Xóa người dùng", module: "users", description: "Xóa người dùng" },

    // Categories Module
    { code: "categories.create", name: "Tạo danh mục", module: "categories", description: "Tạo danh mục mới" },
    { code: "categories.read", name: "Xem danh mục", module: "categories", description: "Xem danh sách danh mục" },
    { code: "categories.update", name: "Sửa danh mục", module: "categories", description: "Chỉnh sửa danh mục" },
    { code: "categories.delete", name: "Xóa danh mục", module: "categories", description: "Xóa danh mục" },

    // Blogs Module
    { code: "blogs.create", name: "Tạo blog", module: "blogs", description: "Tạo bài blog mới" },
    { code: "blogs.read", name: "Xem blog", module: "blogs", description: "Xem bài blog" },
    { code: "blogs.update", name: "Sửa blog", module: "blogs", description: "Chỉnh sửa bài blog" },
    { code: "blogs.delete", name: "Xóa blog", module: "blogs", description: "Xóa bài blog" },

    // Events Module
    { code: "events.create", name: "Tạo sự kiện", module: "events", description: "Tạo sự kiện mới" },
    { code: "events.read", name: "Xem sự kiện", module: "events", description: "Xem sự kiện" },
    { code: "events.update", name: "Sửa sự kiện", module: "events", description: "Chỉnh sửa sự kiện" },
    { code: "events.delete", name: "Xóa sự kiện", module: "events", description: "Xóa sự kiện" },

    // Settings Module
    { code: "settings.read", name: "Xem cài đặt", module: "settings", description: "Xem cài đặt hệ thống" },
    { code: "settings.update", name: "Sửa cài đặt", module: "settings", description: "Chỉnh sửa cài đặt hệ thống" },
    { code: "settings.toggle_features", name: "Bật/tắt tính năng", module: "settings", description: "Bật/tắt các tính năng hệ thống" },

    // Loyalty Module
    { code: "loyalty.manage_rewards", name: "Quản lý phần thưởng", module: "loyalty", description: "Quản lý phần thưởng tích điểm" },
    { code: "loyalty.manage_points", name: "Quản lý điểm thưởng", module: "loyalty", description: "Thêm/trừ điểm thưởng người dùng" },

    // Sliders Module
    { code: "sliders.create", name: "Tạo slider", module: "sliders", description: "Tạo slider mới" },
    { code: "sliders.update", name: "Sửa slider", module: "sliders", description: "Chỉnh sửa slider" },
    { code: "sliders.delete", name: "Xóa slider", module: "sliders", description: "Xóa slider" },

    // Promo Codes Module
    { code: "promo_codes.create", name: "Tạo mã giảm giá", module: "promo_codes", description: "Tạo mã giảm giá mới" },
    { code: "promo_codes.read", name: "Xem mã giảm giá", module: "promo_codes", description: "Xem danh sách mã giảm giá" },
    { code: "promo_codes.update", name: "Sửa mã giảm giá", module: "promo_codes", description: "Chỉnh sửa mã giảm giá" },
    { code: "promo_codes.delete", name: "Xóa mã giảm giá", module: "promo_codes", description: "Xóa mã giảm giá" },

    // Roles Module
    { code: "roles.create", name: "Tạo vai trò", module: "roles", description: "Tạo vai trò mới" },
    { code: "roles.read", name: "Xem vai trò", module: "roles", description: "Xem danh sách vai trò" },
    { code: "roles.update", name: "Sửa vai trò", module: "roles", description: "Chỉnh sửa vai trò" },
    { code: "roles.delete", name: "Xóa vai trò", module: "roles", description: "Xóa vai trò" },

    // Permissions Module
    { code: "permissions.read", name: "Xem quyền", module: "permissions", description: "Xem danh sách quyền" },
    { code: "permissions.update", name: "Sửa quyền", module: "permissions", description: "Bật/tắt quyền" },
];

const seedPermissionsAndRoles = async () => {
    try {
        await Permission.deleteMany({});
        await Role.deleteMany({});

        const createdPermissions = await Permission.insertMany(PERMISSIONS);
        const allPermissionIds = createdPermissions.map(p => p._id);

        await Role.create({
            name: "Quản trị viên",
            code: "admin",
            description: "Quyền quản trị viên - có toàn quyền",
            permissions: allPermissionIds,
            isSystemRole: true,
            isActive: true,
        });

        const basicReadPermissions = createdPermissions
            .filter(p =>
                p.code === "products.read" ||
                p.code === "categories.read" ||
                p.code === "blogs.read" ||
                p.code === "events.read" ||
                p.code === "orders.read"
            )
            .map(p => p._id);

        await Role.create({
            name: "Người dùng",
            code: "user",
            description: "Vai trò người dùng thông thường",
            permissions: basicReadPermissions,
            isSystemRole: true,
            isActive: true,
        });

        const productPermissions = createdPermissions
            .filter(p => p.module === "products" || p.module === "categories")
            .map(p => p._id);

        await Role.create({
            name: "Quản lý sản phẩm",
            code: "product_manager",
            description: "Quản lý sản phẩm và danh mục",
            permissions: productPermissions,
            isSystemRole: false,
            isActive: true,
        });

        const orderPermissions = createdPermissions
            .filter(p =>
                p.module === "orders" ||
                p.code === "users.view_all" ||
                p.code === "users.read"
            )
            .map(p => p._id);

        await Role.create({
            name: "Quản lý đơn hàng",
            code: "order_manager",
            description: "Quản lý và xử lý đơn hàng",
            permissions: orderPermissions,
            isSystemRole: false,
            isActive: true,
        });

        const contentPermissions = createdPermissions
            .filter(p =>
                p.module === "blogs" ||
                p.module === "events" ||
                p.module === "sliders"
            )
            .map(p => p._id);

        await Role.create({
            name: "Biên tập nội dung",
            code: "content_editor",
            description: "Quản lý blog, sự kiện và slider",
            permissions: contentPermissions,
            isSystemRole: false,
            isActive: true,
        });

        const marketingPermissions = createdPermissions
            .filter(p =>
                p.module === "promo_codes" ||
                p.module === "loyalty" ||
                p.module === "events" ||
                p.code === "sliders.create" ||
                p.code === "sliders.update" ||
                p.code === "sliders.delete"
            )
            .map(p => p._id);

        await Role.create({
            name: "Quản lý Marketing",
            code: "marketing_manager",
            description: "Quản lý khuyến mãi, tích điểm và sự kiện",
            permissions: marketingPermissions,
            isSystemRole: false,
            isActive: true,
        });

        return { permissionsCount: createdPermissions.length, rolesCount: 6 };
    } catch (error) {
        console.error("✗ Error seeding permissions and roles:", error.message);
        throw error;
    }
};

module.exports = { seedPermissionsAndRoles };
