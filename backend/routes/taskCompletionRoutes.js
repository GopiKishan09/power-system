const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const TaskCompletion = require("../models/TaskCompletion");

router.post("/", auth, async (req, res) => {
  try {
    const { taskId, date } = req.body;

    const alreadyDone = await TaskCompletion.findOne({
      userId: req.userId,
      taskId,
      date
    });

    if (alreadyDone) {
      return res.status(400).json({ message: "Task already completed today" });
    }

    const completion = await TaskCompletion.create({
      userId: req.userId,
      taskId,
      date
    });

    res.status(201).json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
