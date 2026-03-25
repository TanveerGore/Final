const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");

// GET /api/faculty — public, returns all faculty
router.get("/", async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ name: 1 }).lean();
    res.json(faculty);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
