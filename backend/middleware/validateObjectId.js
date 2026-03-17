const mongoose = require("mongoose");

// Validates that :id params are valid MongoDB ObjectIds
const validateObjectId =
  (paramName = "id") =>
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json({ msg: `Invalid ${paramName} format` });
    }
    next();
  };

module.exports = validateObjectId;
