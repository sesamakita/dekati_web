// src/App.tsx
import React, { useState, Suspense, lazy } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { LandingPageView } from './views/LandingPageView';
import { dataService } from './services/dataService';

// Lazy-loaded views for optimal code-splitting
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const LettersView = lazy(() => import('./views/LettersView').then(m => ({ default: m.LettersView })));
const ComplaintsView = lazy(() => import('./views/ComplaintsView').then(m => ({ default: m.ComplaintsView })));
const CitizensView = lazy(() => import('./views/CitizensView').then(m => ({ default: m.CitizensView })));
const AnnouncementsView = lazy(() => import('./views/AnnouncementsView').then(m => ({ default: m.AnnouncementsView })));
const ApbdesView = lazy(() => import('./views/ApbdesView').then(m => ({ default: m.ApbdesView })));
const EventsView = lazy(() => import('./views/EventsView').then(m => ({ default: m.EventsView })));
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const PublicVerifyView = lazy(() => import('./views/PublicVerifyView'));

// Loading Fallback Component
const ViewLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-[350px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-500 font-medium">Memuat halaman...</span>
    </div>
  </div>
);

// Wrapper for Landing Page
const LandingPageWrapper: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const handleEnterAdmin = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };
  return <LandingPageView onEnterAdmin={handleEnterAdmin} />;
};

// Wrapper for Auth Page
const AuthPageWrapper: React.FC<{
  onLoginSuccess: (role: 'admin_desa' | 'kades', userEmail?: string) => void;
}> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<ViewLoader />}>
      <AuthView
        onLoginSuccess={(role, email) => {
          onLoginSuccess(role, email);
          navigate('/admin/dashboard');
        }}
        onBackToLanding={() => navigate('/')}
      />
    </Suspense>
  );
};

// Wrapper for Dashboard View with Navigation handler
const DashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <DashboardView
      onNavigateTab={(tab) => {
        navigate(`/admin/${tab}`);
        document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = (role: 'admin_desa' | 'kades', userEmail?: string) => {
    setIsAuthenticated(true);
    void userEmail;
    dataService.setActiveRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    dataService.logoutOfficial();
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={<LandingPageWrapper isAuthenticated={isAuthenticated} />}
        />

        {/* Public QR Code Letter Verification */}
        <Route
          path="/verify/:token"
          element={
            <Suspense fallback={<ViewLoader />}>
              <PublicVerifyView />
            </Suspense>
          }
        />
        <Route
          path="/verify"
          element={
            <Suspense fallback={<ViewLoader />}>
              <PublicVerifyView />
            </Suspense>
          }
        />

        {/* Auth / Login Page */}
        <Route
          path="/login"
          element={<AuthPageWrapper onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Protected Admin Portal with Nested Routes */}
        <Route
          path="/admin"
          element={
            <AdminLayout
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<ViewLoader />}>
                <DashboardWrapper />
              </Suspense>
            }
          />
          <Route
            path="letters"
            element={
              <Suspense fallback={<ViewLoader />}>
                <LettersView />
              </Suspense>
            }
          />
          <Route
            path="complaints"
            element={
              <Suspense fallback={<ViewLoader />}>
                <ComplaintsView />
              </Suspense>
            }
          />
          <Route
            path="citizens"
            element={
              <Suspense fallback={<ViewLoader />}>
                <CitizensView />
              </Suspense>
            }
          />
          <Route
            path="announcements"
            element={
              <Suspense fallback={<ViewLoader />}>
                <AnnouncementsView />
              </Suspense>
            }
          />
          <Route
            path="events"
            element={
              <Suspense fallback={<ViewLoader />}>
                <EventsView />
              </Suspense>
            }
          />
          <Route
            path="apbdes"
            element={
              <Suspense fallback={<ViewLoader />}>
                <ApbdesView />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
