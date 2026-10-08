import { useState, useEffect, useRef } from "react";
import {
  X, Heart, Star, BookOpen, Calendar, Hash, Eye, Loader, ImageOff, MessageCircle,
} from "lucide-react";
import { coverIdOf } from "../lib/post";
import AuthImage from "./AuthImage";
import CommentSection from "./CommentSection";
import { getPost } from "../api/posts";
import { formatCount, formatDateTime } from "../lib/format";
import { genreLabel } from "../lib/genres";

export default function BookDetail({ postId, initialPost, liked, onClose, onLike, onStats }) {
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState("");
  const [commentCount, setCommentCount] = useState(initialPost?.comments ?? 0);

  /* So'rov kelgunicha ro'yxatdagi holatni ko'rsatamiz. */
  const isLiked = post?.liked ?? liked;

  /* onStats har renderda yangi funksiya bo'lishi mumkin — uni dependency
     ro'yxatiga qo'shsak, qayta-qayta so'rov yuborilib ketadi. */
  const onStatsRef = useRef(onStats);
  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    let alive = true;

    /* GET /posts/{id} ko'rishlar sonini oshiradi va photos ni ham qaytaradi. */
    (async () => {
      try {
        const data = await getPost(postId);
        if (!alive) return;
        setPost(data);
        setCommentCount(data.comments ?? 0);
        onStatsRef.current?.(data);
      } catch (err) {
        if (alive) setError(err.message || "Post yuklanmadi");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [postId]);

  /* Modal postning o'z nusxasini saqlaydi, shuning uchun like holatini
     shu yerda ham optimistik yangilab, xato bo'lsa qaytaramiz. */
  function applyLike(nextLiked) {
    setPost((prev) => ({
      ...prev,
      liked: nextLiked,
      likes: Math.max(0, (prev.likes || 0) + (nextLiked ? 1 : -1)),
    }));
  }

  async function handleLike() {
    if (!post) return;
    const nextLiked = !isLiked;

    applyLike(nextLiked);
    const accepted = await onLike(post);
    if (!accepted) applyLike(!nextLiked);
  }

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Yopish">
          <X size={20} />
        </button>

        {loading && !post && (
          <p className="modal-state">
            <Loader size={18} className="spin" /> Yuklanmoqda...
          </p>
        )}

        {error && !post && <p className="modal-state modal-error">{error}</p>}

        {post && (
          <div className="modal-content">
            <aside className="modal-left">
              <AuthImage
                attachmentId={coverIdOf(post)}
                alt={post.bookName}
                className="modal-cover"
                fallback={
                  <div className="cover-missing large">
                    <ImageOff size={30} />
                    <span>Muqova yuklanmadi</span>
                  </div>
                }
              />

              <dl className="modal-stats">
                {post.pages && (
                  <div className="stat">
                    <BookOpen size={16} /> <span>{post.pages} bet</span>
                  </div>
                )}
                {post.year && (
                  <div className="stat">
                    <Calendar size={16} /> <span>{post.year}-yil</span>
                  </div>
                )}
                {post.genre && (
                  <div className="stat">
                    <Hash size={16} /> <span>{genreLabel(post.genre)}</span>
                  </div>
                )}
                <div className="stat">
                  <Eye size={16} /> <span>{formatCount(post.views)} ko'rish</span>
                </div>
                <div className="stat">
                  <MessageCircle size={16} /> <span>{formatCount(commentCount)} izoh</span>
                </div>
                <div className="stat">
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>{post.readerScore} / 5</span>
                </div>
              </dl>

              <button
                type="button"
                className={`btn-like-big ${isLiked ? "liked" : ""}`}
                onClick={handleLike}
                title={isLiked ? "Like ni olib tashlash" : "Like bosish"}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                <span>{formatCount(post.likes)} ta like</span>
              </button>
            </aside>

            <div className="modal-right">
              <h2 className="modal-title">{post.bookName}</h2>
              {post.author && (
                <p className="modal-author">
                  Muallif: <strong>{post.author}</strong>
                </p>
              )}
              <p className="modal-date">{formatDateTime(post.createdAt)} da joylangan</p>

              {post.opinion && <blockquote className="modal-review">“{post.opinion}”</blockquote>}

              {post.photos?.length > 0 && (
                <div className="modal-photos">
                  {post.photos.map((photo) => (
                    <AuthImage
                      key={photo.id}
                      attachmentId={photo.id}
                      alt={photo.originalName || "Rasm"}
                      className="modal-photo"
                    />
                  ))}
                </div>
              )}

              <CommentSection postId={post.id} onCountChange={setCommentCount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
