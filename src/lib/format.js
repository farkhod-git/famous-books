/**
 * Backend ikki xil format qaytaradi:
 *  - CommentDto:  "2026-10-03 00:15:21"  (@JsonFormat)
 *  - PostDto:     "2026-10-03T00:14:36.381726" (ISO, formatsiz)
 * Ikkisini ham bitta Date ga keltiramiz.
 */
export function parseDate(value) {
  if (!value) return null;
  const normalized = typeof value === "string" ? value.replace(" ", "T") : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCount(n) {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (value >= 1000) return (value / 1000).toFixed(1).replace(".0", "") + "K";
  return String(value);
}

const UNITS = [
  { limit: 60, div: 1, suffix: "soniya oldin" },
  { limit: 3600, div: 60, suffix: "daqiqa oldin" },
  { limit: 86400, div: 3600, suffix: "soat oldin" },
  { limit: 604800, div: 86400, suffix: "kun oldin" },
];

/* Brauzerlarda uz-UZ oylari "M07" ko'rinishida chiqadi, shuning uchun
   oy nomlarini o'zimiz yozamiz. */
const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const MONTHS_SHORT = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

function clock(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDate(value, { short = false } = {}) {
  const date = parseDate(value);
  if (!date) return "";
  const months = short ? MONTHS_SHORT : MONTHS;
  const day = `${date.getDate()}-${months[date.getMonth()]}`;
  return date.getFullYear() === new Date().getFullYear()
    ? day
    : `${day}, ${date.getFullYear()}`;
}

export function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "hozir";

  for (const unit of UNITS) {
    if (seconds < unit.limit) {
      return `${Math.floor(seconds / unit.div)} ${unit.suffix}`;
    }
  }

  return formatDate(date, { short: true });
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}, ${clock(date)}`;
}

export function formatFullDate(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export function fullName(profile) {
  if (!profile) return "Foydalanuvchi";
  const name = [profile.firstname, profile.lastname].filter(Boolean).join(" ").trim();
  return name || profile.email || "Foydalanuvchi";
}

export function initials(profile) {
  if (!profile) return "?";
  const first = profile.firstname?.[0] || profile.email?.[0] || "?";
  const last = profile.lastname?.[0] || "";
  return (first + last).toUpperCase();
}
