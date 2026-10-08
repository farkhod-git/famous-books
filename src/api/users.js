import { apiGet, apiJson } from "../lib/http";

export function getMe() {
  return apiGet("/users/me");
}

export function updateMe(profile) {
  return apiJson("/users/me", "PUT", profile);
}
