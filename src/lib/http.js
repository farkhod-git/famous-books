import { API_BASE_URL } from "./config";
import { getAccessToken, clearTokens } from "./tokenStore";
import { isTokenExpired } from "./jwt";

export class ApiError extends Error {
  constructor(message, { status = 0, code = 0, sessionExpired = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.sessionExpired = sessionExpired;
  }
}

/* AuthContext shu yerga ulanadi: sessiya tugasa butun app logout bo'ladi. */
let sessionExpiredHandler = null;
export function onSessionExpired(handler) {
  sessionExpiredHandler = handler;
}

function fireSessionExpired() {
  clearTokens();
  sessionExpiredHandler?.();
}

/**
 * Ko'pchilik biznes xatolari GlobalExceptionHandler orqali to'g'ri status
 * va matn bilan keladi. Ammo undan o'tib ketgan istisnolar (masalan DB
 * constraint xatosi) ERROR dispatch orqali /error ga tushadi, u esa
 * himoyalangani uchun bo'sh 401 bo'lib qaytadi. Shuning uchun 401 ni
 * ko'r-ko'rona logout deb qabul qila olmaymiz: avval tokenning o'zi
 * haqiqatda eskirganini tekshiramiz.
 */
function explain401() {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    fireSessionExpired();
    return new ApiError("Sessiya tugadi, qaytadan kiring", {
      status: 401,
      sessionExpired: true,
    });
  }
  return new ApiError("Serverda kutilmagan xatolik yuz berdi. Keyinroq urinib ko'ring.", {
    status: 401,
  });
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function messageFrom(body, fallback) {
  const first = body?.errors?.[0];
  return first?.message || fallback;
}

async function run(path, { method = "GET", body, headers = {}, auth = true, signal } = {}) {
  const token = auth ? getAccessToken() : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  if (res.status === 401) throw explain401();
  return res;
}

/** JSON qaytaruvchi so'rov — ApiResponseDto.data ni ochib beradi. */
export async function apiRequest(path, options = {}) {
  const res = await run(path, options);
  const body = await parseBody(res);

  if (!res.ok) {
    throw new ApiError(messageFrom(body, `So'rov muvaffaqiyatsiz (${res.status})`), {
      status: res.status,
      code: body?.errors?.[0]?.code ?? 0,
    });
  }

  if (body && body.success === false) {
    throw new ApiError(messageFrom(body, "So'rov muvaffaqiyatsiz"), {
      status: res.status,
      code: body?.errors?.[0]?.code ?? 0,
    });
  }

  return body?.data ?? null;
}

export function apiGet(path, options) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiJson(path, method, payload, options) {
  return apiRequest(path, {
    ...options,
    method,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    body: JSON.stringify(payload),
  });
}

/**
 * PostController.createPost() da @RequestBody yo'q — Spring uni
 * model attribute sifatida bind qiladi. Shuning uchun JSON emas,
 * form-urlencoded yuborishimiz kerak.
 */
export function apiForm(path, method, params, options) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) || value instanceof Set) {
      for (const item of value) search.append(key, item);
    } else {
      search.append(key, value);
    }
  }
  return apiRequest(path, {
    ...options,
    method,
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...(options?.headers || {}) },
    body: search.toString(),
  });
}

/** Himoyalangan faylni Blob sifatida olish (rasm ko'rsatish uchun). */
export async function apiBlob(path, options = {}) {
  const res = await run(path, options);
  if (!res.ok) {
    throw new ApiError(`Fayl yuklanmadi (${res.status})`, { status: res.status });
  }
  return res.blob();
}
