const express = require("express");
const Admin = require("../models/Admin");
const Router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../middlewares/authAdmin");

// @route GET Auth
// @desc Get Admin Data
// @access Private
Router.get("/", authAdmin, (req, res) => {
  Admin.findById(req.admin.id)
    .select("-password")
    .then((admin) => res.json(admin));
});

// @route POST Auth
// @desc Auth Admin
// @access Public
Router.post("/auth", async (req, res) => {
  try {
    const { loginID, password } = req.body;

    // Simple validation
    if (!loginID || !password) {
      return res.status(400).json({ msg: "Vui lòng điền tất cả ô trống" });
    }
    // Check for existing admin
    const adminExisting = await Admin.findOne({ loginID });
    if (!adminExisting) {
      return res.status(400).json({ msg: "Admin này không tồn tại" });
    }
    const comparePassword = await bcrypt.compare(
      password,
      adminExisting.password
    );
    if (!comparePassword) {
      return res.status(400).json({ msg: "Mật khẩu không đúng" });
    }
    jwt.sign(
      { id: adminExisting.id },
      process.env.JWT_SECRET,
      { expiresIn: 3600 * 24 },
      (err, token) => {
        if (err) throw err;
        if (!req.signedCookies.token) {
          res.cookie("tokenAdmin", token, {
            maxAge: 3600 * 24 * 1000,
            signed: true,
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
        }
        res.json({
          _id: adminExisting.id,
          loginID: adminExisting.loginID,
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

// @route GET Auth
// @desc Logout admin
// @access Private
Router.get("/deleteCookie", (req, res) => {
  res
    .status(202)
    .clearCookie("tokenAdmin", {
      sameSite: "none",
      secure: true,
    })
    .json({
      msg: "Logout success",
    });
});

module.exports = Router;
