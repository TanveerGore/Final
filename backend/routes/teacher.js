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
<<<<<<< HEAD
const ModuleSession = require("../models/ModuleSession");
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
    
    // Safety: if faculty not in token, fetch it
    if (!req.user.faculty) {
      const user = await User.findById(req.user.id).select("faculty");
      if (user) req.user.faculty = user.faculty;
    }

    const guideFilter = req.user.faculty ? { guide: req.user.faculty } : {};
    
    // To get students belonging to a guide, we first find projects with that guide
    const guideProjects = await Project.find(guideFilter).distinct("student");
    const studentFilter = { role: "student", _id: { $in: guideProjects } };

    const [students, total] = await Promise.all([
      User.find(studentFilter)
=======
    const [students, total] = await Promise.all([
      User.find({ role: "student" })
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
<<<<<<< HEAD
      User.countDocuments(studentFilter),
=======
      User.countDocuments({ role: "student" }),
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
    const student = await User.findById(studentId).select("-password").lean();
    if (!student || student.role !== "student") {
      return res.status(404).json({ msg: "Student not found in our system" });
    }

    const guideFilter = req.user.faculty ? { guide: req.user.faculty } : {};
    console.log(`[DEBUG] Faculty ${req.user.faculty} checking student ${studentId}`);
    
    // Check if any project for this student is assigned to this faculty guide
    const isAssigned = await Project.exists({ student: studentId, ...guideFilter });
    console.log(`[DEBUG] Assignment exists: ${!!isAssigned}`);
    
    if (req.user.faculty && !isAssigned) {
      return res.status(403).json({ msg: "This student is not assigned to your guidance" });
    }

    const [quizResults, projects, moduleSessions] = await Promise.all([
      QuizResult.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
      Project.find({ student: studentId }).sort({ updatedAt: -1 }).lean(),
      ModuleSession.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
    ]);

=======
    const [student, quizResults, projects] = await Promise.all([
      User.findById(studentId).select("-password").lean(),
      QuizResult.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
      Project.find({ student: studentId }).sort({ updatedAt: -1 }).lean(),
    ]);

    if (!student || student.role !== "student") {
      return res.status(404).json({ msg: "Student not found" });
    }

>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
      moduleSessions,
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
      const guideFilter = req.user.faculty ? { guide: req.user.faculty } : {};
      const project = await Project.findOne({ _id: req.params.id, ...guideFilter }).select("_id student").lean();
      if (!project) {
        return res.status(404).json({ msg: "Project not found or not assigned to you" });
=======
      const project = await Project.findById(req.params.id).select("_id student").lean();
      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
      const guideFilter = req.user.faculty ? { guide: req.user.faculty } : {};
      const guideProjects = await Project.find(guideFilter).distinct("student");
      
      const question = await Question.findOne({ _id: req.params.id, student: { $in: guideProjects } });
      if (!question) {
        return res.status(404).json({ msg: "Question not found or from a student not assigned to you" });
=======
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ msg: "Question not found" });
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
<<<<<<< HEAD
    const user = await User.findById(req.user.id).select("faculty role username");
    if (!user) {
      console.log(`[AUTH ERROR] Teacher dashboard accessed with invalid User ID: ${req.user.id}`);
      return res.status(401).json({ msg: "Your session is invalid. Please log out and back in." });
    }
    
    // Ensure faculty is set
    req.user.faculty = user.faculty;
    const guideFilter = user.faculty ? { guide: user.faculty } : {};
    
    console.log(`[DEBUG] fetching dashboard for ${user.username} (Faculty: ${user.faculty})`);
    
    const guideProjects = await Project.find(guideFilter).distinct("student");
    const studentFilter = { role: "student", _id: { $in: guideProjects } };

    const [studentCount, projectCount, pendingQuestions, recentQuizzes, projectsByStatus] =
      await Promise.all([
        User.countDocuments(studentFilter),
        Project.countDocuments(guideFilter),
        Question.countDocuments({ status: "pending", student: { $in: guideProjects } }),
        QuizResult.find({ student: { $in: guideProjects } })
=======
    const [studentCount, projectCount, pendingQuestions, recentQuizzes, projectsByStatus] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Project.countDocuments(),
        Question.countDocuments({ status: "pending" }),
        QuizResult.find()
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("student", "username")
          .lean(),
        Project.aggregate([
<<<<<<< HEAD
          { $match: guideFilter },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

<<<<<<< HEAD
    console.log(`[DEBUG] Results: students=${studentCount}, projects=${projectCount}`);

=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
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
