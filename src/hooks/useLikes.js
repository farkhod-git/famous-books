import { useCallback } from "react";
import { likePost } from "../api/posts";

/**
 * Like holati PostDto.liked da keladi, shuning uchun lokal kesh kerak emas.
 * Bu yerda faqat optimistik yangilash va xato bo'lsa orqaga qaytarish bor.
 *
 * @param setPosts post ro'yxatini yangilovchi setState
 */
export function useLikes(setPosts) {
  const patch = useCallback(
    (postId, liked, delta) =>
      setPosts((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, liked, likes: Math.max(0, (item.likes || 0) + delta) }
            : item
        )
      ),
    [setPosts]
  );

  /** Like ni almashtiradi. true — muvaffaqiyatli, false — xato, holat qaytarildi. */
  const toggle = useCallback(
    async (post) => {
      const nextLiked = !post.liked;
      patch(post.id, nextLiked, nextLiked ? +1 : -1);

      try {
        await likePost(post.id, nextLiked);
        return true;
      } catch {
        patch(post.id, !nextLiked, nextLiked ? -1 : +1);
        return false;
      }
    },
    [patch]
  );

  return { like: toggle };
}
