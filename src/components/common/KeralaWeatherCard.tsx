import React from 'react';
import { CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { INITIAL_WEATHER } from '../../data/mockData';

export const KeralaWeatherCard: React.FC = () => {
  const districtsAlerts = [
    { name: 'Wayanad', alert: 'Red Alert', rain: '240 mm', status: 'Landslide Risk' },
    { name: 'Alappuzha (Kuttanad)', alert: 'Red Alert', rain: '198 mm', status: 'Waterlogging' },
    { name: 'Idukki', alert: 'Red Alert', rain: '215 mm', status: 'Dam Water Level High' },
    { name: 'Thrissur (Chalakudy)', alert: 'Orange Alert', rain: '165 mm', status: 'River Overflow' },
    { name: 'Kozhikode', alert: 'Orange Alert', rain: '150 mm', status: 'Heavy Rainfall' },
    { name: 'Ernakulam', alert: 'Yellow Alert', rain: '110 mm', status: 'Coastal Surge' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> STATE MONSOON ALERT
            </span>
            <span className="text-[11px] font-mono text-stone-400">KSDMA Hydrological Data</span>
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-100 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <span>Kerala Monsoon & River Level Telemetry</span>
          </h3>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          <span>RED ALERT IN 5 DISTRICTS</span>
        </div>
      </div>

      {/* Primary Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>24H Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{INITIAL_WEATHER.rainfall24h} mm</p>
          <span className="text-[10px] text-red-400 font-mono font-bold">+45mm from yesterday</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>River Level Surge</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-serif font-bold text-orange-400">{INITIAL_WEATHER.riverLevel}m</p>
          <span className="text-[10px] text-stone-400 font-mono">+3.8m above danger mark</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>Wind Velocity</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{INITIAL_WEATHER.windSpeed}</p>
          <span className="text-[10px] text-cyan-400 font-mono">Strong South-West Gale</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-blue-300" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{INITIAL_WEATHER.humidity}</p>
          <span className="text-[10px] text-stone-400 font-mono">Near Saturation</span>
        </div>
      </div>

      {/* District Warning Grid */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
          District-wise Warning Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {districtsAlerts.map((d, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-700/40 flex items-center justify-between text-xs font-sans"
            >
              <div>
                <p className="font-serif font-bold text-stone-200">{d.name}</p>
                <p className="text-[10px] text-stone-400 font-mono">{d.status}</p>
              </div>
              <div className="text-right">
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    d.alert === 'Red Alert'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : d.alert === 'Orange Alert'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {d.alert}
                </span>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">{d.rain}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
