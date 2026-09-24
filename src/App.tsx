// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { LettersView } from './views/LettersView';
import { ComplaintsView } from './views/ComplaintsView';
import { CitizensView } from './views/CitizensView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { ApbdesView } from './views/ApbdesView';
import { EventsView } from './views/EventsView';
import { LandingPageView } from './views/LandingPageView';
import { AuthView } from './views/AuthView';
import { dataService } from './services/dataService';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dekati_auth_v1') === 'true';
  });

  const [portalMode, setPortalMode] = useState<'landing' | 'auth' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#admin') {
      return localStorage.getItem('dekati_auth_v1') === 'true' ? 'admin' : 'auth';
    }
    if (hash === '#login' || hash === '#register') {
      return 'auth';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const authed = localStorage.getItem('dekati_auth_v1') === 'true';
      if (hash === '#admin') {
        if (authed) {
          setPortalMode('admin');
        } else {
          setPortalMode('auth');
          window.location.hash = '#login';
        }
      } else if (hash === '#login' || hash === '#register') {
        setPortalMode('auth');
      } else if (hash === '#landing' || !hash) {
        setPortalMode('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnterAdmin = () => {
    if (isAuthenticated) {
      setPortalMode('admin');
      window.location.hash = '#admin';
    } else {
      setPortalMode('auth');
      window.location.hash = '#login';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterLanding = () => {
    setPortalMode('landing');
    window.location.hash = '#landing';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: 'admin_desa' | 'kades', userEmail?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('dekati_auth_v1', 'true');
    if (userEmail) {
      localStorage.setItem('dekati_auth_user_v1', userEmail);
    }
    dataService.setActiveRole(role);
    setPortalMode('admin');
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dekati_auth_v1');
    localStorage.removeItem('dekati_auth_user_v1');
    setPortalMode('landing');
    window.location.hash = '#landing';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={handleNavigate} />;
      case 'letters':
        return <LettersView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'citizens':
        return <CitizensView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'events':
        return <EventsView />;
      case 'apbdes':
        return <ApbdesView />;
      default:
        return <DashboardView onNavigateTab={handleNavigate} />;
    }
  };

  // 1. If in Public Landing Page Mode
  if (portalMode === 'landing') {
    return <LandingPageView onEnterAdmin={handleEnterAdmin} />;
  }

  // 2. If in Login / Register Auth Mode
  if (portalMode === 'auth') {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={handleEnterLanding}
        initialMode={window.location.hash === '#register' ? 'register' : 'login'}
      />
    );
  }

  // 3. If in Admin Dashboard Mode
  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-800 flex flex-col overflow-hidden animate-fade-in">
      {/* Fixed / Static Header with Logout & Landing Link */}
      <Header
        onOpenLanding={handleEnterLanding}
        onLogout={handleLogout}
      />

      {/* Main Layout Container (fills remaining viewport height) */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Static / Diam Pinned Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onOpenLanding={handleEnterLanding}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Independently Scrollable Content Area */}
        <main
          id="main-content"
          className="flex-1 h-full overflow-y-auto px-6 sm:px-8 py-7 min-w-0 scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
