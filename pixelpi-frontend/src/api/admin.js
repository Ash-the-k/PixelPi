import client from './client';

export const adminApi = {
  // Auth
  login: (credentials) => client.post('/api/admin/login', credentials),
  logout: () => client.post('/api/admin/logout'),
  status: () => client.get('/api/admin/status'),

  // Dashboard
  getDashboardStats: () => client.get('/api/admin/dashboard/stats'),
  getDashboardOverview: () => client.get('/api/admin/dashboard/overview'),

  // Blog
  getBlogPosts: () => client.get('/api/admin/blog'),
  getBlogPost: (id) => client.get(`/api/admin/blog/${id}`),
  createBlogPost: (data) => client.post('/api/admin/blog', data),
  updateBlogPost: (id, data) => client.put(`/api/admin/blog/${id}`, data),
  deleteBlogPost: (id) => client.delete(`/api/admin/blog/${id}`),

  // Applications
  getApplications: () => client.get('/api/admin/applications'),
  getApplication: (id) => client.get(`/api/admin/applications/${id}`),
  updateApplicationStatus: (id, status) =>
    client.put(`/api/admin/applications/${id}/status`, { status }),

  // Contacts
  getContacts: () => client.get('/api/admin/contacts'),
  updateContactStatus: (id, status) =>
    client.put(`/api/admin/contacts/${id}/status`, { status }),

  // Newsletters
  getNewsletters: () => client.get('/api/admin/newsletters'),

  // Collaborations
  getCollaborations: () => client.get('/api/admin/collaborations'),
  updateCollaborationStatus: (id, status) =>
    client.put(`/api/admin/collaborations/${id}/status`, { status }),

  // Gallery
  getGallery: () => client.get('/api/admin/gallery'),
  uploadGalleryImage: (formData) =>
    client.post('/api/admin/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateGalleryImage: (filename, data) =>
    client.put(`/api/admin/gallery/${filename}`, data),
  deleteGalleryImage: (filename) =>
    client.delete(`/api/admin/gallery/${filename}`),

  // Career Openings
  getCareerOpenings: () => client.get('/api/admin/career-openings'),
  createCareerOpening: (data) => client.post('/api/admin/career-openings', data),
  updateCareerOpening: (id, data) =>
    client.put(`/api/admin/career-openings/${id}`, data),
  deleteCareerOpening: (id) =>
    client.delete(`/api/admin/career-openings/${id}`),

  // System
  getAuditLogs: () => client.get('/api/admin/audit-logs'),
  getAnalytics: () => client.get('/api/admin/analytics'),
  getSecurity: () => client.get('/api/admin/security'),
  blockIp: (ip) => client.post('/api/admin/security/block-ip', { ip }),
  unblockIp: (ip) => client.post('/api/admin/security/unblock-ip', { ip }),
  getSettings: () => client.get('/api/admin/settings'),
  updateSettings: (data) => client.put('/api/admin/settings', data),
};