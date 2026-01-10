const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);


const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);


const taskCompletionRoutes = require("./routes/taskCompletionRoutes");
app.use("/api/task-completions", taskCompletionRoutes);


const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);


const streakRoutes = require("./routes/streakRoutes");
app.use("/api/streak", streakRoutes);
