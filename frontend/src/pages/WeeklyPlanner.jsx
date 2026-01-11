import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import BootLayout from "../components/BootLayout";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SECTIONS = [
  { key: "RICH", label: "BECOME INCREDIBLY RICH", chip: "text-warning" },
  { key: "MUSCULAR", label: "BECOME INCREDIBLY MUSCULAR", chip: "text-success" },
  {
    key: "INTELLIGENT",
    label: "BECOME INCREDIBLY INTELLIGENT",
    chip: "text-info",
  },
  { key: "GENERAL", label: "GENERAL", chip: "text-secondary" },
];

const addDays = (yyyyMMdd, days) => {
  const d = new Date(yyyyMMdd);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const formatDisplayDate = (yyyyMMdd) => {
  const d = new Date(yyyyMMdd);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const getMondayOfCurrentWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diffToMonday);
  return now.toISOString().split("T")[0];
};

const monthKeyFromDate = (yyyyMMdd) => yyyyMMdd.slice(0, 7);

const getCategoryFromTitle = (title = "") => {
  const match = title.match(/\[(RICH|MUSCULAR|INTELLIGENT|GENERAL)\]\s*$/i);
  if (!match) return "GENERAL";
  return match[1].toUpperCase();
};

const cleanTitle = (title = "") =>
  title.replace(/\s*\[(RICH|MUSCULAR|INTELLIGENT|GENERAL)\]\s*$/i, "").trim();

const buildStoredTitle = (title, category) => `${cleanTitle(title)} [${category}]`;

export default function WeeklyPlanner() {
  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [plannerData, setPlannerData] = useState(null);

  const [weeklyPercent, setWeeklyPercent] = useState("--");
  const [monthlyPercent, setMonthlyPercent] = useState("--");

  const [newTaskTitle, setNewTaskTitle] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: "" }), {})
  );

  const [selectedCategory, setSelectedCategory] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: "RICH" }), {})
  );

  const weekDates = useMemo(
    () => DAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekEnd = useMemo(() => weekDates[5], [weekDates]);

  const weekLabel = useMemo(
    () => `${formatDisplayDate(weekDates[0])} - ${formatDisplayDate(weekDates[5])}`,
    [weekDates]
  );

  const fetchPlanner = async () => {
    const res = await api.get(`/planner/week?start=${weekStart}`);
    setPlannerData(res.data);
  };

  const fetchAnalytics = async () => {
    const weeklyRes = await api.get(
      `/analytics/weekly?start=${weekStart}&end=${weekEnd}`
    );
    setWeeklyPercent(weeklyRes.data?.percentage ?? "--");

    const monthKey = monthKeyFromDate(weekStart);
    const monthlyRes = await api.get(`/analytics/monthly?month=${monthKey}`);
    setMonthlyPercent(monthlyRes.data?.percentage ?? "--");
  };

  useEffect(() => {
    fetchPlanner();
    fetchAnalytics();
    // eslint-disable-next-line
  }, [weekStart]);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));

  const groupBySection = (tasks) => {
    const grouped = { RICH: [], MUSCULAR: [], INTELLIGENT: [], GENERAL: [] };
    for (const t of tasks) {
      const sec = getCategoryFromTitle(t.title);
      grouped[sec].push({ ...t, displayTitle: cleanTitle(t.title) });
    }
    return grouped;
  };

  const addTask = async (day) => {
    const title = newTaskTitle[day]?.trim();
    if (!title) return;

    const category = selectedCategory[day] || "GENERAL";
    const storedTitle = buildStoredTitle(title, category);

    await api.post("/tasks", { title: storedTitle, dayOfWeek: day });

    setNewTaskTitle((prev) => ({ ...prev, [day]: "" }));
    await fetchPlanner();
    await fetchAnalytics();
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    await fetchPlanner();
    await fetchAnalytics();
  };

  const toggleComplete = async (task) => {
    if (!task.date) return;

    if (task.isCompleted) {
      await api.delete(
        `/planner/complete?taskId=${task._id}&date=${task.date}`
      );
    } else {
      await api.post("/planner/complete", {
        taskId: task._id,
        date: task.date,
      });
    }

    await fetchPlanner();
    await fetchAnalytics();
  };

  return (
    <BootLayout
      title="Planner"
      subtitle={weekLabel}
      right={
        <>
          <button
            className="btn btn-nav btn-sm d-flex align-items-center gap-2 px-3"
            onClick={prevWeek}
          >
            <i className="bi bi-chevron-left" />
            <span className="d-none d-md-inline">Prev</span>
          </button>

          <button
            className="btn btn-nav btn-sm d-flex align-items-center gap-2 px-3"
            onClick={nextWeek}
          >
            <span className="d-none d-md-inline">Next</span>
            <i className="bi bi-chevron-right" />
          </button>
        </>
      }
    >
      {/* Analytics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card p-4">
            <div className="text-subtle text-uppercase small">
              Weekly Completion
            </div>
            <div className="display-6 fw-bold mt-2 text-white">
              {weeklyPercent}%
            </div>
            <div className="text-subtle small mt-1">Mon–Sat of selected week</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card p-4">
            <div className="text-subtle text-uppercase small">
              Monthly Completion
            </div>
            <div className="display-6 fw-bold mt-2 text-white">
              {monthlyPercent}%
            </div>
            <div className="text-subtle small mt-1">Month of selected week</div>
          </div>
        </div>
      </div>

      {!plannerData ? (
        <div className="text-subtle">Loading planner...</div>
      ) : (
        <div className="row g-3">
          {DAYS.map((day, idx) => {
            const date = weekDates[idx];
            const tasks = plannerData.tasksByDay?.[day] || [];
            const grouped = groupBySection(tasks);

            return (
              <div key={day} className="col-12 col-md-6 col-xl-4 col-xxl-2">
                <div className="card p-3 h-100">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="fw-bold text-white">{day}</div>
                      <div className="text-subtle small">{date}</div>
                    </div>

                    <span className="badge badge-soft">
                      {formatDisplayDate(date)}
                    </span>
                  </div>

                  {/* Add */}
                  <div className="mb-3">
                    <input
                      className="form-control form-control-sm mb-2"
                      placeholder="Add a task..."
                      value={newTaskTitle[day]}
                      onChange={(e) =>
                        setNewTaskTitle((prev) => ({
                          ...prev,
                          [day]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(day);
                      }}
                    />

                    <div className="d-flex gap-2 align-items-center">
                      <select
                        className="form-select form-select-sm"
                        value={selectedCategory[day]}
                        onChange={(e) =>
                          setSelectedCategory((prev) => ({
                            ...prev,
                            [day]: e.target.value,
                          }))
                        }
                      >
                        {SECTIONS.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.key}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3"
                        onClick={() => addTask(day)}
                      >
                        <i className="bi bi-plus-lg" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="d-flex flex-column gap-3">
                    {SECTIONS.map((sec) => {
                      const secTasks = grouped[sec.key] || [];

                      return (
                        <div key={sec.key}>
                          <div className={`small fw-bold mb-2 ${sec.chip}`}>
                            {sec.label}{" "}
                            <span className="text-subtle">({secTasks.length})</span>
                          </div>

                          {secTasks.length === 0 ? (
                            <div className="text-subtle small">No tasks</div>
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              {secTasks.map((task) => (
                                <div
                                  key={task._id}
                                  className="p-3 rounded-3 d-flex justify-content-between gap-2 align-items-start card-soft"
                                >
                                  <div className="d-flex gap-2">
                                    <input
                                      type="checkbox"
                                      className="form-check-input mt-1"
                                      checked={!!task.isCompleted}
                                      onChange={() => toggleComplete(task)}
                                    />

                                    <div>
                                      <div
                                        className={
                                          task.isCompleted
                                            ? "fw-semibold text-decoration-line-through text-subtle"
                                            : "fw-semibold text-white"
                                        }
                                      >
                                        {task.displayTitle}
                                      </div>

                                      <div className="small text-subtle mt-1">
                                        {task.date}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    className="btn btn-nav btn-sm d-flex align-items-center gap-2"
                                    onClick={() => deleteTask(task._id)}
                                    title="Delete"
                                  >
                                    <i className="bi bi-trash3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BootLayout>
  );
}
