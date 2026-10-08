import { apiJson } from "../lib/http";

export function login({ email, password }) {
  return apiJson("/auth/login", "POST", { email, password }, { auth: false });
}

export function register(payload) {
  return apiJson("/auth/register", "POST", payload, { auth: false });
}

export function confirm({ email, code }) {
  return apiJson("/auth/confirm", "PATCH", { email, code }, { auth: false });
}

/** Emailga tasdiqlash kodi yuboradi (parolni tiklash uchun). */
export function forgetPassword({ email }) {
  return apiJson("/auth/password/forget", "PUT", { email }, { auth: false });
}

export function changePassword({ email, code, newPassword, newPrePassword }) {
  return apiJson(
    "/auth/password/change",
    "PUT",
    { email, code, newPassword, newPrePassword },
    { auth: false }
  );
}
