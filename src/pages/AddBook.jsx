import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, BookOpen, ChevronLeft, Loader, Star, Upload, X, Sparkles, ImagePlus,
} from "lucide-react";
import { uploadFile } from "../api/attachments";
import { createPost, changeActive } from "../api/posts";
import { GENRES } from "../lib/genres";

const OL_COVER = (id) => `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
const OL_COVER_LARGE = (id) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;

const EMPTY = {
  bookName: "",
  author: "",
  pages: "",
  year: "",
  genre: "",
  readerScore: 0,
  opinion: "",
};

export default function AddBook() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [coverFromSearch, setCoverFromSearch] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);

  const [cover, setCover] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hoverScore, setHoverScore] = useState(0);

  const debounceRef = useRef(null);
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  useEffect(() => {
    if (!coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* Qidiruv faqat yordamchi: maydonlarni oldindan to'ldirib beradi. */
  function handleSearchChange(event) {
    const value = event.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          "https://openlibrary.org/search.json?limit=6&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i&q=" +
            encodeURIComponent(value)
        );
        const data = await res.json();
        setResults(data.docs || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  }

  async function applySuggestion(book) {
    setForm((prev) => ({
      ...prev,
      bookName: book.title || prev.bookName,
      author: book.author_name?.[0] || prev.author,
      pages: book.number_of_pages_median || prev.pages,
      year: book.first_publish_year || prev.year,
    }));
    setResults([]);
    setQuery("");

    /* Topilgan muqovani yuklab, standart muqova qilib qo'yamiz.
       Foydalanuvchi o'zi rasm tanlagan bo'lsa, unga tegmaymiz. */
    if (!book.cover_i || (cover && !coverFromSearch)) return;

    setFetchingCover(true);
    try {
      const res = await fetch(OL_COVER_LARGE(book.cover_i));
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) return;

      const extension = blob.type.split("/")[1] || "jpg";
      setCover(new File([blob], `cover.${extension}`, { type: blob.type }));
      setCoverFromSearch(true);
    } catch {
      /* muqovani qo'lda tanlash mumkin */
    } finally {
      setFetchingCover(false);
    }
  }

  function handlePhotos(event) {
    /* Fayllarni oldin o'qib olamiz: value ni tozalash input.files ni ham
       bo'shatadi, setState esa keyinroq ishlaydi. */
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    setPhotos((prev) => [...prev, ...picked].slice(0, 6));
  }

  const canSubmit =
    form.bookName.trim() && form.readerScore > 0 && cover && !submitting;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const coverAttachment = await uploadFile(cover);

      const photoIds = [];
      for (const photo of photos) {
        const uploaded = await uploadFile(photo);
        photoIds.push(uploaded.id);
      }

      const created = await createPost({
        bookName: form.bookName.trim(),
        author: form.author.trim(),
        opinion: form.opinion.trim(),
        pages: form.pages || undefined,
        year: form.year || undefined,
        genre: form.genre || undefined,
        readerScore: form.readerScore,
        coverId: coverAttachment.id,
        photoIds,
      });

      /* Backend postni active=false holatida yaratadi va feed faqat
         active=true larni ko'rsatadi — shuning uchun darhol faollashtiramiz. */
      if (created?.active === false) {
        try {
          await changeActive(created.id, true);
        } catch {
          /* feedda ko'rinmasa ham post yaratildi */
        }
      }

      navigate("/my-posts");
    } catch (err) {
      setError(err.message || "Post joylanmadi");
    } finally {
      setSubmitting(false);
    }
  }

  const activeScore = hoverScore || form.readerScore;

  return (
    <div className="add-book-page">
      <div className="add-book-container">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Orqaga
        </button>

        <h1 className="add-book-title">Kitob qo'shish</h1>
        <p className="add-book-subtitle">
          Barcha maydonlarni qo'lda kiritasiz. Qidiruv faqat maydonlarni tezroq
          to'ldirish uchun yordam beradi.
        </p>

        {/* YORDAMCHI QIDIRUV */}
        <div className="suggest-box">
          <div className="suggest-label">
            <Sparkles size={14} /> Avtomatik to'ldirish (ixtiyoriy)
          </div>
          <div className="book-search-wrapper">
            <div className="book-search-box">
              {searching ? <Loader size={16} className="spin" /> : <Search size={16} />}
              <input
                type="text"
                placeholder="Kitob nomini yozib, taklifni tanlang..."
                value={query}
                onChange={handleSearchChange}
              />
            </div>

            {results.length > 0 && (
              <ul className="search-results">
                {results.map((book) => (
                  <li key={book.key} className="search-result-item" onClick={() => applySuggestion(book)}>
                    <div className="search-result-cover">
                      {book.cover_i ? (
                        <img src={OL_COVER(book.cover_i)} alt="" />
                      ) : (
                        <div className="no-cover"><BookOpen size={18} /></div>
                      )}
                    </div>
                    <div className="search-result-info">
                      <span className="search-result-title">{book.title}</span>
                      <span className="search-result-meta">
                        {[book.author_name?.[0], book.first_publish_year].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bookName">Kitob nomi *</label>
            <input
              id="bookName"
              value={form.bookName}
              onChange={(event) => setField("bookName", event.target.value)}
              placeholder="Masalan: Atoqli Getsbi"
              required
            />
          </div>

          <div className="field-row">
            <div className="form-group">
              <label htmlFor="author">Muallif</label>
              <input
                id="author"
                value={form.author}
                onChange={(event) => setField("author", event.target.value)}
                placeholder="Muallif ismi"
                minLength={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="genre">Janr</label>
              <select
                id="genre"
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
              <label htmlFor="pages">Betlar soni</label>
              <input
                id="pages"
                type="number"
                min="1"
                value={form.pages}
                onChange={(event) => setField("pages", event.target.value)}
                placeholder="180"
              />
            </div>
            <div className="form-group">
              <label htmlFor="year">Nashr yili</label>
              <input
                id="year"
                type="number"
                min="1"
                max="32767"
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
                placeholder="1925"
              />
            </div>
          </div>

          {/* MUQOVA */}
          <div className="form-group">
            <label>Muqova rasmi *</label>
            {fetchingCover && (
              <p className="cover-hint">
                <Loader size={14} className="spin" /> Qidiruvdagi muqova yuklanmoqda...
              </p>
            )}

            <div className="file-drop">
              {coverPreview ? (
                <div className="cover-preview">
                  <img src={coverPreview} alt="Muqova" />
                  <div className="cover-preview-actions">
                    {coverFromSearch && <span className="cover-tag">Qidiruvdan olindi</span>}
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <Upload size={14} /> Boshqa rasm
                    </button>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => {
                        setCover(null);
                        setCoverFromSearch(false);
                      }}
                    >
                      <X size={14} /> O'chirish
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="file-pick" onClick={() => coverInputRef.current?.click()}>
                  <Upload size={18} /> Muqova rasmini tanlang
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  setCover(event.target.files?.[0] || null);
                  setCoverFromSearch(false);
                }}
              />
            </div>
          </div>

          {/* QO'SHIMCHA RASMLAR */}
          <div className="form-group">
            <label>Qo'shimcha rasmlar (ixtiyoriy)</label>
            <div className="photo-row">
              {photos.map((photo, index) => (
                <span key={index} className="photo-chip">
                  {photo.name}
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {photos.length < 6 && (
                <button type="button" className="file-pick small" onClick={() => photoInputRef.current?.click()}>
                  <ImagePlus size={15} /> Rasm qo'shish
                </button>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
          </div>

          {/* BAHO */}
          <div className="form-group">
            <label>Baholang *</label>
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
                  <Star size={26} fill={score <= activeScore ? "currentColor" : "none"} />
                </button>
              ))}
              {form.readerScore > 0 && (
                <span className="rating-label">
                  {["", "Yomon", "O'rtacha", "Yaxshi", "Juda yaxshi", "Ajoyib!"][form.readerScore]}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="opinion">Sizning fikringiz</label>
            <textarea
              id="opinion"
              rows={5}
              value={form.opinion}
              onChange={(event) => setField("opinion", event.target.value)}
              placeholder="Bu kitob haqida nima deysiz? Boshqalarga tavsiya qilasizmi?"
              maxLength={500}
            />
            <span className="char-count">{form.opinion.length}/500</span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-submit" disabled={!canSubmit}>
            {submitting ? <><Loader size={16} className="spin" /> Joylanmoqda...</> : "Postni joylash"}
          </button>
        </form>
      </div>
    </div>
  );
}
