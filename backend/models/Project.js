const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  topic: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["planning", "in-progress", "review", "completed"],
    default: "planning",
  },
  components: [
    {
      name: String,
      quantity: Number,
    },
  ],
  notes: {
    type: String,
    default: "",
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isMock: {
    type: Boolean,
    default: false,
  },
});

ProjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

ProjectSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
