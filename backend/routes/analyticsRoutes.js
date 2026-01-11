const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");
const TaskCompletion = require("../models/TaskCompletion");

const formatDate = (d) => d.toISOString().split("T")[0];

const getMonthRange = (yyyyMm) => {
  const [y, m] = yyyyMm.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0)); // last day
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

// Only Mon–Sat tasks count
const dayNameFromDate = (yyyyMMdd) => {
  const d = new Date(yyyyMMdd);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const map = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  return map[day] || null;
};

const calcPercentageForRange = async ({ userId, start, end }) => {
  const tasks = await Task.find({ userId });

  const startDate = new Date(start);
  const endDate = new Date(end);

  let totalPossible = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const yyyyMMdd = formatDate(d);
    const dayName = dayNameFromDate(yyyyMMdd);
    if (!dayName) continue; // ignore Sunday

    const dayTasks = tasks.filter((t) => t.dayOfWeek === dayName);
    totalPossible += dayTasks.length;
  }

  const completions = await TaskCompletion.countDocuments({
    userId,
    date: { $gte: start, $lte: end },
  });

  const percentage =
    totalPossible === 0 ? 0 : Math.round((completions / totalPossible) * 100);

  return { totalPossible, completions, percentage };
};

// ✅ Weekly analytics (Selected week)
router.get("/weekly", auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message:
          "Please provide start and end (YYYY-MM-DD) for weekly analytics",
      });
    }

    const result = await calcPercentageForRange({
      userId: req.userId,
      start,
      end,
    });

    res.json({
      start,
      end,
      totalPossible: result.totalPossible,
      completedCount: result.completions,
      percentage: result.percentage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Monthly analytics (Selected month)
router.get("/monthly", auth, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "Please provide month in YYYY-MM format, e.g. 2025-12",
      });
    }

    const { start, end } = getMonthRange(month);

    const result = await calcPercentageForRange({
      userId: req.userId,
      start,
      end,
    });

    res.json({
      month,
      start,
      end,
      totalPossible: result.totalPossible,
      completedCount: result.completions,
      percentage: result.percentage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Yearly 12-month analytics
router.get("/yearly", auth, async (req, res) => {
  try {
    const { year } = req.query;

    const y = Number(year);
    if (!y || y < 2000 || y > 3000) {
      return res.status(400).json({ message: "year is required (e.g. 2026)" });
    }

    const months = [];

    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, "0");
      const monthKey = `${y}-${mm}`;

      const { start, end } = getMonthRange(monthKey);

      const result = await calcPercentageForRange({
        userId: req.userId,
        start,
        end,
      });

      months.push({
        month: monthKey,
        percentage: result.percentage,
        completedCount: result.completions,
        totalPossible: result.totalPossible,
      });
    }

    res.json({ year: y, months });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
