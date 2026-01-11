import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import BootLayout from "../components/BootLayout";

const MONTHS = [
  { key: "01", label: "Jan" },
  { key: "02", label: "Feb" },
  { key: "03", label: "Mar" },
  { key: "04", label: "Apr" },
  { key: "05", label: "May" },
  { key: "06", label: "Jun" },
  { key: "07", label: "Jul" },
  { key: "08", label: "Aug" },
  { key: "09", label: "Sep" },
  { key: "10", label: "Oct" },
  { key: "11", label: "Nov" },
  { key: "12", label: "Dec" },
];

const progressVariant = (p) => {
  if (p >= 80) return "bg-success";
  if (p >= 55) return "bg-info";
  if (p >= 30) return "bg-warning";
  return "bg-danger";
};

export default function Dashboard() {
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [monthsData, setMonthsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchYearly = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      // ✅ expected: { months: [{month:"01", percentage: 22}, ...] }
      const res = await api.get(`/analytics/yearly?year=${year}`);
      const months = res.data?.months || [];
      setMonthsData(months);
    } catch (e) {
      setMonthsData([]);
      setErrMsg(
        e?.response?.data?.message ||
          "Yearly analytics endpoint missing. (Backend me /analytics/yearly add karna padega)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearly();
    // eslint-disable-next-line
  }, [year]);

  const mergedMonths = useMemo(() => {
    return MONTHS.map((m) => {
      const found = monthsData.find((x) => x.month === m.key);
      return {
        ...m,
        percentage: found?.percentage ?? 0,
        completedCount: found?.completedCount ?? 0,
        totalCount: found?.totalCount ?? 0,
      };
    });
  }, [monthsData]);

  const avg = useMemo(() => {
    if (!mergedMonths.length) return 0;
    const sum = mergedMonths.reduce((acc, m) => acc + (m.percentage || 0), 0);
    return Math.round(sum / 12);
  }, [mergedMonths]);

  const best = useMemo(() => {
    if (!mergedMonths.length) return { label: "-", percentage: 0 };
    return mergedMonths.reduce((a, b) =>
      (b.percentage || 0) > (a.percentage || 0) ? b : a
    );
  }, [mergedMonths]);

  const worst = useMemo(() => {
    if (!mergedMonths.length) return { label: "-", percentage: 0 };
    return mergedMonths.reduce((a, b) =>
      (b.percentage || 0) < (a.percentage || 0) ? b : a
    );
  }, [mergedMonths]);

  return (
    <BootLayout
      title="Dashboard"
      subtitle={`Yearly Performance • ${year}`}
      right={
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-nav btn-sm d-flex align-items-center gap-2"
            onClick={fetchYearly}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>

          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 120 }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const y = String(new Date().getFullYear() - i);
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      }
    >
      {/* Top Summary */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="card p-4 h-100">
            <div className="text-subtle small text-uppercase">
              Average Completion
            </div>
            <div className="display-6 fw-bold text-white mt-2">{avg}%</div>
            <div className="text-subtle small mt-1">12 months average</div>

            <div className="mt-4">
              <div className="text-subtle small mb-2">Avg progress</div>
              <div className="progress" style={{ height: 10 }}>
                <div
                  className={`progress-bar ${progressVariant(avg)}`}
                  style={{ width: `${avg}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-4 h-100">
            <div className="text-subtle small text-uppercase">Best Month</div>
            <div className="d-flex align-items-end justify-content-between mt-2">
              <div className="fw-bold fs-3 text-white">{best.label}</div>
              <div className="badge badge-soft fs-6">{best.percentage}%</div>
            </div>
            <div className="text-subtle small mt-1">Highest execution month</div>

            <div className="mt-4">
              <div className="progress" style={{ height: 10 }}>
                <div
                  className={`progress-bar ${progressVariant(best.percentage)}`}
                  style={{ width: `${best.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-4 h-100">
            <div className="text-subtle small text-uppercase">Lowest Month</div>
            <div className="d-flex align-items-end justify-content-between mt-2">
              <div className="fw-bold fs-3 text-white">{worst.label}</div>
              <div className="badge badge-soft fs-6">{worst.percentage}%</div>
            </div>
            <div className="text-subtle small mt-1">
              Needs improvement month
            </div>

            <div className="mt-4">
              <div className="progress" style={{ height: 10 }}>
                <div
                  className={`progress-bar ${progressVariant(worst.percentage)}`}
                  style={{ width: `${worst.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errMsg ? (
        <div className="alert alert-warning py-2">{errMsg}</div>
      ) : null}

      {/* Grid */}
      {loading ? (
        <div className="text-subtle">Loading...</div>
      ) : (
        <div className="row g-3">
          {mergedMonths.map((m) => {
            const p = m.percentage ?? 0;
            return (
              <div className="col-12 col-md-6 col-xl-3" key={m.key}>
                <div className="card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold text-white">{m.label}</div>
                    <span className="badge badge-soft">{p}%</span>
                  </div>

                  <div className="text-subtle small mt-2">
                    Done: {m.completedCount ?? 0} • Total: {m.totalCount ?? 0}
                  </div>

                  <div className="mt-3">
                    <div className="progress" style={{ height: 10 }}>
                      <div
                        className={`progress-bar ${progressVariant(p)}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 d-flex gap-2">
                    <a href="/planner" className="btn btn-nav btn-sm w-100">
                      <i className="bi bi-calendar3 me-2" />
                      Planner
                    </a>
                    <a href="/today" className="btn btn-primary btn-sm w-100">
                      <i className="bi bi-lightning-charge-fill me-2" />
                      Today
                    </a>
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
