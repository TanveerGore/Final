const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  answers: [
    {
      question: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
    },
  ],
<<<<<<< HEAD
  tabSwitchCount: {
    type: Number,
    default: 0,
    min: 0,
  },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
  createdAt: {
    type: Date,
    default: Date.now,
  },
<<<<<<< HEAD
  isMock: {
    type: Boolean,
    default: false,
  },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
});

QuizResultSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("QuizResult", QuizResultSchema);
