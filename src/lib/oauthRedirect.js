import { saveTokens } from "./tokenStore";
import { readProfileFromToken } from "./jwt";

const REDIRECT_PATH = "/oauth2-success";

/**
 * Backend OAuth2 dan keyin shu manzilga qaytaradi:
 *   /oauth2-success?accessToken=...&refreshToken=...
 *
 * React mount bo'lishidan oldin chaqiriladi: tokenlarni saqlaymiz va
 * manzilni darhol almashtiramiz, shunda ular URL da ham, brauzer tarixida
 * ham qolmaydi va "kirilmoqda" ekrani ko'rinmaydi.
 */
export function consumeOAuthRedirect() {
  if (window.location.pathname !== REDIRECT_PATH) return;

  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const valid = Boolean(accessToken && readProfileFromToken(accessToken));

  if (valid) saveTokens({ accessToken, refreshToken });

  window.history.replaceState({}, "", valid ? "/" : "/login?error=oauth");
}
