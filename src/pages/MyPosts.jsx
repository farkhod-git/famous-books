import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle, Eye, Heart, MessageCircle, Star, BookOpen, ToggleLeft, ToggleRight,
  ChevronLeft, Loader, ImageOff, Info, Pencil,
} from "lucide-react";
import AuthImage from "../components/AuthImage";
import BookDetail from "../components/BookDetail";
import EditPostModal from "../components/EditPostModal";
import { coverIdOf } from "../lib/post";
import { getMyPosts, changeActive } from "../api/posts";
import { useLikes } from "../hooks/useLikes";
import { formatCount, formatRelative } from "../lib/format";
import { genreLabel } from "../lib/genres";

export default function MyPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [editing, setEditing] = useState(null);
  const { like } = useLikes(setPosts);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getMyPosts();
        if (alive) setPosts([...(data || [])].sort((a, b) => b.id - a.id));
      } catch (err) {
        if (alive) setError(err.message || "Postlar yuklanmadi");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleToggleActive(post) {
    setToggling(post.id);
    try {
      const updated = await changeActive(post.id, !post.active);
      setPosts((prev) => prev.map((item) => (item.id === post.id ? updated : item)));
    } catch (err) {
      setError(err.message || "Holatni o'zgartirib bo'lmadi");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="myposts-page">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <ChevronLeft size={18} /> Asosiy sahifa
      </button>

      <header className="myposts-header">
        <h1 className="myposts-title">Mening postlarim</h1>
        <p className="myposts-subtitle">{posts.length} ta post joylangan</p>
      </header>

      <p className="notice">
        <Info size={15} />
        <span>
          GET /posts/my faqat faol postlarni qaytaradi, shuning uchun nofaol
          qilingan post sahifa yangilangandan keyin bu ro'yxatdan yo'qoladi.
          Postni tahrirlash va o'chirish endpointlari hali yo'q.
        </span>
      </p>

      {loading && (
        <p className="page-state">
          <Loader size={18} className="spin" /> Yuklanmoqda...
        </p>
      )}

      {!loading && error && <p className="page-state page-error">{error}</p>}

      {!loading && posts.length === 0 && (
        <div className="myposts-empty">
          <BookOpen size={48} />
          <p>Hali post qo'yilmagan</p>
          <button className="btn-add-post" onClick={() => navigate("/add-book")}>
            <PlusCircle size={16} /> Post qo'shish
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className="myposts-list">
          {posts.map((post) => (
            <article key={post.id} className={`mypost-card ${post.active ? "" : "mypost-inactive"}`}>
              <div className="mypost-cover" onClick={() => setOpenId(post.id)}>
                <AuthImage
                  attachmentId={coverIdOf(post)}
                  alt={post.bookName}
                  className="mypost-img"
                  fallback={<div className="cover-missing"><ImageOff size={20} /></div>}
                />
                {!post.active && <span className="mypost-inactive-badge">Nofaol</span>}
              </div>

              <div className="mypost-body">
                <div className="mypost-top">
                  <div className="mypost-info">
                    {post.genre && <span className="mypost-genre">{genreLabel(post.genre)}</span>}
                    <h3 className="mypost-title-text" onClick={() => setOpenId(post.id)}>
                      {post.bookName}
                    </h3>
                    <p className="mypost-author">
                      {[post.author, post.pages && `${post.pages} bet`, post.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="mypost-actions">
                    <button
                      type="button"
                      className="mypost-edit"
                      onClick={() => setEditing(post)}
                      title="Tahrirlash"
                    >
                      <Pencil size={15} /> Tahrirlash
                    </button>

                    <button
                      type="button"
                      className={`mypost-toggle ${post.active ? "toggle-on" : "toggle-off"}`}
                      onClick={() => handleToggleActive(post)}
                      disabled={toggling === post.id}
                      title={post.active ? "Nofaol qilish" : "Faollashtirish"}
                    >
                      {toggling === post.id ? (
                        <Loader size={16} className="spin" />
                      ) : post.active ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                      {post.active ? "Faol" : "Nofaol"}
                    </button>
                  </div>
                </div>

                <div className="mypost-stars">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Star
                      key={score}
                      size={14}
                      fill={score <= post.readerScore ? "#f59e0b" : "none"}
                      color={score <= post.readerScore ? "#f59e0b" : "var(--border)"}
                    />
                  ))}
                  <span className="mypost-rating-num">{post.readerScore}</span>
                </div>

                {post.opinion && <p className="mypost-review">“{post.opinion}”</p>}

                <div className="mypost-stats">
                  <span><Eye size={13} /> {formatCount(post.views)}</span>
                  <span><Heart size={13} /> {formatCount(post.likes)}</span>
                  <span><MessageCircle size={13} /> {formatCount(post.comments)}</span>
                  <span className="mypost-date">{formatRelative(post.createdAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <EditPostModal
          post={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) =>
            setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
          }
        />
      )}

      {openId && (
        <BookDetail
          postId={openId}
          initialPost={posts.find((post) => post.id === openId)}
          liked={posts.find((post) => post.id === openId)?.liked}
          onClose={() => setOpenId(null)}
          onLike={like}
        />
      )}
    </div>
  );
}
