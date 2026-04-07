const User = require("../models/user");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const register = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, password, role, name } = data;
      const check = await User.findOne({ email: email });
      if (check) {
        reject({
          success: false,
          mes: "Email đã tồn tại",
        });
        return;
      }
      
      let userRole = role;
      if (!userRole) {
        const defaultRole = await Role.findOne({ code: "user" });
        userRole = defaultRole ? defaultRole._id : null;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: userRole,
      });

      resolve({
        success: true,
        res: newUser,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const login = (data) => {
  return new Promise(async (rosolve, reject) => {
    try {
      const { email, password } = data;
      const check = await User.findOne({ email: email }).populate("role").lean();
      if (!check) {
        reject({
          success: false,
          mes: "email không chính xác",
        });
        return;
      }
      const checkPassword = bcrypt.compareSync(password, check.password);
      if (!checkPassword) {
        reject({
          success: false,
          mes: "Mật khẩu không chính xác không chính xác",
        });
        return;
      }

      const userRole = check.role && check.role._id ? check.role : { _id: check.role };
      
      const token = jwt.sign(
        { id: check._id.toString(), role: userRole._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "10d",
        }
      );
      const refesToken = jwt.sign(
        { id: check._id.toString(), role: userRole._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "15d",
        }
      );
      if (token) {
        rosolve({
          success: true,
          token,
          refesToken,
          user: {
            id: check._id.toString(),
            email: check.email,
            name: check.name,
            role: check.role,
          },
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
const getUserToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await User.findById(id)
        .select("-password")
        .populate("cart.product")
        .populate("role")
        .lean();
      resolve({
        res,
      });
    } catch (err) {
      reject(err);
    }
  });
};
const getUsers = (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, limit, page } = options;
      const skip = (page - 1) * limit;
      if (name) {
        const regex = new RegExp(name, "i");
        const user = await User.find({ name: regex }).select("-password");
        // .skip(skip)
        // .limit(limit)
        if (user) {
          resolve({
            success: true,
            user,
          });
        } else {
          resolve({
            success: false,
            message: "Không tìm thấy người dùng",
          });
        }
      } else {
        const user = await User.find().select("-password");
        // .skip(skip)
        // .limit(limit)
        if (user) {
          resolve({
            success: true,
            user,
          });
        } else {
          resolve({
            success: false,
            message: "Không tìm thấy người dùng",
          });
        }
      }
    } catch (err) {
      reject(err);
    }
  });
};

const refesToken = (id, role) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = jwt.sign({ id: id, role: role }, process.env.JWT_SECRET_KEY, {
        expiresIn: "10d",
      });
      if (token) {
        resolve({
          success: true,
          token,
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findByIdAndDelete(id);
      if (user) {
        resolve({
          success: true,
          mes: "Xóa người dùng thành công",
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }
      user.name = data.name;
      user.phone = data.phone;
      user.address = data.address;
      await user.save();
      resolve({
        success: true,
        user,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const addProductCart = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { idProduct, color } = data;
      const user = await User.findById(id);
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }
      const isProductInCart = user.cart.some(
        (item) => item.product.toString() === idProduct
      );

      if (!isProductInCart) {
        user.cart.push({
          product: idProduct,
          quantity: data.quantity || 1,
          color: color,
        });
      } else {
        reject({
          mes: "Sản phẩm đã có trong giỏ hàng",
        });
        return;
      }
      await user.save();
      const response = await User.findById(id).populate("cart.product");
      resolve({
        success: true,
        response,
      });
    } catch (err) {
      reject(err);
    }
  });
};
const removeProductCart = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { _id } = data;
      const user = await User.findById(id);
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }
      const filter = user.cart.filter((item) => item._id.toString() !== _id);

      if (filter) {
        user.cart = filter;
      } else {
        reject({
          mes: "Sản phẩm đã có trong giỏ hàng",
        });
        return;
      }
      await user.save();
      const response = await User.findById(id).populate("cart.product");
      resolve({
        success: true,
        response,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const addProductWishlist = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { productId } = data;
      const user = await User.findById(id);
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
        return;
      }
      if (!user.wishlist) {
        user.wishlist = [];
      }
      const isProductInWishlist = user.wishlist.some(
        (item) => item && item.toString() === productId
      );

      if (isProductInWishlist) {
        reject({
          mes: "Sản phẩm đã có trong wishlist",
        });
        return;
      }
      user.wishlist.push(productId);
      await user.save();
      const response = await User.findById(id).populate("wishlist");
      resolve({
        success: true,
        response,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const removeProductWishlist = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { productId } = data;
      const user = await User.findById(id);
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
        return;
      }
      if (!user.wishlist) {
        user.wishlist = [];
      }
      const filter = user.wishlist.filter(
        (item) => item && item.toString() !== productId
      );

      user.wishlist = filter;
      await user.save();
      const response = await User.findById(id).populate("wishlist");
      resolve({
        success: true,
        response,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getWishlist = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id).populate("wishlist");
      if (!user) {
        resolve({
          success: false,
          message: "Không tìm thấy người dùng",
        });
        return;
      }
      resolve({
        success: true,
        wishlist: user.wishlist,
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  register,
  login,
  getUsers,
  getUserToken,
  refesToken,
  deleteUser,
  updateUser,
  addProductCart,
  removeProductCart,
  addProductWishlist,
  removeProductWishlist,
  getWishlist,
};
