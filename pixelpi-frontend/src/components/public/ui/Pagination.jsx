import { ChevronLeft, ChevronRight } from 'lucide-react';

const activeStyle = {
  background: 'var(--color-accent-subtle)',
  color: 'var(--color-accent-hover)',
  border: '1px solid var(--color-accent)',
};
const defaultStyle = {
  background: 'transparent',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
};

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  // Build visible page range: first, last, and ±1 around current
  const all = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = all.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  // Insert ellipsis between non-consecutive numbers
  const items = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) items.push('ellipsis-' + i);
    items.push(p);
  });

  const btnClass =
    'w-9 h-9 flex items-center justify-center rounded-md font-mono text-mono-sm transition-all duration-[175ms] disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-2 pt-14">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnClass}
        style={defaultStyle}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {items.map((item) =>
        String(item).startsWith('ellipsis') ? (
          <span
            key={item}
            className="w-9 h-9 flex items-center justify-center font-mono text-mono-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={btnClass}
            style={item === currentPage ? activeStyle : defaultStyle}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnClass}
        style={defaultStyle}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}