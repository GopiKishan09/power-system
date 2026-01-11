const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");

// ✅ GET all tasks for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      createdAt: 1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE task
router.post("/", auth, async (req, res) => {
  try {
    const { title, dayOfWeek } = req.body;

    if (!title || !dayOfWeek) {
      return res
        .status(400)
        .json({ message: "title and dayOfWeek are required" });
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      dayOfWeek,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE task title (INLINE EDIT SUPPORT)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const { id } = req.params;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const task = await Task.findOne({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE task
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
