import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import BootLayout from "../components/BootLayout";

const getToday = () => new Date().toISOString().split("T")[0];

const getDayName = (yyyyMMdd) => {
  const d = new Date(yyyyMMdd);
  return d.toLocaleDateString("en-IN", { weekday: "long" });
};

export default function Today() {
  const [date, setDate] = useState(getToday());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const label = useMemo(() => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [date]);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/planner/today?date=${date}`);
      setData(res.data);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
    // eslint-disable-next-line
  }, [date]);

  const toggleComplete = async (task) => {
    if (!task.date) return;

    if (task.isCompleted) {
      await api.delete(`/planner/complete?taskId=${task._id}&date=${task.date}`);
    } else {
      await api.post("/planner/complete", { taskId: task._id, date: task.date });
    }

    fetchToday();
  };

  const total = data?.totalTasks ?? 0;
  const done = data?.completedCount ?? 0;
  const percent = data?.percentage ?? 0;

  return (
    <BootLayout
      title="Today"
      subtitle={label}
      right={
        <div className="d-flex gap-2 align-items-center">
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ maxWidth: 170 }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn btn-nav btn-sm d-flex align-items-center gap-2"
            onClick={fetchToday}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      }
    >
      {/* Top Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-bold text-white fs-5">Execution</div>
                <div className="text-subtle small">
                  {getDayName(date)} performance
                </div>
              </div>
              <span className="badge badge-soft">{percent}%</span>
            </div>

            <div className="mt-3">
              <div className="progress" style={{ height: 10 }}>
                <div
                  className="progress-bar bg-info"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-subtle small mt-2">
                Completed {done}/{total} tasks
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <a className="btn btn-primary w-100" href="/planner">
                <i className="bi bi-calendar3 me-2" />
                Weekly Planner
              </a>
              <a className="btn btn-nav w-100" href="/dashboard">
                <i className="bi bi-bar-chart-fill me-2" />
                Dashboard
              </a>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 h-100">
            <div className="fw-bold text-white fs-5">Quick Rules</div>
            <div className="text-subtle small mt-1">
              Small habits, consistent execution.
            </div>

            <div className="mt-3 d-flex flex-column gap-2">
              <div className="card-soft p-3 rounded-3">
                ✅ Focus on <b>completion</b>, not perfection.
              </div>
              <div className="card-soft p-3 rounded-3">
                ✅ Finish tasks before adding new tasks.
              </div>
              <div className="card-soft p-3 rounded-3">
                ✅ Track daily. Improve weekly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today Tasks */}
      <div className="card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="fw-bold text-white fs-5">Today’s Tasks</div>
            <div className="text-subtle small">
              Tick the box to mark as done.
            </div>
          </div>

          <span className="badge badge-soft">
            {done}/{total} Done
          </span>
        </div>

        {loading ? (
          <div className="text-subtle">Loading...</div>
        ) : !data || (data.tasks || []).length === 0 ? (
          <div className="text-subtle">No tasks for today.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {data.tasks.map((task) => (
              <div
                key={task._id}
                className="card-soft p-3 rounded-3 d-flex align-items-start justify-content-between gap-2"
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
                      {task.title}
                    </div>
                    <div className="text-subtle small">{task.dayOfWeek}</div>
                  </div>
                </div>

                <span className="badge badge-soft">
                  {task.isCompleted ? (
                    <>
                      <i className="bi bi-check2-circle me-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <i className="bi bi-circle me-1" />
                      Pending
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BootLayout>
  );
}
