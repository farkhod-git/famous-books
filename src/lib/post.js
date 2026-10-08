/**
 * Ro'yxat endpointlari (GET /posts, GET /posts/my) muqovani faqat
 * `coverId` sifatida qaytaradi, `cover` esa null bo'ladi.
 * GET /posts/{id} esa to'liq `cover` obyektini beradi.
 * Shuning uchun ikkalasini ham qo'llab-quvvatlaymiz.
 */
export function coverIdOf(post) {
  return post?.coverId || post?.cover?.id || null;
}

/**
 * Sahifa meta ma'lumoti ikki xil shaklda kelishi mumkin:
 *   Page       -> { content, number, totalPages, ... }
 *   PagedModel -> { content, page: { number, totalPages, ... } }
 * Ikkalasini bir xil ko'rinishga keltiramiz.
 */
export function readPage(data, fallbackPage = 0) {
  const meta = data?.page && typeof data.page === "object" ? data.page : data;

  return {
    items: data?.content || [],
    number: meta?.number ?? fallbackPage,
    totalPages: meta?.totalPages ?? 0,
    totalElements: meta?.totalElements ?? 0,
  };
}
