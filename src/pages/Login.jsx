import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Loader, LogIn } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import GoogleButton from "../components/GoogleButton";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    params.get("error") === "oauth" ? "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring." : ""
  );
  const resetDone = params.get("reset") === "ok";
  const [busy, setBusy] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Kirish amalga oshmadi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Logo size={30} className="auth-logo" />

        <h1 className="auth-title">Hisobingizga kiring</h1>
        <p className="auth-subtitle">Postlar va izohlarni ko'rish uchun tizimga kirish kerak</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="siz@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Parol</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        {resetDone && !error && (
          <p className="auth-success">Parol o'zgartirildi — yangi parol bilan kiring.</p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={busy}>
          {busy ? <><Loader size={16} className="spin" /> Kirilmoqda...</> : <><LogIn size={16} /> Kirish</>}
        </button>

        <p className="auth-forgot">
          <Link to="/forgot-password">Parolni unutdingizmi?</Link>
        </p>

        <GoogleButton label="Google orqali kirish" />

        <p className="auth-switch">
          Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
        </p>
      </form>
    </div>
  );
}
