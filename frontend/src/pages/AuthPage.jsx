import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, tokenStorage } from "../api/client";

const initialForm = {
  name: "",
  email: "",
  password: "",
  bootstrapKey: ""
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [bootstrapRequired, setBootstrapRequired] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tokenStorage.get()) {
      navigate("/dashboard", { replace: true });
      return;
    }

    adminApi
      .bootstrapStatus()
      .then((data) => {
        setBootstrapRequired(data.bootstrapRequired);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [navigate]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = bootstrapRequired
        ? await adminApi.bootstrapAdmin(form)
        : await adminApi.login({ email: form.email, password: form.password });

      tokenStorage.set(payload.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Smart Care Q</p>
        <h1>Admin Authentication and AI Queue Control</h1>
        <p className="hero-copy">
          This standalone workspace is dedicated to admin login, analytics, and predicted
          consultation timing without touching the other project folders.
        </p>
        <div className="hero-grid">
          <div>
            <strong>Includes</strong>
            <p>Secure admin access, operational analytics, wait-time prediction.</p>
          </div>
          <div>
            <strong>Built For</strong>
            <p>Hospital admin dashboard work that you can push independently.</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card__heading">
          <p className="eyebrow">
            {bootstrapRequired === null
              ? "Checking Setup"
              : bootstrapRequired
                ? "First-Time Setup"
                : "Admin Login"}
          </p>
          <h2>
            {bootstrapRequired === null
              ? "Checking admin bootstrap status"
              : bootstrapRequired
                ? "Create the first admin"
                : "Sign in to the admin console"}
          </h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {bootstrapRequired ? (
            <label>
              Full Name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={updateField}
                placeholder="Smart Care Admin"
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="admin@smartcareq.local"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter your admin password"
              required
            />
          </label>

          {bootstrapRequired ? (
            <label>
              Bootstrap Key
              <input
                name="bootstrapKey"
                type="text"
                value={form.bootstrapKey}
                onChange={updateField}
                placeholder="smartcareq-admin-bootstrap"
                required
              />
            </label>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button
            className="primary-button"
            type="submit"
            disabled={loading || bootstrapRequired === null}
          >
            {bootstrapRequired === null
              ? "Checking..."
              : loading
              ? "Working..."
              : bootstrapRequired
                ? "Create Admin and Continue"
                : "Login to Dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
