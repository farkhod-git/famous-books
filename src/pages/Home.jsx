import { useState, useEffect } from "react";
import { TrendingUp, Clock, Heart, Search, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "../components/BookCard";
import BookDetail from "../components/BookDetail";
import { getPosts } from "../api/posts";
import { readPage } from "../lib/post";
import { useLikes } from "../hooks/useLikes";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 400;

const TABS = [
  { type: "NEW", label: "Yangi", Icon: Clock },
  { type: "FAMOUS", label: "Mashhur", Icon: TrendingUp },
  { type: "LIKED", label: "Yoqtirganlarim", Icon: Heart },
];

export default function Home() {
  /* Serverga yuboriladigan so'rov — o'zgarishi bilan qayta yuklanadi. */
  const [query, setQuery] = useState({ page: 0, searchType: "NEW", search: "" });
  const [searchInput, setSearchInput] = useState("");

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ number: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const { like } = useLikes(setPosts);

  /* Yozilayotgan matnni biroz kutib, keyin so'rovga qo'yamiz. */
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((prev) =>
        prev.search === searchInput.trim() ? prev : { ...prev, page: 0, search: searchInput.trim() }
      );
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getPosts({ ...query, size: PAGE_SIZE });
        if (!alive) return;
        const page = readPage(data, query.page);
        setPosts(page.items);
        setMeta({ number: page.number, totalPages: page.totalPages });
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Postlar yuklanmadi");
        setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query]);

  function update(patch) {
    setLoading(true);
    setQuery((prev) => ({ ...prev, ...patch }));
  }

  /*
   * Saralash va qidiruv serverda bajariladi (search + searchType), shuning
   * uchun bu yerda qayta filtrlamaymiz — server so'zlar bo'yicha qidiradi
   * ("new spring" -> "new" yoki "spring"), mijoz tomonidagi oddiy substring
   * filtri esa aynan shunday natijalarni noto'g'ri o'chirib yuboradi.
   */
  const openPost = posts.find((post) => post.id === openId);

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">Mashhur Kitoblar</h1>
        <p className="home-subtitle">Kitobxonlar tomonidan tavsiya etilgan eng yaxshi asarlar</p>

        <div className="home-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="search"
              placeholder="Kitob yoki muallif qidiring..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="sort-tabs">
            {TABS.map(({ type, label, Icon }) => (
              <button
                key={type}
                className={query.searchType === type ? "sort-tab active" : "sort-tab"}
                onClick={() => update({ searchType: type, page: 0 })}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading && (
        <p className="page-state">
          <Loader size={18} className="spin" /> Yuklanmoqda...
        </p>
      )}

      {!loading && error && (
        <p className="page-state page-error">
          {error}{" "}
          <button type="button" onClick={() => update({})}>
            Qayta urinish
          </button>
        </p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="page-state">
          {query.search
            ? "Hech narsa topilmadi"
            : query.searchType === "LIKED"
              ? "Hali birorta postni yoqtirmagansiz."
              : "Hali post yo'q — birinchi postni siz joylang."}
        </p>
      )}

      {!loading && posts.length > 0 && (
        <div className="books-grid">
          {posts.map((post) => (
            <BookCard
              key={post.id}
              post={post}
              liked={post.liked}
              onOpen={() => setOpenId(post.id)}
              onLike={like}
            />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <nav className="pager">
          <button
            disabled={meta.number === 0 || loading}
            onClick={() => update({ page: meta.number - 1 })}
          >
            <ChevronLeft size={16} /> Oldingi
          </button>
          <span>
            {meta.number + 1} / {meta.totalPages}
          </span>
          <button
            disabled={meta.number + 1 >= meta.totalPages || loading}
            onClick={() => update({ page: meta.number + 1 })}
          >
            Keyingi <ChevronRight size={16} />
          </button>
        </nav>
      )}

      {openId && (
        <BookDetail
          postId={openId}
          initialPost={openPost}
          liked={openPost?.liked}
          onClose={() => setOpenId(null)}
          onLike={like}
          onStats={(fresh) =>
            setPosts((prev) =>
              prev.map((item) => (item.id === fresh.id ? { ...item, views: fresh.views } : item))
            )
          }
        />
      )}
    </div>
  );
}
