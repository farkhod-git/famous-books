import { useState, useEffect, useMemo, useRef } from "react";
import { X, Save, Loader, Star, ImagePlus, Trash2, Upload, Undo2 } from "lucide-react";
import AuthImage from "./AuthImage";
import { getPost, updatePost, updatePhotos } from "../api/posts";
import { uploadFile } from "../api/attachments";
import { coverIdOf } from "../lib/post";
import { GENRES } from "../lib/genres";

export default function EditPostModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    bookName: post.bookName || "",
    author: post.author || "",
    opinion: post.opinion || "",
    pages: post.pages || "",
    year: post.year || "",
    genre: post.genre || "",
    readerScore: post.readerScore || 0,
  });

  const [coverId, setCoverId] = useState(coverIdOf(post));
  const [coverFile, setCoverFile] = useState(null);
  const [photos, setPhotos] = useState([]);       // mavjud rasmlar (AttachmentDto)
  const [newFiles, setNewFiles] = useState([]);   // yangi tanlangan fayllar
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const coverInputRef = useRef(null);
  const [hoverScore, setHoverScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Rasmlar faqat GET /posts/{id} da keladi, ro'yxatda bo'lmaydi. */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const full = await getPost(post.id);
        if (!alive) return;
        setPhotos(full.photos || []);
        setCoverId(coverIdOf(full) || coverIdOf(post));
      } catch {
        /* rasmlarsiz ham tahrirlash mumkin */
      } finally {
        if (alive) setLoadingPhotos(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [post]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );

  useEffect(() => {
    if (!coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  );

  useEffect(() => {
    return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
  }, [previews]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.bookName.trim() || form.readerScore < 1 || saving) return;

    setSaving(true);
    setError("");

    try {
      const finalCoverId = coverFile ? (await uploadFile(coverFile)).id : coverId;

      const updated = await updatePost(post.id, {
        bookName: form.bookName.trim(),
        author: form.author.trim() || null,
        opinion: form.opinion.trim() || null,
        pages: form.pages ? Number(form.pages) : null,
        year: form.year ? Number(form.year) : null,
        genre: form.genre || null,
        readerScore: form.readerScore,
        coverId: finalCoverId,
      });

      /* Rasmlar o'zgargan bo'lsa, yakuniy ro'yxatni yuboramiz. */
      const keptIds = photos.map((photo) => photo.id);
      const originalIds = (post.photos || []).map((photo) => photo.id);
      const changed =
        newFiles.length > 0 ||
        keptIds.length !== originalIds.length ||
        keptIds.some((id) => !originalIds.includes(id));

      let result = updated;
      if (changed) {
        const uploaded = [];
        for (const file of newFiles) {
          uploaded.push((await uploadFile(file)).id);
        }
        result = await updatePhotos(post.id, [...keptIds, ...uploaded]);
      }

      onSaved({ ...post, ...updated, ...result });
      onClose();
    } catch (err) {
      setError(err.message || "O'zgarishlar saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  const activeScore = hoverScore || form.readerScore;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="edit-modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <header className="edit-modal-header">
          <h3>Postni tahrirlash</h3>
          <button type="button" className="modal-close" onClick={onClose} title="Yopish">
            <X size={18} />
          </button>
        </header>

        <div className="edit-modal-scroll">
          <div className="edit-cover-row">
            {coverPreview ? (
              <img src={coverPreview} alt="Yangi muqova" className="edit-cover-img" />
            ) : (
              <AuthImage attachmentId={coverId} alt="" className="edit-cover-img" />
            )}

            <div className="edit-cover-actions">
              <span className="edit-cover-label">Muqova</span>

              <button
                type="button"
                className="file-remove"
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload size={14} /> Boshqa rasm
              </button>

              {coverFile && (
                <button type="button" className="file-remove" onClick={() => setCoverFile(null)}>
                  <Undo2 size={14} /> Eskisini qaytarish
                </button>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  setCoverFile(event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-bookName">Kitob nomi *</label>
            <input
              id="edit-bookName"
              value={form.bookName}
              onChange={(event) => setField("bookName", event.target.value)}
              required
            />
          </div>

          <div className="field-row">
            <div className="form-group">
              <label htmlFor="edit-author">Muallif</label>
              <input
                id="edit-author"
                value={form.author}
                onChange={(event) => setField("author", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-genre">Janr</label>
              <select
                id="edit-genre"
                value={form.genre}
                onChange={(event) => setField("genre", event.target.value)}
              >
                <option value="">Tanlanmagan</option>
                {GENRES.map((genre) => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="form-group">
              <label htmlFor="edit-pages">Betlar soni</label>
              <input
                id="edit-pages"
                type="number"
                min="1"
                value={form.pages}
                onChange={(event) => setField("pages", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-year">Nashr yili</label>
              <input
                id="edit-year"
                type="number"
                min="1"
                max="32767"
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Baho *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`star-btn ${score <= activeScore ? "active" : ""}`}
                  onMouseEnter={() => setHoverScore(score)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setField("readerScore", score)}
                  aria-label={`${score} yulduz`}
                >
                  <Star size={24} fill={score <= activeScore ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-opinion">Fikringiz</label>
            <textarea
              id="edit-opinion"
              rows={4}
              maxLength={500}
              value={form.opinion}
              onChange={(event) => setField("opinion", event.target.value)}
            />
            <span className="char-count">{form.opinion.length}/500</span>
          </div>

          {/* QO'SHIMCHA RASMLAR */}
          <div className="form-group">
            <label>Qo'shimcha rasmlar</label>

            {loadingPhotos ? (
              <p className="comments-state">
                <Loader size={14} className="spin" /> Rasmlar yuklanmoqda...
              </p>
            ) : (
              <div className="edit-photos">
                {photos.map((photo) => (
                  <div key={photo.id} className="edit-photo">
                    <AuthImage attachmentId={photo.id} alt="" className="edit-photo-img" />
                    <button
                      type="button"
                      className="edit-photo-remove"
                      title="O'chirish"
                      onClick={() => setPhotos((prev) => prev.filter((item) => item.id !== photo.id))}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {previews.map((item, index) => (
                  <div key={item.url} className="edit-photo edit-photo-new">
                    <img src={item.url} alt="" className="edit-photo-img" />
                    <button
                      type="button"
                      className="edit-photo-remove"
                      title="Bekor qilish"
                      onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X size={13} />
                    </button>
                    <span className="edit-photo-badge">yangi</span>
                  </div>
                ))}

                {photos.length + newFiles.length < 6 && (
                  <label className="edit-photo-add">
                    <ImagePlus size={18} />
                    <span>Qo'shish</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(event) => {
                        /* Fayllarni oldin o'qib olamiz: value ni tozalash
                           input.files ni ham bo'shatadi, setState esa
                           keyinroq ishlaydi. */
                        const picked = Array.from(event.target.files || []);
                        event.target.value = "";
                        setNewFiles((prev) => [...prev, ...picked].slice(0, 6));
                      }}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}
        </div>

        <footer className="edit-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={saving || !form.bookName.trim() || form.readerScore < 1}
          >
            {saving ? (
              <><Loader size={16} className="spin" /> Saqlanmoqda...</>
            ) : (
              <><Save size={16} /> Saqlash</>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
