import { apiGet, apiJson, apiRequest } from "../lib/http";

/**
 * Backend ildiz izohlarni `id <= lastCommentId` bo'yicha `limit size` bilan
 * oladi va butun javob daraxtini (replies) rekursiv qaytaradi.
 * Kursor bilan oldinga varaqlash ishlamaydi (so'rov `<=` ishlatadi),
 * shuning uchun "ko'proq ko'rsatish" uchun size ni oshiramiz.
 */
export function getComments(postId, { size = 20, lastCommentId } = {}) {
  const query = new URLSearchParams({ size });
  if (lastCommentId != null) query.set("lastCommentId", lastCommentId);
  return apiGet(`/posts/${postId}/comments?${query}`);
}

export function createComment(postId, { content, replyCommentId, fileId }) {
  return apiJson(`/posts/${postId}/comments`, "POST", {
    content,
    ...(replyCommentId ? { replyCommentId } : {}),
    ...(fileId ? { fileId } : {}),
  });
}

/** Faqat o'z izohini o'chirish mumkin (backend 404 qaytaradi aks holda). */
export function deleteComment(postId, commentId) {
  return apiRequest(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
}
