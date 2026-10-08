import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader, UserPlus, MailCheck, ChevronLeft } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { useCountdown } from "../hooks/useCountdown";
import CodeTimer from "../components/CodeTimer";
import GoogleButton from "../components/GoogleButton";

const CODE_TTL_SECONDS = 120;

export default function Register() {
  const { register, confirm } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    prePassword: "",
    birthdate: "",
    address: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { left, expired, restart } = useCountdown(CODE_TTL_SECONDS);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (form.password !== form.prePassword) {
      setError("Parollar bir xil emas");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await register({
        ...form,
        birthdate: form.birthdate || undefined,
        address: form.address || undefined,
        lastname: form.lastname || undefined,
      });
      setStep("confirm");
      restart();
    } catch (err) {
      setError(err.message || "Ro'yxatdan o'tish amalga oshmadi");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await confirm({ email: form.email, code: code.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Kod tasdiqlanmadi");
    } finally {
      setBusy(false);
    }
  }

  if (step === "confirm") {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleConfirm}>
          <div className="auth-logo">
            <MailCheck size={26} />
            <span>Emailni tasdiqlang</span>
          </div>

          <p className="auth-subtitle">
            <strong>{form.email}</strong> manziliga 4 xonali kod yubordik.
          </p>

          <div className="form-group">
            <label htmlFor="code">Tasdiqlash kodi</label>
            <input
              id="code"
              className="code-input"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="0000"
              required
              autoFocus
            />
          </div>

          <CodeTimer
            left={left}
            expired={expired}
            onResend={async () => {
              await register({ ...form, birthdate: form.birthdate || undefined });
              setCode("");
              setError("");
              restart();
            }}
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn-submit"
            disabled={busy || expired || code.length < 4}
          >
            {busy ? <><Loader size={16} className="spin" /> Tekshirilmoqda...</> : "Tasdiqlash"}
          </button>

          <button type="button" className="back-btn" onClick={() => setStep("form")}>
            <ChevronLeft size={16} /> Ma'lumotlarni o'zgartirish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <Logo size={30} className="auth-logo" />

        <h1 className="auth-title">Ro'yxatdan o'tish</h1>

        <div className="field-row">
          <div className="form-group">
            <label htmlFor="firstname">Ism *</label>
            <input id="firstname" name="firstname" value={form.firstname} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Familiya</label>
            <input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email *</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-row">
          <div className="form-group">
            <label htmlFor="reg-password">Parol *</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pre-password">Parolni takrorlang *</label>
            <input
              id="pre-password"
              name="prePassword"
              type="password"
              autoComplete="new-password"
              value={form.prePassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field-row">
          <div className="form-group">
            <label htmlFor="birthdate">Tug'ilgan kun</label>
            <input id="birthdate" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="address">Manzil</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Shahar, tuman" />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={busy}>
          {busy ? <><Loader size={16} className="spin" /> Yuborilmoqda...</> : <><UserPlus size={16} /> Davom etish</>}
        </button>

        <GoogleButton label="Google orqali ro'yxatdan o'tish" />

        <p className="auth-switch">
          Hisobingiz bormi? <Link to="/login">Kirish</Link>
        </p>
      </form>
    </div>
  );
}
