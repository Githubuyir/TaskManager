import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AcceptInvitePage from './pages/auth/AcceptInvitePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import ProjectWorkspace from './pages/admin/ProjectWorkspace';
import AdminTeam from './pages/admin/AdminTeam';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberTasks from './pages/member/MemberTasks';
import MemberProjects from './pages/member/MemberProjects';
import MemberProjectWorkspace from './pages/member/MemberProjectWorkspace';
import SettingsPage from './pages/shared/SettingsPage';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#131b2e',
              color: '#faf8ff',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              boxShadow: '0 32px 64px -4px rgba(19, 27, 46, 0.2)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#faf8ff' },
            },
            error: {
              iconTheme: { primary: '#ba1a1a', secondary: '#faf8ff' },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/:projectId" element={<ProjectWorkspace />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Member Routes */}
          <Route element={<ProtectedRoute allowedRoles={['member']} />}>
            <Route path="/member" element={<DashboardLayout role="member" />}>
              <Route index element={<Navigate to="/member/dashboard" replace />} />
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="projects" element={<MemberProjects />} />
              <Route path="projects/:projectId" element={<MemberProjectWorkspace />} />
              <Route path="tasks" element={<MemberTasks />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
