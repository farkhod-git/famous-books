import { useState } from "react";
import { Loader, RotateCw, TimerReset } from "lucide-react";
import { formatCountdown } from "../hooks/useCountdown";

/** Kod amal qilish vaqti va tugagach qaytadan yuborish tugmasi. */
export default function CodeTimer({ left, expired, onResend }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setSending(true);
    setError("");
    try {
      await onResend();
    } catch (err) {
      setError(err.message || "Kod qayta yuborilmadi");
    } finally {
      setSending(false);
    }
  }

  if (!expired) {
    return (
      <p className="code-timer">
        <TimerReset size={14} />
        Kod <strong>{formatCountdown(left)}</strong> ichida amal qiladi
      </p>
    );
  }

  return (
    <div className="code-timer expired">
      <span>Kod muddati tugadi.</span>
      <button type="button" className="code-resend" onClick={handleResend} disabled={sending}>
        {sending ? <Loader size={14} className="spin" /> : <RotateCw size={14} />}
        Qaytadan yuborish
      </button>
      {error && <span className="composer-error">{error}</span>}
    </div>
  );
}
