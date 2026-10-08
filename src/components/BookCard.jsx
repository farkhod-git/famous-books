import { Heart, MessageCircle, Star, BookOpen, Eye, ImageOff } from "lucide-react";
import { coverIdOf } from "../lib/post";
import AuthImage from "./AuthImage";
import { formatCount, formatRelative } from "../lib/format";
import { genreLabel } from "../lib/genres";

export default function BookCard({ post, liked, onOpen, onLike }) {
  return (
    <article className="book-card" onClick={() => onOpen(post)}>
      <div className="book-card-cover">
        <AuthImage
          attachmentId={coverIdOf(post)}
          alt={post.bookName}
          className="book-card-img"
          fallback={
            <div className="cover-missing">
              <ImageOff size={22} />
              <span>Muqova yuklanmadi</span>
            </div>
          }
        />
        {post.genre && <span className="book-card-genre">{genreLabel(post.genre)}</span>}
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{post.bookName}</h3>

        <p className="book-card-author">
          <BookOpen size={13} />
          {[post.author, post.pages && `${post.pages} bet`, post.year].filter(Boolean).join(" · ")}
        </p>

        {post.opinion && <p className="book-card-review">“{post.opinion}”</p>}

        <div className="book-card-footer">
          <button
            type="button"
            className={`btn-like ${liked ? "liked" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onLike(post);
            }}
            title={liked ? "Like ni olib tashlash" : "Like"}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span>{formatCount(post.likes)}</span>
          </button>

          <span className="book-card-stat">
            <MessageCircle size={15} />
            {formatCount(post.comments)}
          </span>

          <span className="book-card-stat">
            <Eye size={14} />
            {formatCount(post.views)}
          </span>

          <span className="book-card-stat book-card-score">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            {post.readerScore}
          </span>
        </div>

        <span className="book-card-date">{formatRelative(post.createdAt)}</span>
      </div>
    </article>
  );
}
