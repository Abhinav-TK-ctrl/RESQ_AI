import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Sparkles, Heart, Globe, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="border-t border-stone-300 dark:border-zinc-800/80 bg-stone-50 dark:bg-[#0c0c0e] text-stone-600 dark:text-stone-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-serif font-bold border border-stone-700 dark:border-stone-300">
                <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-600" />
              </div>
              <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                ResQ AI
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded tracking-wider">
                v1.0 READY
              </span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-xs max-w-sm">
              AI-Powered Disaster Intelligence & Emergency Response Platform engineered for real-time situational awareness, multi-agency dispatching, and rapid citizen assistance.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                STATE DISASTER COMMAND RELAY ACTIVE
              </span>
            </div>
          </div>

          {/* Column 2: Platform Shortcuts */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-200 text-[11px] font-mono uppercase tracking-widest">
              Platform Views
            </h4>
            <ul className="space-y-1.5 text-xs font-sans">
              <li>
                <button onClick={() => navigate('/dashboard/citizen')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Citizen Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/authority')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Authority Command Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/map')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Live Geospatial GIS Map
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Response Modules */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-200 text-[11px] font-mono uppercase tracking-widest">
              Emergency Modules
            </h4>
            <ul className="space-y-1.5 text-xs font-sans">
              <li>
                <button onClick={() => navigate('/report')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                  <Radio className="w-3 h-3" /> Report Emergency SOS
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/reports')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Incidents Feed Log
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shelters')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Evacuation Shelters
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/resources')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Resource Inventory
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-200 text-[11px] font-mono uppercase tracking-widest">
              Account & Security
            </h4>
            <ul className="space-y-1.5 text-xs font-sans">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Responder Sign In
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/signup')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Volunteer Registration
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/profile')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Medical ID Profile
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/settings')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Platform Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-stone-300 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 dark:text-stone-400 text-[11px] font-mono">
          <p>© 2026 ResQ AI Emergency Systems Inc. Built for National Disaster Response.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-sans">
              Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Emergency Responders
            </span>
            <button onClick={() => navigate('/')} className="hover:underline">
              System Architecture
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
