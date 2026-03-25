const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const validateObjectId = require("../middleware/validateObjectId");
const QuizResult = require("../models/QuizResult");
const Project = require("../models/Project");
const Feedback = require("../models/Feedback");
const Question = require("../models/Question");
<<<<<<< HEAD
const ModuleSession = require("../models/ModuleSession");
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb

router.use(auth, roleAuth("student"));

// Helper: parse pagination params
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

// --- Quiz Results ---

router.post(
  "/quiz-result",
  [
    body("topic", "Topic is required").notEmpty().trim(),
    body("score", "Score is required").isNumeric(),
    body("totalQuestions", "Total questions is required").isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
<<<<<<< HEAD
      const { topic, score, totalQuestions, answers, tabSwitchCount } = req.body;
=======
      const { topic, score, totalQuestions, answers } = req.body;
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
      const percentage = Math.round((score / totalQuestions) * 100);

      const quizResult = new QuizResult({
        student: req.user.id,
        topic,
        score,
        totalQuestions,
        percentage,
        answers: answers || [],
<<<<<<< HEAD
        tabSwitchCount: tabSwitchCount || 0,
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
      });

      await quizResult.save();
      res.status(201).json(quizResult);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

router.get("/quiz-results", async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const [results, total] = await Promise.all([
      QuizResult.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuizResult.countDocuments({ student: req.user.id }),
    ]);
    res.json({ results, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Projects ---

router.post(
  "/project",
  [body("title", "Title is required").notEmpty().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, topic, components, notes } = req.body;
      const project = new Project({
        student: req.user.id,
        title,
        description: description || "",
        topic: topic || "",
        components: components || [],
        notes: notes || "",
      });

      await project.save();
      res.status(201).json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

router.put("/project/:id", validateObjectId("id"), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      student: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

<<<<<<< HEAD
    const allowedFields = ["title", "description", "topic", "status", "components", "notes", "guide"];
=======
    const allowedFields = ["title", "description", "topic", "status", "components", "notes"];
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    }

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const [projects, total] = await Promise.all([
      Project.find({ student: req.user.id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments({ student: req.user.id }),
    ]);
    res.json({ projects, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/projects/:id/feedback", validateObjectId("id"), async (req, res) => {
  try {
    const projectExists = await Project.exists({
      _id: req.params.id,
      student: req.user.id,
    });
    if (!projectExists) {
      return res.status(404).json({ msg: "Project not found" });
    }

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

// --- Questions ---

router.post(
  "/question",
  [
    body("topic", "Topic is required").notEmpty().trim(),
    body("questionText", "Question text is required").notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { topic, questionText } = req.body;
      const question = new Question({
        student: req.user.id,
        topic,
        questionText,
      });

      await question.save();
      res.status(201).json(question);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

router.get("/questions", async (req, res) => {
  try {
    const { limit, skip, page } = paginate(req.query);
    const filter = { student: req.user.id };
    if (req.query.status && ["pending", "answered"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate("teacher", "username")
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

<<<<<<< HEAD
// ── Module Sessions ────────────────────────────────────────

router.post("/module-session/start", [
  body("module", "module name is required").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await ModuleSession.create({
      student: req.user.id,
      module: req.body.module,
      topic: req.body.topic || "",
    });
    res.status(201).json({ sessionId: session._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/module-session/end", [
  body("sessionId", "sessionId is required").notEmpty(),
], async (req, res) => {
  try {
    const session = await ModuleSession.findOne({
      _id: req.body.sessionId,
      student: req.user.id,
    });
    if (!session) return res.status(404).json({ msg: "Session not found" });
    if (session.endedAt) return res.json(session); // already closed
    session.endedAt = new Date();
    session.durationSeconds = Math.round((session.endedAt - session.startedAt) / 1000);
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/module-sessions", async (req, res) => {
  try {
    const sessions = await ModuleSession.find({ student: req.user.id })
      .sort({ startedAt: -1 }).limit(100).lean();
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
module.exports = router;
