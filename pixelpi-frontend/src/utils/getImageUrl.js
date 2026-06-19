const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getGalleryImageUrl = (filename) =>
  `${API_BASE}/uploads/gallery/${filename}`;