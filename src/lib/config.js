/**
 * Frontend va API bitta origin orqali beriladi:
 *   - prodda nginx `/api` ni backendga uzatadi
 *   - devda Vite proxy xuddi shuni qiladi (vite.config.js)
 *
 * Shuning uchun nisbiy manzil yetarli va CORS umuman kerak emas.
 * Boshqa manzil kerak bo'lsa VITE_API_BASE_URL bilan almashtiriladi.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
