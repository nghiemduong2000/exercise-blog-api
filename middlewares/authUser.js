const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  const token = req.signedCookies.tokenUser;

  if (!token) {
    return res.status(401).json({ msg: "Không có token nào được định nghĩa" });
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add admin from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token không đúng" });
  }
};

module.exports = authUser;
