const jwt = require("jsonwebtoken");
const tokenBlacklist = require("./tokenBlacklist");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ msg: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;
