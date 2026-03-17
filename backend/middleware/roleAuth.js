// Role-based authorization middleware
// Usage: roleAuth('teacher') or roleAuth('student', 'teacher')
const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Authorization required" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = roleAuth;
