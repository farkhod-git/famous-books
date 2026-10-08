import { useState, useEffect, useCallback } from "react";

/** Sekundlab teskari sanaydi. restart() qaytadan boshlaydi. */
export function useCountdown(seconds) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    /* setState faqat interval ichida — effekt tanasida sinxron chaqirilmaydi. */
    const timer = setInterval(() => {
      setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    }, 500);

    return () => clearInterval(timer);
  }, [endsAt]);

  const restart = useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setLeft(seconds);
  }, [seconds]);

  return { left, expired: left <= 0, restart };
}

export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
