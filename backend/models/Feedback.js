const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FeedbackSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);
