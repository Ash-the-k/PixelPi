const API_BASE = import.meta.env.DEV ? "http://localhost:3000" : ""

export const getGalleryImageUrl = (filename) =>
  `${API_BASE}/uploads/gallery/${filename}`;