const mongoose = require("mongoose");

const ModuleSessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  module: { type: String, required: true },   // e.g. "basics" | "adaptive"
  topic: { type: String, default: "" },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  durationSeconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isMock: { type: Boolean, default: false },
});

ModuleSessionSchema.index({ student: 1, startedAt: -1 });

module.exports = mongoose.model("ModuleSession", ModuleSessionSchema);
