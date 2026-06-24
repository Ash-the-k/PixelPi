import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getGalleryImageUrl } from '../../../utils/getImageUrl';

export function ProjectModal({ item, onClose }) {
  const src = item ? getGalleryImageUrl(item.filename) : null;

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(8,12,20,0.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full overflow-hidden"
              style={{
                maxWidth: '640px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-xl)',
              }}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {src && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={src}
                    alt={item.title || item.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  {item.title ? (
                    <h2
                      className="font-display text-display-sm"
                      style={{ color: 'var(--color-text-primary)', lineHeight: 1.2 }}
                    >
                      {item.title}
                    </h2>
                  ) : <div />}
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-[175ms]"
                    style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>

                {item.desc ? (
                  <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.desc}
                  </p>
                ) : !item.title ? (
                  <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No additional information available.
                  </p>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}