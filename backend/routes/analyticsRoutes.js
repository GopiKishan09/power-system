const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const TaskCompletion = require("../models/TaskCompletion");

// Weekly analytics
router.get("/weekly", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const totalTasks = tasks.length;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const completions = await TaskCompletion.find({
      userId: req.userId,
      createdAt: { $gte: last7Days }
    });

    const completedCount = completions.length;
    const possible = totalTasks * 7;

    const percentage = possible === 0 ? 0 : Math.round((completedCount / possible) * 100);

    res.json({
      totalTasks,
      completedCount,
      percentage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly analytics
router.get("/monthly", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const totalTasks = tasks.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysPassed = now.getDate();

    const completions = await TaskCompletion.find({
      userId: req.userId,
      createdAt: { $gte: startOfMonth }
    });

    const completedCount = completions.length;
    const possible = totalTasks * daysPassed;

    const percentage = possible === 0 ? 0 : Math.round((completedCount / possible) * 100);

    res.json({
      totalTasks,
      completedCount,
      percentage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
