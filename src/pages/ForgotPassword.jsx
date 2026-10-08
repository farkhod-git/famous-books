import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader, ChevronLeft, MailCheck } from "lucide-react";
import { forgetPassword, changePassword } from "../api/auth";
import { useCountdown } from "../hooks/useCountdown";
import CodeTimer from "../components/CodeTimer";

const CODE_TTL_SECONDS = 120;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", newPrePassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { left, expired, restart } = useCountdown(CODE_TTL_SECONDS);

  async function handleSendCode(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgetPassword({ email: email.trim() });
      setStep("reset");
      restart();
    } catch (err) {
      setError(err.message || "Kod yuborilmadi");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();

    /* Backend bu tekshiruvni qilmaydi, shuning uchun shu yerda qilamiz. */
    if (passwords.newPassword !== passwords.newPrePassword) {
      setError("Parollar bir xil emas");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await changePassword({ email: email.trim(), code: code.trim(), ...passwords });
      navigate("/login?reset=ok", { replace: true });
    } catch (err) {
      setError(err.message || "Parol o'zgartirilmadi");
    } finally {
      setBusy(false);
    }
  }

  if (step === "reset") {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleReset}>
          <div className="auth-logo">
            <MailCheck size={24} />
            <span>Yangi parol</span>
          </div>

          <p className="auth-subtitle">
            <strong>{email}</strong> manziliga 4 xonali kod yubordik.
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

          <div className="form-group">
            <label htmlFor="newPassword">Yangi parol</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={passwords.newPassword}
              onChange={(event) =>
                setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPrePassword">Yangi parolni takrorlang</label>
            <input
              id="newPrePassword"
              type="password"
              autoComplete="new-password"
              value={passwords.newPrePassword}
              onChange={(event) =>
                setPasswords((prev) => ({ ...prev, newPrePassword: event.target.value }))
              }
              placeholder="••••••••"
              required
            />
          </div>

          <CodeTimer
            left={left}
            expired={expired}
            onResend={async () => {
              await forgetPassword({ email: email.trim() });
              setCode("");
              setError("");
              restart();
            }}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-submit" disabled={busy || expired || code.length < 4}>
            {busy ? (
              <><Loader size={16} className="spin" /> Saqlanmoqda...</>
            ) : (
              <><KeyRound size={16} /> Parolni o'zgartirish</>
            )}
          </button>

          <button type="button" className="back-btn" onClick={() => setStep("email")}>
            <ChevronLeft size={16} /> Boshqa email kiritish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSendCode}>
        <div className="auth-logo">
          <KeyRound size={24} />
          <span>Parolni tiklash</span>
        </div>

        <p className="auth-subtitle">
          Hisobingiz emailini kiriting — unga tasdiqlash kodi yuboramiz.
        </p>

        <div className="form-group">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="siz@example.com"
            required
            autoFocus
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={busy || !email.trim()}>
          {busy ? (
            <><Loader size={16} className="spin" /> Yuborilmoqda...</>
          ) : (
            "Kod yuborish"
          )}
        </button>

        <p className="auth-switch">
          Esingizga tushdimi? <Link to="/login">Kirish</Link>
        </p>
      </form>
    </div>
  );
}
