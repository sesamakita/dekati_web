// src/layouts/AdminLayout.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar, NavTab } from '../components/Sidebar';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { dataService } from '../services/dataService';
import { getPermittedTabs } from '../utils/rbac';

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

  const currentOfficial = dataService.getCurrentOfficial();
  const permittedTabs = useMemo(() => getPermittedTabs(currentOfficial), [currentOfficial]);

  // Persist sidebar collapsed preference in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('dekati_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('dekati_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Extract active tab from URL pathname (e.g. /admin/letters -> letters)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab: NavTab = (pathParts[1] as NavTab) || 'dashboard';

  // Lindungi rute modul jika di luar wewenang jobdesk aparatur
  useEffect(() => {
    if (isAuthenticated && !permittedTabs.includes(currentTab)) {
      const fallbackTab = permittedTabs[0] || 'dashboard';
      navigate(`/admin/${fallbackTab}`, { replace: true });
    }
  }, [isAuthenticated, permittedTabs, currentTab, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Floating Interactive Demo Simulation Banner (if in demo mode) */}
      <DemoModeBanner />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Pinned / Collapsible Sidebar */}
        <Sidebar
          activeTab={currentTab}
          onOpenLanding={handleOpenLanding}
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
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
