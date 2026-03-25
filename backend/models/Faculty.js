const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: "" },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  email: { type: String, default: "" },
});

module.exports = mongoose.model("Faculty", FacultySchema);
