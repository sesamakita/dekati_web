// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar, NavTab } from '../components/Sidebar';
import { dataService } from '../services/dataService';

interface AdminLayoutProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  isAuthenticated,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Extract active tab from URL pathname (e.g. /admin/letters -> letters)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab: NavTab = (pathParts[1] as NavTab) || 'dashboard';

  const handleSelectTab = (tab: NavTab) => {
    navigate(`/admin/${tab}`);
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLanding = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutAdmin = () => {
    dataService.logoutOfficial();
    onLogout();
    navigate('/');
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-800 flex flex-col overflow-hidden animate-fade-in">
      {/* Fixed / Static Header */}
      <Header
        onOpenLanding={handleOpenLanding}
        onLogout={handleLogoutAdmin}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Pinned Sidebar */}
        <Sidebar
          activeTab={currentTab}
          onOpenLanding={handleOpenLanding}
          onSelectTab={handleSelectTab}
        />

        {/* Scrollable Content Area */}
        <main
          id="main-content"
          className="flex-1 h-full overflow-y-auto px-6 sm:px-8 py-7 min-w-0 scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
