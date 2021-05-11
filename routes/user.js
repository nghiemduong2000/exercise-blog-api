const express = require("express");
const User = require("../models/User");
const Router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { default: fetch } = require("node-fetch");
const authUser = require("../middlewares/authUser");
const client = new OAuth2Client(
  "820242333597-7tbh02vghgiunu7ekdkugpte288cqhjb.apps.googleusercontent.com"
);
const cloudinary = require("../utils/cloudinary");
const authAdmin = require("../middlewares/authAdmin");

// @route GET Users
// @desc Get Filter Users
// @access Private
Router.get("/filter", authAdmin, async (req, res) => {
  try {
    const { q } = req.query;

    const filter = q
      ? [{ $text: { $search: q } }, { score: { $meta: "textScore" } }]
      : [{}];

    const users = await User.find(...filter)
      .select("-userPassword")
      .sort(q ? { score: { $meta: "textScore" } } : "-date");
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});

// @route GET Amount Users
// @desc Get Amount Users
// @access Private
Router.get("/amount", authAdmin, async (req, res) => {
  const amount = await User.countDocuments();
  res.json(amount);
});

// @route GET Auth
// @desc Get User Data
// @access Private
Router.get("/", authUser, async (req, res) => {
  const user = await User.findById(req.userId).select(
    "-userPassword -lastChangePw -isActive"
  );
  res.json(user);
});

// @route POST Auth
// @desc Auth User
// @access Public
Router.post("/auth", async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // Simple validation
    if (!userEmail || !userPassword) {
      return res.status(400).json({ msg: "Vui lòng điền tất cả ô trống" });
    }
    // Check for existing user
    const userExisting = await User.findOne({ userEmail });
    if (!userExisting) {
      return res.status(400).json({ msg: "Người dùng này không tồn tại" });
    }
    if (!userExisting.isActive) {
      return res
        .status(400)
        .json({ msg: "Tài khoản bị khóa liên hệ admin để mở" });
    }
    const comparePassword = await bcrypt.compare(
      userPassword,
      userExisting.userPassword
    );
    if (!comparePassword) {
      return res.status(400).json({ msg: "Mật khẩu không đúng" });
    }
    jwt.sign(
      {
        id: userExisting.id,
        lastChangePw: userExisting.lastChangePw.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600 * 24 },
      (err, token) => {
        if (err) throw err;
        if (!req.signedCookies.tokenUser) {
          res.cookie("tokenUser", token, {
            maxAge: 3600 * 24 * 1000,
            signed: true,
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
        }
        res.json({
          _id: userExisting.id,
          userName: userExisting.userName,
          userEmail: userExisting.userEmail,
          imageUser: userExisting.imageUser,
          history: userExisting.history,
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

// @route POST Auth Google
// @desc Auth User Google
// @access Public
Router.post("/googleLogin", async (req, res) => {
  try {
    const { tokenId } = req.body;

    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience:
        "820242333597-7tbh02vghgiunu7ekdkugpte288cqhjb.apps.googleusercontent.com",
    });
    const { email_verified, name, email, picture } = response.payload;
    if (email_verified) {
      const userExisting = await User.findOne({ userEmail: email });
      if (userExisting) {
        if (!userExisting.isActive) {
          return res
            .status(400)
            .json({ msg: "Tài khoản bị khóa liên hệ admin để mở" });
        }
        jwt.sign(
          {
            id: userExisting.id,
            lastChangePw: userExisting.lastChangePw.toString(),
          },
          process.env.JWT_SECRET,
          { expiresIn: 3600 * 24 },
          (err, token) => {
            if (err) throw err;
            if (!req.signedCookies.tokenUser) {
              res.cookie("tokenUser", token, {
                maxAge: 3600 * 24 * 1000,
                signed: true,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              });
            }
            const { _id, userName, imageUser, userEmail, history } =
              userExisting;
            res.json({
              _id,
              userName,
              imageUser,
              userEmail,
              history,
            });
          }
        );
      } else {
        const newUser = new User({
          userName: name,
          userEmail: email,
          userPassword: "",
          imageUser: picture,
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(email, salt, (err, hash) => {
            newUser.userPassword = hash;
            newUser.save().then((user) => {
              jwt.sign(
                { id: user.id, lastChangePw: user.lastChangePw.toString() },
                process.env.JWT_SECRET,
                {
                  expiresIn: 3600,
                },
                (err, token) => {
                  if (!req.signedCookies.tokenUser) {
                    res.cookie("tokenUser", token, {
                      maxAge: 3600 * 24 * 1000,
                      signed: true,
                      httpOnly: true,
                      sameSite: "none",
                      secure: true,
                    });
                  }
                  res.json({
                    _id: user.id,
                    userName: user.userName,
                    userEmail: user.userEmail,
                    imageUser: user.imageUser,
                    history: user.history,
                  });
                }
              );
            });
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// @route POST Auth Facebook
// @desc Auth User Facebook
// @access Public
Router.post("/facebookLogin", async (req, res) => {
  try {
    const { userID, accessToken } = req.body;
    let urlGraphFacebook = `https://graph.facebook.com/v10.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
    const response1 = await fetch(urlGraphFacebook, {
      method: "GET",
    });
    const response2 = await response1.json();
    const { email, name, picture } = response2;
    const userExisting = await User.findOne({ userEmail: email });
    if (userExisting) {
      if (!userExisting.isActive) {
        return res
          .status(400)
          .json({ msg: "Tài khoản bị khóa liên hệ admin để mở" });
      }
      jwt.sign(
        {
          id: userExisting.id,
          lastChangePw: userExisting.lastChangePw.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: 3600 * 24 },
        (err, token) => {
          if (err) throw err;
          if (!req.signedCookies.tokenUser) {
            res.cookie("tokenUser", token, {
              maxAge: 3600 * 24 * 1000,
              signed: true,
              httpOnly: true,
              sameSite: "none",
              secure: true,
            });
          }
          const { _id, userName, imageUser, userEmail, history } = userExisting;
          res.json({
            _id,
            userName,
            imageUser,
            userEmail,
            history,
          });
        }
      );
    } else {
      const newUser = new User({
        userName: name,
        userEmail: email,
        userPassword: "",
        imageUser: picture.data.url,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(email, salt, (err, hash) => {
          newUser.userPassword = hash;
          newUser.save().then((user) => {
            jwt.sign(
              { id: user.id, lastChangePw: user.lastChangePw.toString() },
              process.env.JWT_SECRET,
              {
                expiresIn: 3600,
              },
              (err, token) => {
                if (!req.signedCookies.tokenUser) {
                  res.cookie("tokenUser", token, {
                    maxAge: 3600 * 24 * 1000,
                    signed: true,
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                  });
                }
                res.json({
                  _id: user.id,
                  userName: user.userName,
                  userEmail: user.userEmail,
                  imageUser: user.imageUser,
                  history: user.history,
                });
              }
            );
          });
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// @route POST Register
// @desc Register No Response
// @access Private
Router.post("/registerNoRes", async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;

    // Simple validation
    if (!userName || !userEmail || !userPassword) {
      return res.status(400).json({ msg: "Vui lòng điền tất cả ô trống" });
    }

    // Check for existing user
    const userExisting = await User.findOne({ userEmail });
    if (userExisting) {
      return res.status(400).json({ msg: "Email này đã tồn tại" });
    }

    const newUser = new User({
      userName,
      userEmail,
      userPassword,
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userPassword, salt, (err, hash) => {
        newUser.userPassword = hash;
        newUser.save();
      });
    });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/register", async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;

    // Simple validation
    if (!userName || !userEmail || !userPassword) {
      return res.status(400).json({ msg: "Vui lòng điền tất cả ô trống" });
    }

    // Check for existing user
    const userExisting = await User.findOne({ userEmail });
    if (userExisting) {
      return res.status(400).json({ msg: "Email này đã tồn tại" });
    }

    const newUser = new User({
      userName,
      userEmail,
      userPassword,
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userPassword, salt, (err, hash) => {
        newUser.userPassword = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id, lastChangePw: user.lastChangePw.toString() },
            process.env.JWT_SECRET,
            {
              expiresIn: 3600,
            },
            (err, token) => {
              if (!req.signedCookies.token) {
                res.cookie("tokenUser", token, {
                  maxAge: 3600 * 24 * 1000,
                  signed: true,
                  httpOnly: true,
                  sameSite: "none",
                  secure: true,
                });
              }
              res.json({
                _id: user.id,
                userName: user.userName,
                userEmail: user.userEmail,
                imageUser: user.imageUser,
                history: user.history,
              });
            }
          );
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
});

// @route PATCH User
// @desc Update User
// @access Private
Router.patch("/:id", async (req, res) => {
  try {
    const { userName, imageUser, history, isActive, isUpload } = req.body;
    if (imageUser) {
      let updateUser;
      if (isUpload) {
        const response = await cloudinary.uploader.upload(imageUser, {
          upload_preset: "review_film_project",
        });

        updateUser = {
          userName,
          imageUser: response.secure_url,
        };
      } else {
        updateUser = {
          userName,
          imageUser,
        };
      }
      for (let prop in updateUser) {
        if (!updateUser[prop]) {
          delete updateUser[prop];
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateUser,
        {
          new: true,
        }
      ).select("-userPassword -lastChangePw -isActive");
      res.json(updatedUser);
    } else {
      const updateUser = {
        userName,
        history,
        isActive,
      };
      for (let prop in updateUser) {
        if (typeof updateUser[prop] === "undefined") {
          delete updateUser[prop];
        }
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateUser,
        { new: true }
      ).select("-userPassword -lastChangePw -isActive");
      res.json(updatedUser);
    }
  } catch (err) {
    console.log(err);
  }
});

// @route PATCH User
// @desc Change Password
// @access Private
Router.patch("/changePw/:id", authUser, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    const comparePassword = await bcrypt.compare(
      oldPassword,
      user.userPassword
    );
    if (!comparePassword) {
      return res.status(400).json({ msg: "Mật khẩu cũ không đúng" });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPassword, salt, async (err, hash) => {
        await User.findByIdAndUpdate(
          req.params.id,
          { userPassword: hash, lastChangePw: Date.now() },
          {
            new: true,
          }
        );
        res.json("Change password success");
      });
    });
  } catch (err) {
    console.log(err);
  }
});

// @route GET Auth
// @desc Logout User
// @access Private
Router.get("/deleteCookie", (req, res) => {
  res
    .status(202)
    .clearCookie("tokenUser", {
      sameSite: "none",
      secure: true,
    })
    .json({
      msg: "Logout success",
    });
});

module.exports = Router;
