import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Sparkles,
  MapPin,
  ShieldAlert,
  Users,
  Building,
  Box,
  Radio,
  FileText,
  User,
  Settings,
  Bell,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, navigate, currentRole, triggerSos, incidents, shelters } = useApp();
  const [query, setQuery] = useState('');

  // Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const routesList = [
    { name: 'Landing Page', path: '/', icon: Compass, category: 'Navigation' },
    { name: 'Citizen Portal', path: '/dashboard/citizen', icon: User, category: 'Dashboards' },
    { name: 'Authority Command Center', path: '/dashboard/authority', icon: ShieldAlert, category: 'Dashboards' },
    { name: 'Report Incident', path: '/report', icon: Radio, category: 'Actions' },
    { name: 'Public Incident Log', path: '/reports', icon: FileText, category: 'Data' },
    { name: 'Interactive Emergency Map', path: '/map', icon: MapPin, category: 'Maps' },
    { name: 'Disaster Alerts & Geofenced Warnings', path: '/alerts', icon: Bell, category: 'Emergency' },
    { name: 'Evacuation Shelters', path: '/shelters', icon: Building, category: 'Resources' },
    { name: 'Supply Chain Resources', path: '/resources', icon: Box, category: 'Resources' },
    { name: 'Volunteer Roster', path: '/volunteers', icon: Users, category: 'Resources' },
    { name: 'Emergency Profile & Medical ID', path: '/profile', icon: User, category: 'User' },
    { name: 'Alert Center', path: '/notifications', icon: Bell, category: 'Notifications' },
    { name: 'AI Search & Intelligence', path: '/search', icon: Sparkles, category: 'Tools' },
    { name: 'System Settings', path: '/settings', icon: Settings, category: 'User' },
  ];

  const filteredRoutes = routesList.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase())
  );

  const matchedIncidents = incidents.filter((inc) =>
    inc.title.toLowerCase().includes(query.toLowerCase()) ||
    inc.location.sector.toLowerCase().includes(query.toLowerCase())
  );

  const matchedShelters = shelters.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.sector.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-zinc-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, route, shelter, or natural query (e.g. 'nearest shelter')..."
            className="w-full bg-transparent text-sm focus:outline-none text-zinc-100 placeholder-zinc-500"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
            ESC
          </kbd>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 divide-y divide-zinc-800/60">
          {/* Quick Actions */}
          {query.trim() === '' && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Emergency Shortcuts
              </div>
              <button
                onClick={() => {
                  triggerSos();
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="font-medium">BROADCAST CRITICAL SOS EMERGENCY</span>
                </div>
                <span className="text-xs text-red-400/80 group-hover:translate-x-0.5 transition-transform">
                  Trigger GPS Dispatch →
                </span>
              </button>

              <button
                onClick={() => handleSelectRoute('/report')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-orange-400" />
                  <span>Submit New Disaster Incident Report</span>
                </div>
                <span className="text-xs text-zinc-500">Quick Wizard</span>
              </button>
            </div>
          )}

          {/* Account Authentication */}
          {query.trim() === '' && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Current Session Role</span>
                <span className="text-zinc-300 font-bold capitalize font-mono">{currentRole}</span>
              </div>
              <button
                onClick={() => handleSelectRoute('/login')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span>Switch Account / Change Role at Login</span>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-orange-400">Sign In →</span>
              </button>
            </div>
          )}

          {/* Route Results */}
          <div className="pt-2 space-y-1">
            <div className="px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Navigation Pages ({filteredRoutes.length})
            </div>
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.path}
                  onClick={() => handleSelectRoute(route.path)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    <span>{route.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{route.category}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Incidents Matches */}
          {query.trim().length > 1 && matchedIncidents.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Matching Incidents
              </div>
              {matchedIncidents.slice(0, 3).map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => handleSelectRoute('/reports')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-xs text-zinc-300"
                >
                  <div className="font-medium text-zinc-100 flex items-center justify-between">
                    <span>{inc.title}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-orange-400">
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-zinc-500 truncate mt-0.5">{inc.location.address}</p>
                </button>
              ))}
            </div>
          )}

          {/* Shelters Matches */}
          {query.trim().length > 1 && matchedShelters.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Matching Evacuation Shelters
              </div>
              {matchedShelters.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectRoute('/shelters')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-xs text-zinc-300"
                >
                  <div className="font-medium text-zinc-100 flex items-center justify-between">
                    <span>{s.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {s.capacity - s.occupancy} spots free
                    </span>
                  </div>
                  <p className="text-zinc-500 truncate mt-0.5">{s.address}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="bg-zinc-950 px-4 py-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>ResQ AI Natural Intelligence Engine Active</span>
          </div>
          <div>
            Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">↵ Select</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
