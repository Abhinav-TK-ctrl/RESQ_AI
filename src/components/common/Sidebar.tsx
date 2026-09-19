import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Map,
  FileText,
  Building2,
  Box,
  Radio,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Activity,
  HeartPulse,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Users,
  BellRing,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRole, currentPath, navigate, activeSos, incidents, verifyIncident, alerts } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showSosList, setShowSosList] = useState(true);

  const criticalIncidents = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const broadcastSosAlerts = incidents.filter((i) => i.isSosBroadcast || i.title.includes('SOS'));

  // Citizen Mode: strictly restricted to Dashboard, Live Map, Incidents, Shelter, and Alerts
  const citizenNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard/citizen',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Live Map',
      path: '/map',
      icon: Map,
      badge: 'GIS',
    },
    {
      label: 'Incidents',
      path: '/reports',
      icon: FileText,
      badge: criticalIncidents > 0 ? `${criticalIncidents}` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      label: 'Shelter',
      path: '/shelters',
      icon: Building2,
      badge: null,
    },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: BellRing,
      badge: alerts.length > 0 ? `${alerts.length}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
  ];

  // Authority Mode: includes Resource Supply Hub and Alerts
  const authorityNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard/authority',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Live Map',
      path: '/map',
      icon: Map,
      badge: 'GIS',
    },
    {
      label: 'Incidents',
      path: '/reports',
      icon: FileText,
      badge: criticalIncidents > 0 ? `${criticalIncidents}` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      label: 'Shelter',
      path: '/shelters',
      icon: Building2,
      badge: null,
    },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: BellRing,
      badge: alerts.length > 0 ? `${alerts.length}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
    {
      label: 'Volunteers',
      path: '/volunteers',
      icon: Users,
      badge: 'Squad',
    },
    {
      label: 'Resource Supply Hub',
      path: '/resources',
      icon: Box,
      badge: null,
    },
  ];

  const navItems = currentRole === 'citizen' ? citizenNavItems : authorityNavItems;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-stone-300 dark:border-zinc-800/80 bg-stone-50 dark:bg-[#0c0c0e] transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 shadow-sm transition-transform"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Role Banner & Header Section */}
      <div className="p-4 border-b border-stone-300 dark:border-zinc-800/80">
        {!collapsed ? (
          <div className="p-3 rounded-lg bg-stone-200/60 dark:bg-[#131316] border border-stone-300 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                ACTIVE PERSPECTIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 capitalize">
                {currentRole === 'citizen' ? 'Citizen Emergency Portal' : 'Authority Command Portal'}
              </p>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                PORTAL ACTIVE
              </span>
            </div>

            {/* Authority View: Live list of Broadcast SOS alerts sent by citizens under Emergency Portal / Active Perspective */}
            {currentRole === 'authority' && (
              <div className="pt-2 border-t border-stone-300 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-600 dark:text-red-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>BROADCAST SOS ALERTS ({broadcastSosAlerts.length})</span>
                  </div>
                  <button
                    onClick={() => setShowSosList(!showSosList)}
                    className="text-[10px] text-stone-400 hover:text-stone-200 font-mono underline"
                  >
                    {showSosList ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showSosList && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {broadcastSosAlerts.length === 0 ? (
                      <p className="text-[10px] text-stone-400 italic">No active citizen SOS alerts</p>
                    ) : (
                      broadcastSosAlerts.map((sos) => (
                        <div
                          key={sos.id}
                          className="p-2 rounded bg-red-950/40 border border-red-800/60 text-[10px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-red-300 font-bold">
                            <span className="truncate">{sos.reporter.name}</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                              sos.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {sos.status === 'verified' ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-stone-300 line-clamp-1">{sos.title}</p>
                          <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono">
                            <span>{sos.location.sector}</span>
                            {sos.status === 'unverified' && (
                              <button
                                onClick={() => verifyIncident(sos.id)}
                                className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-lg bg-stone-200 dark:bg-zinc-900 flex items-center justify-center text-red-600 dark:text-red-400 font-serif font-bold text-base border border-stone-300 dark:border-zinc-800">
            {currentRole.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-stone-200 dark:bg-zinc-800/90 text-stone-900 dark:text-stone-100 font-bold border border-stone-300 dark:border-zinc-700 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-zinc-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-stone-400 dark:text-stone-500'}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-stone-200 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 border-stone-300 dark:border-zinc-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Emergency Status Widget */}
      <div className="p-3 border-t border-stone-300 dark:border-zinc-800/80">
        {!collapsed ? (
          <div className="p-3 rounded-lg bg-stone-900 dark:bg-[#131316] text-stone-100 border border-stone-800 text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-red-400 font-bold tracking-wider">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span>STATE MONSOON RADAR</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between font-sans">
              <span>Kerala DEOC Operations:</span>
              <span className="font-mono font-bold text-stone-100">14 Districts</span>
            </div>
            {activeSos && (
              <div className="p-2 rounded bg-red-950/80 border border-red-800 text-red-200 text-[10px] font-mono font-bold flex items-center gap-1.5 tracking-wide">
                <HeartPulse className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>CITIZEN SOS BROADCAST ACTIVE</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
        )}
      </div>
    </aside>
  );
};
