import client from './client';

export const api = {
  // Health
  health: () => client.get('/api/health'),

  // Contact / Collaboration / Newsletter
  submitContact: (data) => client.post('/api/contact', data),
  submitCollaboration: (data) => client.post('/api/collaboration', data),
  subscribeNewsletter: (data) => client.post('/api/newsletter', data),

  // Blog
  getBlogPosts: (params) => client.get('/api/blog', { params }),
  getBlogPost: (slug) => client.get(`/api/blog/${slug}`),

  // Careers
  getCareerOpenings: () => client.get('/api/career-openings'),
  submitApplication: (formData) =>
    client.post('/api/careers/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Gallery
  getGallery: () => client.get('/api/gallery'),
};