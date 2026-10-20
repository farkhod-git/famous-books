/**
 * Postga kitobning elektron nusxasi biriktiriladi (CreatePostDto.bookFileId,
 * UpdatePostDto.bookFileId) — fayl avval /attachments/upload ga yuboriladi.
 */
export const BOOK_FILE_EXTENSIONS = ["pdf", "epub", "fb2", "djvu", "mobi", "txt"];

export const BOOK_FILE_ACCEPT = BOOK_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",");

const MAX_SIZE = 50 * 1024 * 1024;

/** Fayl mos bo'lmasa xato matnini, mos bo'lsa null qaytaradi. */
export function checkBookFile(file) {
  const name = file.name || "";
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase() : "";

  if (!BOOK_FILE_EXTENSIONS.includes(ext)) {
    return `Faqat ${BOOK_FILE_EXTENSIONS.join(", ").toUpperCase()} formatidagi fayl biriktirish mumkin.`;
  }
  if (file.size > MAX_SIZE) {
    return "Fayl hajmi 50 MB dan oshmasligi kerak.";
  }
  return null;
}
