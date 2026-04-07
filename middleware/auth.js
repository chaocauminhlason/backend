const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/Role");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token)
    return res.status(401).json({
      mes: "Token không tìm thấy",
    });
  const rawToken = token.split(" ")[1];
  jwt.verify(rawToken, process.env.JWT_SECRET_KEY, (err, decode) => {
    if (err) {
      return res.status(401).json({
        mes: "Token đã hết hạn",
      });
    }
    req.user = decode;
    next();
  });
};

// Legacy isAdmin - Updated to work with both old and new role system
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("role");

    if (!user) {
      return res.status(404).json({ mes: "Người dùng không tồn tại" });
    }

    // Check if role is string (legacy) or ObjectId (new)
    if (typeof user.role === "string") {
      // Old system: direct string comparison
      if (user.role !== "admin") {
        return res.status(403).json({ mes: "Bạn không phải admin" });
      }
    } else {
      // New system: check role code
      if (!user.role || user.role.code !== "admin") {
        return res.status(403).json({ mes: "Bạn không phải admin" });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ mes: "Lỗi kiểm tra quyền: " + error.message });
  }
};

// New granular permission middleware
const hasPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate({
        path: "role",
        populate: { path: "permissions" },
      });

      if (!user) {
        return res.status(404).json({ mes: "Người dùng không tồn tại" });
      }

      // Handle legacy string roles
      if (typeof user.role === "string") {
        // For legacy admin users, grant all permissions
        if (user.role === "admin") {
          return next();
        }
        // Legacy non-admin users have no special permissions
        return res.status(403).json({
          mes: "Bạn không có quyền thực hiện hành động này",
        });
      }

      // New role system: check permissions
      if (!user.role || !user.role.permissions) {
        return res.status(403).json({
          mes: "Vai trò của bạn chưa được cấu hình quyền",
        });
      }

      // Check if user has the required permission
      const hasAccess = user.role.permissions.some(
        (p) => p.code === permissionCode && p.isActive
      );

      if (!hasAccess) {
        return res.status(403).json({
          mes: `Bạn không có quyền: ${permissionCode}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        mes: "Lỗi kiểm tra quyền: " + error.message,
      });
    }
  };
};

const checkToken = (req, res, next) => {
  const { refesToken } = req.cookies;
  jwt.verify(refesToken, process.env.JWT_SECRET_KEY, (err, decode) => {
    if (err) {
      res.clearCookie("refesToken");
      return res.status(401).json({
        mes: "Token đã hết hạn",
      });
    }
    req.user = decode;
    next();
  });
};

module.exports = { verifyToken, isAdmin, hasPermission, checkToken };
