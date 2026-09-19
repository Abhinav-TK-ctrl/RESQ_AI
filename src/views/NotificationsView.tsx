import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ShieldAlert, CheckCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, addToast } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = notifications.filter(
    (n) => filterSeverity === 'all' || n.severity === filterSeverity
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                Real-Time Emergency Alert Logs
              </h1>
              <p className="text-xs text-zinc-500">
                Geotargeted warning broadcasts from National Command & ResQ AI AI Engine.
              </p>
            </div>
          </div>

          <button
            onClick={() => addToast('Notifications Cleared', 'All alerts marked as read', 'info')}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex gap-2 text-xs font-mono font-bold pt-2">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterSeverity === 'all'
                ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            ALL LOGS ({notifications.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterSeverity === 'critical'
                ? 'bg-red-500/10 border-red-500 text-red-400'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            CRITICAL ONLY
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterSeverity === 'warning'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            WARNINGS
          </button>
        </div>
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              !n.read
                ? 'bg-orange-500/5 border-orange-500/40 shadow-sm'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {n.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      n.severity === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {n.severity}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                  <span>Sender: {n.sender}</span>
                  <span>•</span>
                  <span>{n.targetSector}</span>
                  <span>•</span>
                  <span>{formatDate(n.timestamp)}</span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
