const User = require("../models/user");
const Role = require("../models/Role");
const UserSerevice = require("../service/user");
const jwt = require("jsonwebtoken")

const rerister = async (req, res) => {
  try {
    const { email } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const check = reg.test(email);
    if (!check)
      return res.status(403).json({
        success: false,
        mes: "Định dạng email không hợp lệ",
      });
    const response = await UserSerevice.register(req.body);
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {

    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const login = async (req, res) => {
  try {
    const { email } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const check = reg.test(email);
    if (!check)
      return res.status(403).json({
        success: false,
        mes: "Định dạng email không hợp lệ",
      });
    const response = await UserSerevice.login(req.body);
    if (response) {
      res.cookie("refesToken", response.refesToken);
      return res.status(200).json({
        success: true,
        token: response.token,
        user: response.user,
      });
    }
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    let existingUser = await User.findOne({ email: email }).populate("role").lean();
    if (!existingUser) {
      const defaultRole = await Role.findOne({ code: "user" });
      const user = await User.create({ email: email, name: name, role: defaultRole ? defaultRole._id : null });
      const populatedUser = await User.findById(user._id).populate("role").lean();
      if (populatedUser) {
        const userRole = populatedUser.role && populatedUser.role._id ? populatedUser.role : { _id: populatedUser.role };
        const token = jwt.sign(
          { id: populatedUser._id.toString(), role: userRole._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "10d",
          }
        );
        const refesToken = jwt.sign(
          { id: populatedUser._id.toString(), role: userRole._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "15d",
          }
        );
        return res.status(200).json({
          success: true,
          token,
          refesToken,
          user: {
            id: populatedUser._id.toString(),
            email: populatedUser.email,
            name: populatedUser.name,
            role: populatedUser.role,
          },
        });
      }
    } else {
      const userRole = existingUser.role && existingUser.role._id ? existingUser.role : { _id: existingUser.role };
      const token = jwt.sign(
        { id: existingUser._id.toString(), role: userRole._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "10d",
        }
      );
      const refesToken = jwt.sign(
        { id: existingUser._id.toString(), role: userRole._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "15d",
        }
      );
      return res.status(200).json({
        success: true,
        token,
        refesToken,
        user: {
          id: existingUser._id.toString(),
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      });
    }
  } catch (e) {

    return res.status(500).json({
      mes: e.message,
    });
  }
};


const getUserToken = async (req, res) => {
  try {
    const response = await UserSerevice.getUserToken(req.user.id);
    if (response)
      return res.status(200).json({
        success: true,
        user: response.res,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const getUsers = async (req, res) => {
  try {
    const { name, page } = req.query;
    const limit = parseInt(req.query.limit) || parseInt(process.env.LIMIT) || 10;
    const options = {
      page,
      limit,
    };
    if (name) {
      options.name = name;
    }
    const response = await UserSerevice.getUsers({ ...options });
    if (response)
      return res.status(200).json({
        success: true,
        users: response.user,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const refesToken = async (req, res) => {
  try {
    const { id, role } = req.user;
    const response = await UserSerevice.refesToken(id, role);
    if (response)
      return res.status(200).json({
        success: true,
        response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const deleteleteUser = async (req, res) => {
  try {
    const response = await UserSerevice.deleteUser(req.params.id);
    if (response)
      return res.status(200).json({
        success: true,
        user: response.res,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const response = await UserSerevice.updateUser(req.params.id, req.body);
    if (response)
      return res.status(200).json({
        success: true,
        user: response.user,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const addProductCart = async (req, res) => {
  try {
    const response = await UserSerevice.addProductCart(req.params.id, req.body);
    if (response)
      return res.status(200).json({
        success: true,
        user: response.response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};
const removeProductCart = async (req, res) => {
  try {
    const response = await UserSerevice.removeProductCart(
      req.params.id,
      req.body
    );
    if (response)
      return res.status(200).json({
        success: true,
        user: response.response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const addProductWishlist = async (req, res) => {
  try {
    const response = await UserSerevice.addProductWishlist(
      req.params.id,
      req.body
    );
    if (response)
      return res.status(200).json({
        success: true,
        user: response.response,
      });
  } catch (e) {
    console.log("Error in addProductWishlist:", e);
    return res.status(500).json({
      mes: e?.mes || e?.message || "Server error",
      error: String(e),
    });
  }
};

const removeProductWishlist = async (req, res) => {
  try {
    const response = await UserSerevice.removeProductWishlist(
      req.params.id,
      req.body
    );
    if (response)
      return res.status(200).json({
        success: true,
        user: response.response,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const response = await UserSerevice.getWishlist(req.params.id);
    if (response)
      return res.status(200).json({
        success: true,
        wishlist: response.wishlist,
      });
  } catch (e) {
    return res.status(500).json({
      mes: e.mes,
    });
  }
};

module.exports = {
  rerister,
  login,
  getUsers,
  getUserToken,
  refesToken,
  addProductCart,
  deleteleteUser,
  updateUser,
  removeProductCart,
  googleLogin,
  addProductWishlist,
  removeProductWishlist,
  getWishlist,
};
