const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const TaskCompletion = require("../models/TaskCompletion");

// helper: date -> YYYY-MM-DD
const formatDate = (d) => d.toISOString().split("T")[0];

router.get("/", auth, async (req, res) => {
  try {
    // all completions (sorted latest first)
    const completions = await TaskCompletion.find({
      userId: req.userId,
    }).sort({ date: -1 });

    // ✅ unique completion dates set
    const completionDatesSet = new Set(completions.map((c) => c.date));

    let streak = 0;
    let expectedDate = formatDate(new Date()); // today

    // streak = how many continuous days user has ANY completion
    // (at least 1 task completed on that day)
    while (completionDatesSet.has(expectedDate)) {
      streak++;

      const d = new Date(expectedDate);
      d.setDate(d.getDate() - 1);
      expectedDate = formatDate(d);
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
