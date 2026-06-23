import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../../utils/formatDate';
import { getGalleryImageUrl } from '../../../utils/getImageUrl';

export function BlogCard({ post }) {
  const coverSrc = post.cover_image
    ? post.cover_image.startsWith('http')
      ? post.cover_image
      : getGalleryImageUrl(post.cover_image)
    : null;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card-interactive group flex flex-col rounded-lg overflow-hidden h-full"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)' ,
      }}
    >
      {/* Cover */}
      <div
        className="aspect-video overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-bg-subtle)' }}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="font-mono text-mono-sm tracking-widest uppercase"
              style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}
            >
              PixelPi
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        {post.category && (
          <div>
            <Badge variant="accent">{post.category}</Badge>
          </div>
        )}

        <h3
          className="font-display text-display-sm leading-snug line-clamp-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className="text-body-sm line-clamp-2 flex-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {post.excerpt}
          </p>
        )}

        <div
          className="flex flex-wrap items-center gap-4 font-mono text-mono-sm pt-1 mt-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {post.views != null && (
            <span className="flex items-center gap-1.5">
              <Eye size={11} />
              {post.views.toLocaleString()} views
            </span>
          )}
          {(post.published_at || post.created_at) && (
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {formatDate(post.published_at || post.created_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}