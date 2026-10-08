import { useState, useRef, useEffect } from "react";
import { Send, X, Loader } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../hooks/useAuth";

export default function CommentComposer({
  onSubmit,
  onCancel,
  placeholder = "Izoh yozing...",
  submitLabel,
  autoFocus = false,
  compact = false,
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function autoGrow(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setError("");
    try {
      await onSubmit(content);
      setText("");
      autoGrow(inputRef.current);
    } catch (err) {
      setError(err.message || "Izoh yuborilmadi");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event);
    }
    if (event.key === "Escape" && onCancel) {
      onCancel();
    }
  }

  return (
    <form className={`composer ${compact ? "composer-compact" : ""}`} onSubmit={handleSubmit}>
      <Avatar profile={user} size={compact ? 28 : 34} />

      <div className="composer-main">
        <textarea
          ref={inputRef}
          className="composer-input"
          rows={1}
          placeholder={placeholder}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            autoGrow(event.target);
          }}
          onKeyDown={handleKeyDown}
          maxLength={1000}
        />

        {error && <span className="composer-error">{error}</span>}

        <div className="composer-actions">
          {onCancel && (
            <button type="button" className="composer-cancel" onClick={onCancel}>
              <X size={14} /> Bekor qilish
            </button>
          )}
          <button type="submit" className="composer-send" disabled={!text.trim() || sending}>
            {sending ? <Loader size={14} className="spin" /> : <Send size={14} />}
            {submitLabel || (compact ? "Javob berish" : "Yuborish")}
          </button>
        </div>
      </div>
    </form>
  );
}
