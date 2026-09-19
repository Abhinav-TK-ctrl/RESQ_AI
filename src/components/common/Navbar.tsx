import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Check,
  ChevronDown,
  Sparkles,
  MapPin,
  FileText,
  Building,
  Box,
  Users,
  LogOut,
  Radio,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setRole,
    notifications,
    markNotificationAsRead,
    setCommandPaletteOpen,
    currentPath,
    navigate,
    activeSos,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/email-verification'].includes(
    currentPath
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-300 dark:border-zinc-800/80 bg-stone-50/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md transition-colors duration-200">
      {/* Live Emergency Ticker Banner */}
      <div className="bg-red-950 border-b border-red-900/80 text-white text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-widest uppercase text-red-200 shrink-0 text-[11px]">DISPATCH • LIVE:</span>
          <span className="truncate text-red-100/90 font-sans text-xs">
            Flash Flood Surge Warning in Sector 4 North — Emergency Shelters Open at 100% Operational Capacity
          </span>
        </div>
        <button
          onClick={() => handleNav('/notifications')}
          className="underline decoration-red-400/50 hover:decoration-red-300 hover:text-white shrink-0 ml-4 hidden sm:inline text-xs font-mono"
        >
          LOGS →
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200 border border-stone-700 dark:border-stone-300">
              <div className="w-full h-full bg-stone-900 dark:bg-stone-100 rounded-[6px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-600" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100">
                  ResQ
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 dark:text-stone-400 -mt-1 hidden sm:block">
                DISASTER INTELLIGENCE
              </span>
            </div>
          </button>

          {/* Quick Nav Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-mono tracking-wider uppercase text-stone-600 dark:text-stone-400">
            <button
              onClick={() => handleNav(`/dashboard/${currentRole}`)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentPath.startsWith('/dashboard')
                  ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNav('/map')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentPath === '/map'
                  ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Live Map
            </button>
            <button
              onClick={() => handleNav('/reports')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentPath === '/reports'
                  ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => handleNav('/shelters')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentPath === '/shelters'
                  ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Shelter
            </button>
            <button
              onClick={() => handleNav('/alerts')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                currentPath === '/alerts'
                  ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                  : 'hover:text-stone-900 dark:hover:text-stone-100 text-amber-600 dark:text-amber-400 font-medium'
              }`}
            >
              <span>Alerts</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </button>

            {/* Authority-Only Navigation Links */}
            {currentRole === 'authority' && (
              <>
                <button
                  onClick={() => handleNav('/volunteers')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentPath === '/volunteers'
                      ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                      : 'hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  Volunteers
                </button>
                <button
                  onClick={() => handleNav('/resources')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentPath === '/resources'
                      ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700'
                      : 'hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  Resources
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cmd+K Search Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search & Commands</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {/* Perspective Role Switcher (ONLY Citizen and Authority) */}
          {!isAuthPage && (
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setRole('citizen')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'citizen'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => setRole('authority')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  currentRole === 'authority'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Authority
              </button>
            </div>
          )}

          {/* Report Button */}
          <button
            onClick={() => handleNav('/report')}
            className="hidden sm:flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Report SOS</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-3 text-zinc-900 dark:text-zinc-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm">Emergency Alerts</span>
                  </div>
                  <button
                    onClick={() => handleNav('/notifications')}
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.actionUrl) handleNav(n.actionUrl);
                        setNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer text-xs border transition-colors ${
                        !n.read
                          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="truncate pr-2">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
                        {n.sender} • {n.targetSector}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-xs">
                {currentRole.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-zinc-900 dark:text-zinc-100 text-xs">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="font-semibold text-sm">ResQ User ID</p>
                  <p className="text-zinc-500 font-mono text-[11px] capitalize">Role: {currentRole}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      handleNav('/profile');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-500" />
                    <span>Emergency Profile & Medical ID</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNav('/settings');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    <span>Platform Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      handleNav('/login');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out / Switch Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
          <div className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500">Active Mode:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setRole('citizen')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  currentRole === 'citizen' ? 'bg-orange-500 text-white font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Citizen Mode
              </button>
              <button
                onClick={() => setRole('authority')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  currentRole === 'authority' ? 'bg-orange-500 text-white font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Authority Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => handleNav(`/dashboard/${currentRole}`)}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNav('/map')}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
            >
              Live Map
            </button>
            <button
              onClick={() => handleNav('/reports')}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
            >
              Incidents
            </button>
            <button
              onClick={() => handleNav('/shelters')}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
            >
              Shelter
            </button>
            <button
              onClick={() => handleNav('/alerts')}
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-left font-medium flex items-center justify-between border border-amber-200 dark:border-amber-900/60"
            >
              <span>Alerts</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white">
                LIVE
              </span>
            </button>
            {currentRole === 'authority' && (
              <>
                <button
                  onClick={() => handleNav('/volunteers')}
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
                >
                  Volunteers
                </button>
                <button
                  onClick={() => handleNav('/resources')}
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left font-medium"
                >
                  Resources
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
