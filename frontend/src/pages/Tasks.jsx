import { useEffect, useState } from "react";
import api from "../services/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("Monday");

  const [completedIds, setCompletedIds] = useState([]);

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  const fetchTodayCompletions = async () => {
    try {
      const res = await api.get("/task-completions/today");
      const list = Array.isArray(res.data) ? res.data : [];
      setCompletedIds(list.map((c) => c.taskId));
    } catch (err) {
      console.log("today completions error:", err);
      setCompletedIds([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTodayCompletions();
  }, []);

  const addTask = async () => {
    if (!title) return;

    await api.post("/tasks", { title, dayOfWeek: day });

    setTitle("");
    fetchTasks();
  };

  const markComplete = async (taskId) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      await api.post("/task-completions", {
        taskId,
        date: today,
      });

      fetchTodayCompletions();
    } catch (err) {
      console.log("complete error:", err?.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      {/* Add task */}
      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="p-2 bg-gray-700 rounded"
        />

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="p-2 bg-gray-700 rounded"
        >
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <button onClick={addTask} className="bg-blue-600 px-4 rounded">
          Add
        </button>
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-gray-800 p-3 rounded flex items-center gap-3"
          >
            <input
              type="checkbox"
              checked={completedIds.includes(task._id)}
              onChange={() => markComplete(task._id)}
              className="w-5 h-5"
            />

            <div>
              <div
                className={
                  completedIds.includes(task._id)
                    ? "line-through text-gray-400"
                    : ""
                }
              >
                {task.title}
              </div>
              <div className="text-sm text-gray-400">{task.dayOfWeek}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
