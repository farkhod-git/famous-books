import { apiRequest, apiBlob } from "../lib/http";
import { API_BASE_URL } from "../lib/config";

/** Backend fayl nomini [a-zA-Z0-9-._]+ ga tekshiradi, shuning uchun tozalaymiz. */
function safeName(name) {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).replace(/[^a-zA-Z0-9]/g, "") : "bin";
  /* Asl nomni saqlab qolamiz — kitob fayli shu nom bilan yuklab olinadi. */
  const base = (dot > -1 ? name.slice(0, dot) : name)
    .replace(/[^a-zA-Z0-9-._]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);
  return `${base ? `${base}-` : ""}${Date.now()}.${ext || "bin"}`;
}

export function uploadFile(file) {
  const form = new FormData();
  form.append("file", file, safeName(file.name || "file.bin"));
  return apiRequest("/attachments/upload", { method: "POST", body: form });
}

/** download=true bo'lsa backend Content-Disposition: attachment qaytaradi. */
export function downloadUrl(id, { download = false } = {}) {
  return `${API_BASE_URL}/attachments/download/${id}?attachmentDownload=${download}`;
}

export function fetchAttachmentBlob(id, options) {
  return apiBlob(`/attachments/download/${id}?attachmentDownload=false`, options);
}
