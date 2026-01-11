const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");
const TaskCompletion = require("../models/TaskCompletion");

// Helpers
const formatDate = (d) => d.toISOString().split("T")[0];

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getWeekDatesMonToSat = (startDateStr) => {
  // startDateStr = YYYY-MM-DD for MONDAY
  const start = new Date(startDateStr);
  const dates = [];
  for (let i = 0; i < 6; i++) {
    dates.push(formatDate(addDays(start, i)));
  }
  return dates; // Monday..Saturday date strings
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * GET /api/planner/week?start=YYYY-MM-DD
 * start = Monday date
 *
 * Returns:
 * {
 *   week: { start, end, dates: [...] },
 *   tasksByDay: { Monday: [...], Tuesday: [...], ... }
 * }
 */
router.get("/week", auth, async (req, res) => {
  try {
    const { start } = req.query;

    if (!start) {
      return res.status(400).json({ message: "start (YYYY-MM-DD) is required" });
    }

    const weekDates = getWeekDatesMonToSat(start);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[5];

    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: 1 });

    // get completions for week date range
    const completions = await TaskCompletion.find({
      userId: req.userId,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    // build quick lookup: completed[date][taskId]=true
    const completed = {};
    for (const c of completions) {
      if (!completed[c.date]) completed[c.date] = {};
      completed[c.date][String(c.taskId)] = true;
    }

    // group tasks by dayOfWeek and attach completion for that day's date
    const tasksByDay = {};
    for (let i = 0; i < days.length; i++) {
      tasksByDay[days[i]] = [];
    }

    const dayToDate = {};
    for (let i = 0; i < days.length; i++) {
      dayToDate[days[i]] = weekDates[i]; // Monday->start, Tuesday->+1, ...
    }

    for (const t of tasks) {
      const day = t.dayOfWeek;
      if (!tasksByDay[day]) continue;

      const date = dayToDate[day];
      const isCompleted = !!(completed[date] && completed[date][String(t._id)]);

      tasksByDay[day].push({
        _id: t._id,
        title: t.title,
        dayOfWeek: t.dayOfWeek,
        isCompleted,
        date,
      });
    }

    res.json({
      week: {
        start: weekStart,
        end: weekEnd,
        dates: weekDates,
      },
      tasksByDay,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/planner/complete
 * body: { taskId, date }
 *
 * Mark complete for that date.
 */
router.post("/complete", auth, async (req, res) => {
  try {
    const { taskId, date } = req.body;

    if (!taskId || !date) {
      return res.status(400).json({ message: "taskId and date are required" });
    }

    const alreadyDone = await TaskCompletion.findOne({
      userId: req.userId,
      taskId,
      date,
    });

    if (alreadyDone) {
      return res.status(200).json({ message: "Already completed" });
    }

    const completion = await TaskCompletion.create({
      userId: req.userId,
      taskId,
      date,
    });

    res.status(201).json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/planner/complete?taskId=...&date=...
 * Un-complete (checkbox untick)
 */
router.delete("/complete", auth, async (req, res) => {
  try {
    const { taskId, date } = req.query;

    if (!taskId || !date) {
      return res.status(400).json({ message: "taskId and date are required" });
    }

    await TaskCompletion.deleteOne({
      userId: req.userId,
      taskId,
      date,
    });

    res.json({ message: "Uncompleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
