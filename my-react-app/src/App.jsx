/**
 * Root Application Router (`App.jsx`)
 *
 * Connects:
 * - Public Single-Page Portfolio (`/`)
 * - Discreet Administrator Login (`/admin/login`)
 * - Protected Single-Admin CMS (`/admin/*`)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PortfolioPage from './pages/PortfolioPage';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectsManager from './pages/admin/ProjectsManager';
import InterestsManager from './pages/admin/InterestsManager';
import SiteContentManager from './pages/admin/SiteContentManager';
import MessagesManager from './pages/admin/MessagesManager';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portfolio Experience */}
          <Route path="/" element={<PortfolioPage />} />

          {/* Private Administrator Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Single-Admin CMS Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="interests" element={<InterestsManager />} />
            <Route path="content" element={<SiteContentManager />} />
            <Route path="messages" element={<MessagesManager />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
