import { useState } from "react";
import {
  Reply, ChevronDown, ChevronRight, CornerDownRight, Trash2, Loader, Ban,
} from "lucide-react";
import Avatar from "./Avatar";
import CommentComposer from "./CommentComposer";
import AuthImage from "./AuthImage";
import { fullName, formatRelative, formatDateTime } from "../lib/format";
import { countComments } from "../lib/commentTree";

const MAX_INDENT_DEPTH = 4;

export default function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  collapsed,
  onToggleCollapse,
  onReply,
  onDelete,
}) {
  const [replying, setReplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const replies = comment.replies || [];
  const replyCount = countComments(replies);
  const showReplies = !collapsed.has(comment.id);
  const isDeleted = Boolean(comment.deleted);
  const isMine = currentUserId && comment.createdBy?.id === currentUserId;

  async function handleReply(content) {
    await onReply(comment.id, content);
    setReplying(false);
    onToggleCollapse(comment.id, false);
  }

  async function handleDelete() {
    setConfirming(false);
    setDeleting(true);
    setError("");
    try {
      await onDelete(comment.id);
    } catch (err) {
      setError(err.message || "Izoh o'chirilmadi");
      setDeleting(false);
    }
  }

  return (
    <li className="comment" data-depth={Math.min(depth, MAX_INDENT_DEPTH)}>
      <div className="comment-row">
        {isDeleted ? (
          <span className="comment-deleted-avatar" style={{ width: depth > 0 ? 28 : 34, height: depth > 0 ? 28 : 34 }}>
            <Ban size={depth > 0 ? 13 : 15} />
          </span>
        ) : (
          <Avatar profile={comment.createdBy} size={depth > 0 ? 28 : 34} />
        )}

        <div className="comment-main">
          <div className="comment-head">
            {isDeleted ? (
              <span className="comment-author comment-author-deleted">O'chirilgan</span>
            ) : (
              <span className="comment-author">
                {fullName(comment.createdBy)}
                {isMine && <span className="comment-badge">Siz</span>}
              </span>
            )}
            <time className="comment-time" title={formatDateTime(comment.createdAt)}>
              {formatRelative(comment.createdAt)}
            </time>
          </div>

          {depth > 0 && (
            <span className="comment-reply-hint">
              <CornerDownRight size={12} /> javob
            </span>
          )}

          {isDeleted ? (
            <p className="comment-content comment-content-deleted">
              Bu izoh muallifi tomonidan o'chirilgan
            </p>
          ) : (
            <>
              <p className="comment-content">{comment.content}</p>

              {comment.file?.id && (
                <AuthImage
                  attachmentId={comment.file.id}
                  alt={comment.file.originalName || "Ilova"}
                  className="comment-attachment"
                />
              )}
            </>
          )}

          <div className="comment-tools">
            {!isDeleted && (
              <button
                type="button"
                className={`comment-tool ${replying ? "active" : ""}`}
                onClick={() => setReplying((prev) => !prev)}
              >
                <Reply size={14} /> Javob berish
              </button>
            )}

            {replyCount > 0 && (
              <button
                type="button"
                className="comment-tool"
                onClick={() => onToggleCollapse(comment.id)}
              >
                {showReplies ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {replyCount} ta javob
              </button>
            )}

            {isMine && !isDeleted && !confirming && (
              <button
                type="button"
                className="comment-tool danger"
                onClick={() => setConfirming(true)}
                disabled={deleting}
                title="Izohni o'chirish"
              >
                {deleting ? <Loader size={14} className="spin" /> : <Trash2 size={14} />}
                O'chirish
              </button>
            )}

            {confirming && (
              <span className="comment-confirm">
                O'chirilsinmi?
                <button type="button" className="comment-tool danger" onClick={handleDelete}>
                  Ha
                </button>
                <button type="button" className="comment-tool" onClick={() => setConfirming(false)}>
                  Yo'q
                </button>
              </span>
            )}
          </div>

          {error && <span className="comment-error">{error}</span>}

          {/* Javob formasi aynan shu izohning ichida ochiladi */}
          {replying && (
            <div className="comment-reply-form">
              <CommentComposer
                compact
                autoFocus
                placeholder={`${fullName(comment.createdBy)}ga javob yozing...`}
                onSubmit={handleReply}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}

          {replies.length > 0 && showReplies && (
            <ul className="comment-replies">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  collapsed={collapsed}
                  onToggleCollapse={onToggleCollapse}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
