import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getGalleryImageUrl } from '../../../utils/getImageUrl';

export function ProjectModal({ item, onClose }) {
  const src = item?.filename
    ? getGalleryImageUrl(item.filename) : null;

  // Body scroll lock
  useEffect(() => {
    if (item) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  // Esc key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 cursor-pointer"
            style={{ background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel container — pointer-events-none so clicks outside reach backdrop */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full rounded-xl overflow-hidden"
              style={{
                maxWidth: '800px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
              }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              {src && (
                <div className="aspect-video">
                  <img src={src} alt={item.title || item.filename} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {item.title && (
                    <h2 className="font-display text-display-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </h2>
                  )}
                  {item.desc && (
                    <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.desc}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md transition-all duration-[175ms]"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}