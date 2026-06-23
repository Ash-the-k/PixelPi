import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Eye, Calendar, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useBlogPost } from '../../hooks/useBlogPost';
import { Badge } from '../../components/public/ui/Badge';
import { formatDate } from '../../utils/formatDate';
import { getGalleryImageUrl } from '../../utils/getImageUrl';

// ── File-local components (used only here, too small to extract) ─────────────

function BackLink() {
  return (
    <Link
      to="/blog"
      className="inline-flex items-center gap-2 font-mono text-mono-sm transition-colors duration-[175ms]"
      style={{ color: 'var(--color-text-muted)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
    >
      <ArrowLeft size={14} />
      Back to Blog
    </Link>
  );
}

function PostNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center section-padding"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <p
        className="font-mono text-mono-sm uppercase tracking-widest mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        404
      </p>
      <h1
        className="font-display text-display-md mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Post not found.
      </h1>
      <p className="text-body-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        This article may have been moved or removed.
      </p>
      <BackLink />
    </div>
  );
}

function PostSkeleton() {
  const s = { background: 'var(--color-bg-subtle)' };
  return (
    <div className="min-h-screen animate-pulse" style={{ background: 'var(--color-bg-base)' }}>
      <div
        className="content-container pt-36 pb-12"
        style={{ maxWidth: 'var(--max-width-article)' }}
      >
        <div className="h-4 w-24 rounded-sm mb-8" style={s} />
        <div className="h-5 w-28 rounded-sm mb-5" style={s} />
        <div className="space-y-3 mb-6">
          <div className="h-12 w-4/5 rounded-sm" style={s} />
          <div className="h-12 w-3/5 rounded-sm" style={s} />
        </div>
        <div className="h-5 w-full rounded-sm mb-2" style={s} />
        <div className="h-5 w-3/4 rounded-sm mb-8" style={s} />
        <div className="flex gap-6">
          <div className="h-4 w-28 rounded-sm" style={s} />
          <div className="h-4 w-32 rounded-sm" style={s} />
        </div>
      </div>
      <div
        className="content-container pb-10"
        style={{ maxWidth: 'var(--max-width-article)' }}
      >
        <div className="aspect-video rounded-xl" style={s} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading, error } = useBlogPost(slug);

  if (isLoading) return <PostSkeleton />;
  if (error || !post?.title) return <PostNotFound />;

  const coverSrc = post.cover_image
    ? post.cover_image.startsWith('http')
      ? post.cover_image
      : getGalleryImageUrl(post.cover_image)
    : null;

  const sanitizedContent = post.content
    ? DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'a', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'id'],
        FORCE_BODY: true,
      })
    : '';

  const metaTitle       = post.meta_title       || post.title;
  const metaDescription = post.meta_description || post.excerpt || '';

  return (
    <>
      <Helmet>
        <title>{metaTitle} | Pixel Pi Technologies</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        {coverSrc && <meta property="og:image" content={coverSrc} />}
      </Helmet>

      <article style={{ minHeight: '100vh' }}>

        {/* ── Header ── */}
        <header
          className="content-container"
          style={{ maxWidth: 'var(--max-width-article)', paddingTop: '136px', paddingBottom: '40px' }}
        >
          <div className="mb-8">
            <BackLink />
          </div>

          {post.category && (
            <div className="mb-5">
              <Badge variant="accent">{post.category}</Badge>
            </div>
          )}

          <h1
            className="font-display mb-5"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            {post.title}
          </h1>

          {/* Excerpt / meta_description — visible lead text */}
          {metaDescription && (
            <p
              className="text-body-lg mb-6"
              style={{
                color: 'var(--color-text-secondary)',
                maxWidth: '780px',
                lineHeight: 1.6,
              }}
            >
              {metaDescription}
            </p>
          )}

          {/* Meta row */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-mono-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={12} /> {post.author}
              </span>
            )}
            {(post.published_at || post.created_at) && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(post.published_at || post.created_at)}
              </span>
            )}
            {post.views != null && (
              <span className="flex items-center gap-1.5">
                <Eye size={12} />
                {post.views.toLocaleString()} views
              </span>
            )}
          </div>
        </header>

        {/* ── Divider ── */}
        <div
          className="content-container"
          style={{ maxWidth: 'var(--max-width-article)' }}
        >
          <div style={{ height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* ── Cover image ── */}
        {coverSrc && (
          <div
            className="content-container"
            style={{ maxWidth: 'calc(var(--max-width-article) - 50px)', paddingTop: '40px', paddingBottom: '40px' }}
          >
            <div className="rounded-xl overflow-hidden aspect-video">
              <img
                src={coverSrc}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* ── Body content ── */}
        <div
          className="content-container pb-4 md:pb-10"
          style={{
            maxWidth: 'var(--max-width-text)', marginLeft: 'auto', marginRight: 'auto',
            paddingTop: coverSrc ? '8px' : '40px',
          }}
        >
          {sanitizedContent ? (
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>No content available.</p>
          )}
        </div>

        {/* ── Footer nav ── */}
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          <div
            className="content-container py-10"
            style={{ maxWidth: 'var(--max-width-article)' }}
          >
            <BackLink />
          </div>
        </div>

      </article>
    </>
  );
}