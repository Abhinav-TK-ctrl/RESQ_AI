import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { FloatingSosButton } from './components/common/FloatingSosButton';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { EmailVerificationView } from './views/EmailVerificationView';

import { CitizenDashboardView } from './views/CitizenDashboardView';
import { VolunteerDashboardView } from './views/VolunteerDashboardView';
import { AuthorityDashboardView } from './views/AuthorityDashboardView';

import { ReportView } from './views/ReportView';
import { ReportsListView } from './views/ReportsListView';
import { MapView } from './views/MapView';
import { ResourcesView } from './views/ResourcesView';
import { SheltersView } from './views/SheltersView';
import { VolunteersView } from './views/VolunteersView';
import { ProfileView } from './views/ProfileView';
import { NotificationsView } from './views/NotificationsView';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';
import { AlertsView } from './views/AlertsView';
import { DataMigrationView } from './views/DataMigrationView';

const MainContent: React.FC = () => {
  const { currentPath, currentRole } = useApp();

  // Determine view rendering
  const renderView = () => {
    switch (currentPath) {
      case '/':
        return <LandingView />;
      case '/login':
        return <LoginView />;
      case '/signup':
        return <SignupView />;
      case '/forgot-password':
        return <ForgotPasswordView />;
      case '/reset-password':
        return <ResetPasswordView />;
      case '/verify-email':
        return <EmailVerificationView />;

      // Dashboards
      case '/dashboard/citizen':
        return <CitizenDashboardView />;
      case '/dashboard/volunteer':
        return <VolunteerDashboardView />;
      case '/dashboard/authority':
        return <AuthorityDashboardView />;

      // Functional Modules
      case '/report':
        return <ReportView />;
      case '/reports':
        return <ReportsListView />;
      case '/map':
        return <MapView />;
      case '/resources':
        return <ResourcesView />;
      case '/shelters':
        return <SheltersView />;
      case '/alerts':
        return <AlertsView />;
      case '/migration':
      case '/data-migration':
        return <DataMigrationView />;
      case '/volunteers':
        return <VolunteersView />;
      case '/profile':
        return <ProfileView />;
      case '/notifications':
        return <NotificationsView />;
      case '/search':
        return <SearchView />;
      case '/settings':
        return <SettingsView />;

      default:
        // Fallback to role dashboard if path matches dashboard or unknown
        if (currentPath.startsWith('/dashboard')) {
          if (currentRole === 'volunteer') return <VolunteerDashboardView />;
          if (currentRole === 'authority') return <AuthorityDashboardView />;
          return <CitizenDashboardView />;
        }
        return <LandingView />;
    }
  };

  const isPublicPage = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(currentPath);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-[#0c0c0e] text-stone-900 dark:text-stone-100 transition-colors duration-200 font-sans selection:bg-red-900 selection:text-red-100 antialiased">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {!isPublicPage && (
          <aside className="w-64 shrink-0 hidden md:block">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 min-w-0 space-y-6">
          {renderView()}
        </main>
      </div>

      <Footer />

      {/* Global Interactive Overlays */}
      <FloatingSosButton />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ThemeProvider>
  );
}
