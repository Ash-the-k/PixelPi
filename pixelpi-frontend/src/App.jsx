import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import { PublicLayout } from './components/public/layout/PublicLayout';
import { AdminLayout } from './components/admin/layout/AdminLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProjectsPage from './pages/public/ProjectsPage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import CareersPage from './pages/public/CareersPage';
import ContactPage from './pages/public/ContactPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BlogListPage from './pages/admin/BlogListPage';
import BlogEditPage from './pages/admin/BlogEditPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import ApplicationDetailPage from './pages/admin/ApplicationDetailPage';
import ContactsPage from './pages/admin/ContactsPage';
import NewslettersPage from './pages/admin/NewslettersPage';
import CollaborationsPage from './pages/admin/CollaborationsPage';
import GalleryPage from './pages/admin/GalleryPage';
import CareerOpeningsPage from './pages/admin/CareerOpeningsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SecurityPage from './pages/admin/SecurityPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* ── Admin Routes ── */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="blog" element={<BlogListPage />} />
        <Route path="blog/new" element={<BlogEditPage />} />
        <Route path="blog/:id/edit" element={<BlogEditPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="newsletters" element={<NewslettersPage />} />
        <Route path="collaborations" element={<CollaborationsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="career-openings" element={<CareerOpeningsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}