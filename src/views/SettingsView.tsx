import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, WifiOff, Volume2, Moon, Sun, Bell, Shield, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [lowDataMode, setLowDataMode] = useState(true);
  const [offlinePwa, setOfflinePwa] = useState(true);
  const [soundAlarms, setSoundAlarms] = useState(true);
  const [sectorSubscription, setSectorSubscription] = useState('Sector 2 Central');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Settings Saved', 'ResQ AI preferences updated locally', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Platform & Bandwidth Settings
          </h1>
        </div>
        <p className="text-xs text-zinc-500">
          Configure offline caching, audio warning sirens, and low-latency network protocols.
        </p>

        <form onSubmit={handleSave} className="space-y-6 pt-2">
          {/* Theme */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-orange-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Appearance Mode
              </span>
              <p className="text-xs text-zinc-500">
                Switch between high-contrast dark mode and clean light layout.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-bold rounded-xl"
            >
              Toggle {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Low-Bandwidth Mode */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-emerald-500" />
                Low-Bandwidth Compression Mode
              </span>
              <p className="text-xs text-zinc-500">
                Compresses incoming photos and streams vector map tiles for 2G/3G connectivity.
              </p>
            </div>
            <input
              type="checkbox"
              checked={lowDataMode}
              onChange={(e) => setLowDataMode(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
          </div>

          {/* Offline PWA Sync */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Offline IndexedDB Cache
              </span>
              <p className="text-xs text-zinc-500">
                Saves shelter maps & medical ID on mobile device when cellular signal drops.
              </p>
            </div>
            <input
              type="checkbox"
              checked={offlinePwa}
              onChange={(e) => setOfflinePwa(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
          </div>

          {/* Sector Subscription */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              Primary Sector Warning Alerts
            </span>
            <select
              value={sectorSubscription}
              onChange={(e) => setSectorSubscription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="Sector 1 North">Sector 1 North</option>
              <option value="Sector 2 Central">Sector 2 Central</option>
              <option value="Sector 4 Riverside">Sector 4 Riverside</option>
              <option value="Sector 8 Coast">Sector 8 Coast</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>
    </div>
  );
};
