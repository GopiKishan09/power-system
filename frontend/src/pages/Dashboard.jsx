import { useEffect, useState } from "react";
import api from "../services/api";
import { logout } from "../services/auth";

export default function Dashboard() {
  const [weekly, setWeekly] = useState("--");
  const [monthly, setMonthly] = useState("--");
  const [streak, setStreak] = useState("--");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weeklyRes = await api.get("/analytics/weekly");
        setWeekly(weeklyRes.data.percentage);

        const monthlyRes = await api.get("/analytics/monthly");
        setMonthly(monthlyRes.data.percentage);

        const streakRes = await api.get("/analytics/streak");
        setStreak(streakRes.data.streak);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Power System Dashboard</h1>
        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-semibold">Weekly %</h2>
          <p className="text-4xl mt-4">{weekly}%</p>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-semibold">Monthly %</h2>
          <p className="text-4xl mt-4">{monthly}%</p>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-semibold">Streak 🔥</h2>
          <p className="text-4xl mt-4">{streak}</p>
        </div>
      </div>
    </div>
  );
}
