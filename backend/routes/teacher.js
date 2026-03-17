const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const validateObjectId = require("../middleware/validateObjectId");
const User = require("../models/User");
const QuizResult = require("../models/QuizResult");
const Project = require("../models/Project");
const Feedback = require("../models/Feedback");
const Question = require("../models/Question");

router.use(auth, roleAuth("teacher"));

// Helper: parse pagination params
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

// --- Student Overview ---

router.get("/students", async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const [students, total] = await Promise.all([
      User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: "student" }),
    ]);
    res.json({ students, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/students/:id/progress", validateObjectId("id"), async (req, res) => {
  try {
    const studentId = req.params.id;
    const [student, quizResults, projects] = await Promise.all([
      User.findById(studentId).select("-password").lean(),
      QuizResult.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
      Project.find({ student: studentId }).sort({ updatedAt: -1 }).lean(),
    ]);

    if (!student || student.role !== "student") {
      return res.status(404).json({ msg: "Student not found" });
    }

    const totalQuizzes = quizResults.length;
    const averageScore =
      totalQuizzes > 0
        ? Math.round(quizResults.reduce((sum, q) => sum + q.percentage, 0) / totalQuizzes)
        : 0;

    const topicScores = {};
    for (const q of quizResults) {
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { total: 0, count: 0 };
      }
      topicScores[q.topic].total += q.percentage;
      topicScores[q.topic].count += 1;
    }

    const topicAverages = {};
    for (const topic in topicScores) {
      topicAverages[topic] = Math.round(topicScores[topic].total / topicScores[topic].count);
    }

    res.json({
      student: { id: student._id, username: student.username, email: student.email },
      quizSummary: { totalQuizzes, averageScore, topicAverages },
      recentQuizzes: quizResults.slice(0, 10),
      projects,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/students/:id/projects", validateObjectId("id"), async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const filter = { student: req.params.id };
    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments(filter),
    ]);
    res.json({ projects, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/students/:id/quiz-results", validateObjectId("id"), async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const filter = { student: req.params.id };
    const [results, total] = await Promise.all([
      QuizResult.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      QuizResult.countDocuments(filter),
    ]);
    res.json({ results, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Project Feedback ---

router.post(
  "/projects/:id/feedback",
  validateObjectId("id"),
  [
    body("comment", "Comment is required").notEmpty().trim(),
    body("rating").optional().isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findById(req.params.id).select("_id student").lean();
      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      const feedback = new Feedback({
        project: project._id,
        teacher: req.user.id,
        student: project.student,
        comment: req.body.comment,
        rating: req.body.rating || undefined,
      });

      await feedback.save();
      const populated = await feedback.populate("teacher", "username");
      res.status(201).json(populated);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

router.get("/projects/:id/feedback", validateObjectId("id"), async (req, res) => {
  try {
    const feedback = await Feedback.find({ project: req.params.id })
      .populate("teacher", "username")
      .sort({ createdAt: -1 })
      .lean();
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Student Questions ---

router.get("/questions", async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const statusFilter = req.query.status || "pending";
    const filter = statusFilter === "all" ? {} : { status: statusFilter };

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate("student", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ]);
    res.json({ questions, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post(
  "/questions/:id/answer",
  validateObjectId("id"),
  [body("answerText", "Answer text is required").notEmpty().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ msg: "Question not found" });
      }

      question.answerText = req.body.answerText;
      question.teacher = req.user.id;
      question.status = "answered";
      question.answeredAt = new Date();

      await question.save();
      const populated = await question.populate([
        { path: "student", select: "username" },
        { path: "teacher", select: "username" },
      ]);
      res.json(populated);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

// --- Dashboard (all queries in parallel) ---

router.get("/dashboard", async (req, res) => {
  try {
    const [studentCount, projectCount, pendingQuestions, recentQuizzes, projectsByStatus] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Project.countDocuments(),
        Question.countDocuments({ status: "pending" }),
        QuizResult.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("student", "username")
          .lean(),
        Project.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      studentCount,
      projectCount,
      pendingQuestions,
      projectsByStatus,
      recentQuizzes,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
