import { useState } from "react";
import { logout } from "../services/auth";

const NavItem = ({ href, label, icon }) => {
  const active = window.location.pathname === href;

  return (
    <a
      href={href}
      className={
        active
          ? "flex items-center gap-3 px-3 py-2 rounded-xl bg-white text-black font-semibold shadow-sm"
          : "flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-900/70 hover:text-white transition"
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </a>
  );
};

export default function AppLayout({ title, subtitle, rightActions, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Mobile topbar */}
      <div className="md:hidden sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:bg-zinc-900"
          >
            ☰
          </button>

          <div className="text-sm font-semibold truncate">
            {title || "Power System"}
          </div>

          <a
            href="/today"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
          >
            Today
          </a>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-zinc-950 border-r border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-lg font-bold tracking-tight">
                  Power System
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  SaaS Weekly Planner
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <NavItem href="/today" label="Today" icon="⚡" />
              <NavItem href="/planner" label="Planner" icon="🗓️" />
              <NavItem href="/dashboard" label="Dashboard" icon="📊" />
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="w-full px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="max-w-7xl mx-auto md:grid md:grid-cols-[270px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen border-r border-zinc-900 bg-zinc-950">
          <div className="p-5">
            <div className="text-xl font-bold tracking-tight">Power System</div>
            <div className="text-xs text-zinc-500 mt-1">
              Notion-style weekly system
            </div>

            <div className="mt-6 space-y-2">
              <NavItem href="/today" label="Today" icon="⚡" />
              <NavItem href="/planner" label="Planner" icon="🗓️" />
              <NavItem href="/dashboard" label="Dashboard" icon="📊" />
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900">
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:bg-zinc-900"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-h-screen">
          {/* Desktop topbar */}
          <div className="hidden md:block sticky top-0 z-20 bg-zinc-950/60 backdrop-blur border-b border-zinc-900">
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-2xl font-bold tracking-tight truncate">
                  {title}
                </div>
                {subtitle && (
                  <div className="text-sm text-zinc-400 mt-1 truncate">
                    {subtitle}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rightActions}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 md:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
