import { getGalleryImageUrl } from '../../../utils/getImageUrl';

export function ProjectCard({ item, onClick }) {
  const src = item.filename
    ? getGalleryImageUrl(item.filename)
    : null;

  return (
    <button
      onClick={() => onClick(item)}
      className="card-interactive group relative rounded-lg overflow-hidden aspect-[4/3] w-full"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <img
        src={src}
        alt={item.title || item.filename}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-[275ms]"
        style={{
          background:
            'linear-gradient(to top, rgba(8,12,20,0.92) 0%, rgba(8,12,20,0.40) 55%, transparent 100%)',
        }}
      >
        {item.title && (
          <h3 className="font-display text-display-sm text-white leading-snug text-left">
            {item.title}
          </h3>
        )}
        {item.desc && (
          <p className="text-body-sm mt-1 text-left line-clamp-2" style={{ color: 'rgba(240,242,248,0.75)' }}>
            {item.desc}
          </p>
        )}
      </div>
    </button>
  );
}