import { useState } from "react";
import api from "../services/api";

export default function Signup() {
  const [name, setName] = useState("Gopi");
  const [email, setEmail] = useState("gopi@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      window.location.href = "/";
    } catch (err) {
      setMsg(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="card p-4 p-md-5" style={{ width: "100%", maxWidth: 520 }}>
        <div className="mb-4">
          <div className="badge badge-soft mb-3">Power System</div>
          <h2 className="fw-bold mb-1">Create account</h2>
          <div className="text-subtle">
            Start tracking weekly execution like a BatMan.
          </div>
        </div>

        {msg ? (
          <div className="alert alert-danger py-2">{msg}</div>
        ) : null}

        <form onSubmit={submit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label text-subtle">Name</label>
            <input
              className="form-control form-control-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="form-label text-subtle">Email</label>
            <input
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="form-label text-subtle">Password</label>
            <input
              className="form-control form-control-lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button
            disabled={loading}
            className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus-fill" />
                Create Account
              </>
            )}
          </button>

          <div className="text-center text-subtle">
            Already have an account?{" "}
            <a href="/" className="text-white fw-semibold">
              Login →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
