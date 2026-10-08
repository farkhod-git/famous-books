import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Loader, RefreshCw, ListCollapse, ListTree } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentComposer from "./CommentComposer";
import { getComments, createComment, deleteComment } from "../api/comments";
import { useAuth } from "../hooks/useAuth";
import {
  normalizeComments, insertComment, markDeleted, countComments, collectParentIds,
} from "../lib/commentTree";

const PAGE_SIZE = 20;

export default function CommentSection({ postId, onCountChange }) {
  const { user } = useAuth();
  const [tree, setTree] = useState([]);
  const [size, setSize] = useState(PAGE_SIZE);
  const [rootCount, setRootCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const apply = useCallback((normalized) => {
    setTree(normalized);
    setRootCount(normalized.length);
    onCountChangeRef.current?.(countComments(normalized));
  }, []);

  /* Boshlang'ich yuklash: birinchi setState await dan keyin bajariladi. */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getComments(postId, { size: PAGE_SIZE });
        if (alive) apply(normalizeComments(data));
      } catch (err) {
        if (alive) setError(err.message || "Izohlar yuklanmadi");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [postId, apply]);

  /* Foydalanuvchi bosganda qayta yuklash (effekt emas — setState erkin). */
  async function reload(nextSize, { spinner = true } = {}) {
    if (spinner) setLoading(true);
    setError("");
    try {
      apply(normalizeComments(await getComments(postId, { size: nextSize })));
    } catch (err) {
      setError(err.message || "Izohlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(content, replyCommentId = null) {
    const created = await createComment(postId, { content, replyCommentId });

    /* POST javobida createdBy va replies bo'sh keladi — joyida to'ldiramiz. */
    const node = {
      ...created,
      createdBy: created.createdBy || user,
      createdAt: created.createdAt || new Date().toISOString(),
      replyCommentId,
      replies: [],
    };

    setTree((prev) => {
      const next = insertComment(prev, replyCommentId, node);
      onCountChangeRef.current?.(countComments(next));
      return next;
    });
  }

  /** present berilmasa — almashtiradi. */
  function toggleCollapse(id, present) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      const hide = present === undefined ? !next.has(id) : !present;
      if (hide) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const parentIds = collectParentIds(tree);
  const allCollapsed = parentIds.length > 0 && parentIds.every((id) => collapsed.has(id));

  function toggleAll() {
    setCollapsed(allCollapsed ? new Set() : new Set(parentIds));
  }

  async function handleDelete(commentId) {
    await deleteComment(postId, commentId);

    /* Backend soft delete qiladi — izoh o'rnida turadi, javoblari saqlanadi. */
    setTree((prev) => {
      const next = markDeleted(prev, commentId);
      onCountChangeRef.current?.(countComments(next));
      return next;
    });
  }

  const total = countComments(tree);
  const mayHaveMore = rootCount >= size;

  return (
    <section className="comments">
      <header className="comments-head">
        <h3>
          <MessageCircle size={16} /> Izohlar
          {total > 0 && <span className="comments-count">{total}</span>}
        </h3>
        <div className="comments-tools">
          {parentIds.length > 0 && (
            <button
              type="button"
              className="comments-collapse"
              onClick={toggleAll}
              title={allCollapsed ? "Barcha javoblarni ochish" : "Barcha javoblarni yig'ish"}
            >
              {allCollapsed ? <ListTree size={14} /> : <ListCollapse size={14} />}
              {allCollapsed ? "Hammasini ochish" : "Hammasini yig'ish"}
            </button>
          )}

          <button
            type="button"
            className="comments-refresh"
            onClick={() => reload(size, { spinner: false })}
            title="Yangilash"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <CommentComposer
        placeholder="Bu kitob haqida fikringizni yozing..."
        onSubmit={(content) => handleCreate(content, null)}
      />

      {loading && (
        <p className="comments-state">
          <Loader size={15} className="spin" /> Yuklanmoqda...
        </p>
      )}

      {!loading && error && (
        <p className="comments-state comments-error">
          {error}{" "}
          <button type="button" onClick={() => reload(size)}>
            Qayta urinish
          </button>
        </p>
      )}

      {!loading && !error && tree.length === 0 && (
        <p className="comments-state">Hali izoh yo'q — birinchi bo'lib yozing.</p>
      )}

      {tree.length > 0 && (
        <ul className="comment-list">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              onReply={(parentId, content) => handleCreate(content, parentId)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {!loading && mayHaveMore && (
        <button
          type="button"
          className="comments-more"
          onClick={() => {
            const next = size + PAGE_SIZE;
            setSize(next);
            reload(next);
          }}
        >
          Ko'proq izohlarni ko'rsatish
        </button>
      )}
    </section>
  );
}
