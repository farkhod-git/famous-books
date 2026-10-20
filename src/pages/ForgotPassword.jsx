import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader, ChevronLeft, MailCheck } from "lucide-react";
import { forgetPassword, changePassword } from "../api/auth";
import { useCountdown } from "../hooks/useCountdown";
import CodeTimer from "../components/CodeTimer";
import {
  emailError, passwordError, passwordMatchError, collect, PASSWORD_MIN, PASSWORD_MAX,
} from "../lib/validation";

const CODE_TTL_SECONDS = 120;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", newPrePassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { left, expired, restart } = useCountdown(CODE_TTL_SECONDS);

  async function handleSendCode(event) {
    event.preventDefault();

    const bad = emailError(email);
    if (bad) {
      setFieldErrors({ email: bad });
      return;
    }

    setFieldErrors({});
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

    /* ChangePasswordDto da uzunlik cheklovi yo'q, lekin login 6-20 talab
       qiladi — qisqa parol qo'yilsa foydalanuvchi kira olmay qoladi. */
    const invalid = collect({
      newPassword: passwordError(passwords.newPassword),
      newPrePassword: passwordMatchError(passwords.newPassword, passwords.newPrePassword),
    });

    if (invalid) {
      setFieldErrors(invalid);
      setError("");
      return;
    }

    setFieldErrors({});
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
              onChange={(event) => {
                setPasswords((prev) => ({ ...prev, newPassword: event.target.value }));
                setFieldErrors((prev) => ({ ...prev, newPassword: null }));
              }}
              placeholder="••••••••"
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              aria-invalid={Boolean(fieldErrors.newPassword)}
              required
            />
            {fieldErrors.newPassword ? (
              <span className="field-error">{fieldErrors.newPassword}</span>
            ) : (
              <span className="char-count">{PASSWORD_MIN}–{PASSWORD_MAX} ta belgi</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPrePassword">Yangi parolni takrorlang</label>
            <input
              id="newPrePassword"
              type="password"
              autoComplete="new-password"
              value={passwords.newPrePassword}
              onChange={(event) => {
                setPasswords((prev) => ({ ...prev, newPrePassword: event.target.value }));
                setFieldErrors((prev) => ({ ...prev, newPrePassword: null }));
              }}
              placeholder="••••••••"
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              aria-invalid={Boolean(fieldErrors.newPrePassword)}
              required
            />
            {fieldErrors.newPrePassword && (
              <span className="field-error">{fieldErrors.newPrePassword}</span>
            )}
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
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors({});
            }}
            placeholder="siz@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            required
            autoFocus
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
