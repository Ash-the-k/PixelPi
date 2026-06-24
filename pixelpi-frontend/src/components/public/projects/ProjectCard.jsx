import { getGalleryImageUrl } from '../../../utils/getImageUrl';

export function ProjectCard({ item, onClick }) {
  const src = getGalleryImageUrl(item.filename);

  return (
    <button
      onClick={() => onClick(item)}
      className="card-interactive group w-full text-left rounded-lg overflow-hidden flex flex-col h-full"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={src}
          alt={item.title || item.filename}
          loading="lazy"
          className="w-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
        />
      </div>

      <div className="p-5">
        {item.title && (
          <h3
            className="font-display text-display-sm mb-2 line-clamp-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {item.title}
          </h3>
        )}
        {item.desc && (
          <p
            className="text-body-sm line-clamp-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {item.desc}
          </p>
        )}
        {!item.title && !item.desc && (
          <p className="font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
            {item.filename}
          </p>
        )}
      </div>
    </button>
  );
}