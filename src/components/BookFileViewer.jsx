import { useState, useEffect } from "react";
import { X, Download, Loader, FileWarning } from "lucide-react";
import { downloadUrl, fetchAttachmentBlob } from "../api/attachments";
import { formatFileSize } from "../lib/format";

/*
 * Kitobni saytdan chiqmasdan o'qish uchun oyna.
 *
 * Faylni blob qilib olamiz: shunda PDF ni brauzerning o'z ko'ruvchisiga
 * <iframe> orqali berib yuborsa bo'ladi, TXT ni esa o'zimiz chiqaramiz.
 * Qolgan formatlar (EPUB, FB2, DJVU, MOBI) brauzerda ochilmaydi — ularni
 * yuklab olish tavsiya qilinadi.
 */
function kindOf(blob, name = "") {
  const type = blob.type || "";
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();

  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("text/") || ext === "txt") return "text";
  return "other";
}

export default function BookFileViewer({ attachmentId, title, onClose }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    let objectUrl = null;

    (async () => {
      try {
        const blob = await fetchAttachmentBlob(attachmentId);
        const kind = kindOf(blob, title);

        if (kind === "text") {
          const text = await blob.text();
          if (!alive) return;
          setState({ status: "ready", kind, text, size: blob.size });
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        if (!alive) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setState({ status: "ready", kind, url: objectUrl, size: blob.size });
      } catch (err) {
        if (alive) setState({ status: "error", message: err.message || "Fayl yuklanmadi" });
      }
    })();

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachmentId, title]);

  /* Escape faqat shu oynani yopadi — ortidagi post oynasi ochiq qoladi. */
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="modal-overlay reader-overlay" onClick={onClose}>
      <div className="reader" onClick={(event) => event.stopPropagation()}>
        <header className="reader-header">
          <h3 className="reader-title">{title || "Kitob"}</h3>

          <div className="reader-actions">
            {state.status === "ready" && (
              <span className="reader-size">{formatFileSize(state.size)}</span>
            )}
            <a
              className="book-file-link"
              href={downloadUrl(attachmentId, { download: true })}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={14} /> Yuklab olish
            </a>
            <button type="button" className="modal-close static" onClick={onClose} title="Yopish">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="reader-body">
          {state.status === "loading" && (
            <p className="modal-state">
              <Loader size={18} className="spin" /> Kitob yuklanmoqda...
            </p>
          )}

          {state.status === "error" && (
            <p className="modal-state modal-error">{state.message}</p>
          )}

          {state.status === "ready" && state.kind === "pdf" && (
            <iframe src={state.url} title={title || "Kitob"} className="reader-frame" />
          )}

          {state.status === "ready" && state.kind === "text" && (
            <pre className="reader-text">{state.text}</pre>
          )}

          {state.status === "ready" && state.kind === "other" && (
            <div className="reader-unsupported">
              <FileWarning size={30} />
              <p>Bu format brauzerda ochilmaydi.</p>
              <a
                className="book-file-link"
                href={downloadUrl(attachmentId, { download: true })}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={15} /> Faylni yuklab olish
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
