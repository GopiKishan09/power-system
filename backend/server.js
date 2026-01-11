const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const taskCompletionRoutes = require("./routes/taskCompletionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const streakRoutes = require("./routes/streakRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/task-completions", taskCompletionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/streak", streakRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Power System Backend Running ✅");
});

// DB + Server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });
