import { Search } from 'lucide-react';

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full font-mono text-mono-sm transition-all duration-[175ms]"
      style={
        active
          ? {
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent-hover)',
              border: '1px solid var(--color-accent)',
            }
          : {
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }
      }
    >
      {label}
    </button>
  );
}

export function CategoryFilter({ searchValue, onSearchChange, categories, activeCategory, onCategoryChange }) {
  return (
    <div className="space-y-4">
      {/* Search */} 
      <div className="relative" style={{ maxWidth: '480px' }}>
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts…"
          className="w-full h-11 pl-10 pr-4 rounded-md font-body text-body-sm focus:outline-none"
          style={{
            background: 'rgba(13,18,32,0.70)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            transition: 'border-color 175ms, box-shadow 175ms',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)';
            e.target.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Category pills — only when API returns them */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <CategoryPill
            label="All"
            active={!activeCategory}
            onClick={() => onCategoryChange('')}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => onCategoryChange(cat)}
            />
          ))}
        </div>
      )}
    </div>
  );
}