function decodePayload(token) {
  const part = token.split(".")[1];
  if (!part) return null;
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json);
}

/**
 * Backend JWT ning `sub` claimiga butun ProfileDto ni JSON string sifatida
 * joylaydi (AbsTokenJWTService.generateToken). Shuning uchun alohida
 * "GET /me" endpoint kerak emas — profilni tokenning o'zidan o'qiymiz.
 */
export function readProfileFromToken(token) {
  if (!token) return null;
  try {
    const payload = decodePayload(token);
    if (!payload?.sub) return null;
    return JSON.parse(payload.sub);
  } catch {
    return null;
  }
}

export function tokenExpiresAt(token) {
  if (!token) return null;
  try {
    const payload = decodePayload(token);
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token, skewMs = 5000) {
  const exp = tokenExpiresAt(token);
  if (!exp) return true;
  return Date.now() + skewMs >= exp;
}
