import { apiGet, apiForm, apiJson, apiRequest } from "../lib/http";

/** searchType: "NEW" — yangilari, "FAMOUS" — mashhurlari. */
export function getPosts({ page = 0, size = 20, search = "", searchType } = {}) {
  const query = new URLSearchParams({ page, size });
  if (search) query.set("search", search);
  if (searchType) query.set("searchType", searchType);
  return apiGet(`/posts?${query}`);
}

export function getPost(id) {
  return apiGet(`/posts/${id}`);
}

export function createPost(payload) {
  return apiForm("/posts", "POST", payload);
}

export function getMyPosts() {
  return apiGet("/posts/my");
}

/** liked=true — like bosish, liked=false — like ni olib tashlash. */
export function likePost(id, liked) {
  return apiRequest(`/posts/${id}/likes/${liked}`, { method: "POST" });
}

export function updatePost(id, payload) {
  return apiJson(`/posts/${id}`, "PUT", payload);
}

/**
 * To'liq almashtiradi: qolishi kerak bo'lgan rasm ID larining yakuniy
 * ro'yxati yuboriladi, backend farqini o'zi hal qiladi.
 */
export function updatePhotos(id, photoIds) {
  return apiJson(`/posts/${id}/photos`, "PUT", photoIds);
}

export function changeActive(id, active) {
  return apiRequest(`/posts/${id}/active/${active}`, { method: "PATCH" });
}
