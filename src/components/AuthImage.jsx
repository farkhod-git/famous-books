import { useState } from "react";
import { downloadUrl, fetchAttachmentBlob } from "../api/attachments";

/*
 * GET /attachments/download/{id} ochiq endpoint, shuning uchun oddiy <img>
 * yetarli — brauzer o'zi keshlaydi.
 *
 * Eski (himoyalangan) backend hali ishlab turgan bo'lsa so'rov 401 bilan
 * yiqiladi; shunday holatda bir marta token bilan blob qilib olamiz.
 * Backend hamma joyda yangilangach, bu zahira yo'lni olib tashlash mumkin.
 */
const blobCache = new Map();

export default function AuthImage({ attachmentId, alt = "", className = "", fallback = null }) {
  /* { id, url } yoki { id, failed } — faqat xato bo'lganda to'ladi. */
  const [override, setOverride] = useState(null);

  const current = override?.id === attachmentId ? override : null;

  async function handleError() {
    if (!attachmentId) return;

    if (blobCache.has(attachmentId)) {
      setOverride({ id: attachmentId, failed: true });
      return;
    }

    try {
      const url = URL.createObjectURL(await fetchAttachmentBlob(attachmentId));
      blobCache.set(attachmentId, url);
      setOverride({ id: attachmentId, url });
    } catch {
      setOverride({ id: attachmentId, failed: true });
    }
  }

  if (!attachmentId || current?.failed) return fallback;

  const src = current?.url || blobCache.get(attachmentId) || downloadUrl(attachmentId);

  return <img key={attachmentId} src={src} alt={alt} className={className} onError={handleError} />;
}
