const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const TaskCompletion = require("../models/TaskCompletion");

// helper: YYYY-MM-DD
const formatDate = (date) => date.toISOString().split("T")[0];

router.get("/", auth, async (req, res) => {
  try {
    const completions = await TaskCompletion.find({
      userId: req.userId
    }).sort({ date: -1 });

    let streak = 0;

    // start from today
    let expectedDate = formatDate(new Date());

    for (let record of completions) {
      if (record.date === expectedDate) {
        streak++;
        // move expected date to yesterday
        const d = new Date(expectedDate);
        d.setDate(d.getDate() - 1);
        expectedDate = formatDate(d);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
