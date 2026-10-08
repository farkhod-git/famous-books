import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./auth-context";
import * as authApi from "../api/auth";
import * as usersApi from "../api/users";
import {
  getAccessToken, saveTokens, clearTokens, getStoredProfile, saveProfile,
} from "../lib/tokenStore";
import { readProfileFromToken, isTokenExpired } from "../lib/jwt";
import { onSessionExpired } from "../lib/http";

/* Token localStorage da — profil renderdan oldin sinxron o'qiladi,
   shuning uchun "yuklanmoqda" holati kerak emas. */
function initialUser() {
  const token = getAccessToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearTokens();
    return null;
  }
  /* Saqlangan profil tokendagidan yangiroq (profil tahrirlangan bo'lishi
     mumkin), shuning uchun avval o'shanga qaraymiz. */
  return getStoredProfile() || readProfileFromToken(token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    onSessionExpired(() => setUser(null));
    return () => onSessionExpired(null);
  }, []);

  /* Saqlangan profil bo'lmasa (masalan OAuth2 orqali kirilgan), uni
     backenddan bir marta olib kelamiz. */
  useEffect(() => {
    if (!getAccessToken() || getStoredProfile()) return;

    let alive = true;
    usersApi
      .getMe()
      .then((profile) => {
        if (!alive || !profile) return;
        saveProfile(profile);
        setUser(profile);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const applyTokens = useCallback((tokens) => {
    saveTokens(tokens);
    const profile = readProfileFromToken(tokens.accessToken);
    saveProfile(profile);
    setUser(profile);
    return profile;
  }, []);

  const login = useCallback(
    async (credentials) => applyTokens(await authApi.login(credentials)),
    [applyTokens]
  );

  const confirm = useCallback(
    async (payload) => applyTokens(await authApi.confirm(payload)),
    [applyTokens]
  );

  const register = useCallback((payload) => authApi.register(payload), []);

  /* PUT /users/me javobi bazadagi eng so'nggi holat — o'shani saqlaymiz. */
  const updateProfile = useCallback(async (payload) => {
    const profile = await usersApi.updateMe(payload);
    saveProfile(profile);
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      login,
      register,
      confirm,
      logout,
      updateProfile,
    }),
    [user, login, register, confirm, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
