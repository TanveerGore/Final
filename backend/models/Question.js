const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  answerText: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "answered"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: {
    type: Date,
    default: null,
  },
});

QuestionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Question", QuestionSchema);
