import { logout } from "../services/auth";

const NavLink = ({ href, icon, label }) => {
  const active = window.location.pathname === href;

  return (
    <a
      href={href}
      className={
        active
          ? "btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-2 px-3"
          : "btn btn-nav btn-sm d-flex align-items-center justify-content-center gap-2 px-3"
      }
      style={{ minWidth: 52 }}
      title={label}
    >
      <i className={`bi ${icon}`} />
      <span className="d-none d-md-inline">{label}</span>
    </a>
  );
};

export default function BootLayout({ title, subtitle, right, children }) {
  return (
    <div className="min-vh-100">
      <nav className="navbar navbar-dark sticky-top navbar-premium border-bottom py-2">
        <div className="container-fluid px-3 px-md-4">
          {/* ✅ MOBILE / DESKTOP WRAPPER */}
          <div className="w-100 d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 gap-md-3">
            {/* ✅ TOP ROW (mobile): title + actions */}
            <div className="d-flex align-items-center justify-content-between gap-2">
              {/* Title */}
              <div className="min-w-0">
                <div className="fw-bold text-white text-truncate">{title}</div>
                {subtitle ? (
                  <div className="small text-subtle text-truncate">
                    {subtitle}
                  </div>
                ) : null}
              </div>

              {/* Actions (mobile visible) */}
              <div className="d-flex align-items-center gap-2">
                {right ? <div className="d-none d-md-flex">{right}</div> : null}

                <button
                  className="btn btn-danger btn-sm d-flex align-items-center gap-2 px-3"
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                >
                  <i className="bi bi-box-arrow-right" />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            </div>

            {/* ✅ NAV ROW (mobile): centered */}
            <div className="d-flex align-items-center justify-content-center justify-content-md-center gap-2 flex-wrap">
              <NavLink
                href="/today"
                icon="bi-lightning-charge-fill"
                label="Today"
              />
              <NavLink href="/planner" icon="bi-calendar3" label="Planner" />
              <NavLink
                href="/dashboard"
                icon="bi-bar-chart-fill"
                label="Dashboard"
              />
            </div>

            {/* ✅ Desktop right controls on same row */}
            {right ? (
              <div className="d-flex d-md-none justify-content-center">
                {/* right controls below nav on mobile */}
                <div className="d-flex gap-2">{right}</div>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 py-4">{children}</div>
    </div>
  );
}
