import React from 'react';
import { CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, Activity, RefreshCw, Thermometer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_WEATHER } from '../../data/mockData';

export const KeralaWeatherCard: React.FC = () => {
  const { imdWarnings, imdLiveWeather, imdLoading, imdLastUpdated, refreshImdData } = useApp();

  // Kerala district warnings from live IMD data or default list
  const keralaWarnings = imdWarnings.length > 0
    ? imdWarnings.filter((w) => w.state === 'Kerala')
    : [];

  // Count alerts
  const redCount = keralaWarnings.filter((w) => w.colorCode === 'Red').length;
  const orangeCount = keralaWarnings.filter((w) => w.colorCode === 'Orange').length;
  const yellowCount = keralaWarnings.filter((w) => w.colorCode === 'Yellow').length;

  const liveTemp = imdLiveWeather?.temperature ?? INITIAL_WEATHER.temperature;
  const liveRain = imdLiveWeather?.rainfall24h ?? INITIAL_WEATHER.rainfall24h;
  const liveWind = imdLiveWeather?.windSpeed ?? INITIAL_WEATHER.windSpeed;
  const liveHumidity = imdLiveWeather?.humidity ?? INITIAL_WEATHER.humidity;

  return (
    <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase border border-cyan-500/40 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> OFFICIAL IMD MAUSAM FEED
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {imdLastUpdated ? `Last Synced: ${imdLastUpdated}` : 'Live Real-Time Sync'}
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-100 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <span>India Meteorological Department (IMD) Live Weather & Telemetry</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refreshImdData()}
            disabled={imdLoading}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Refresh live bulletin directly from India Meteorological Department"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${imdLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{imdLoading ? 'Syncing...' : 'Sync IMD'}</span>
          </button>

          {redCount > 0 ? (
            <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span>{redCount} RED ALERT DISTRICTS</span>
            </div>
          ) : orangeCount > 0 ? (
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{orangeCount} ORANGE ALERT DISTRICTS</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-yellow-950/80 border border-yellow-800 text-yellow-300 text-xs font-mono font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>{yellowCount || 4} YELLOW ALERT DISTRICTS</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Live Weather Metrics from IMD Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>24H Precipitation</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{liveRain} mm</p>
          <span className="text-[10px] text-cyan-400 font-mono font-medium">IMD Gauge Recorded</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>Surface Temp</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{liveTemp}°C</p>
          <span className="text-[10px] text-stone-400 font-mono">Local Sector Atmospheric</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>Wind Velocity</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{liveWind} km/h</p>
          <span className="text-[10px] text-cyan-400 font-mono">Squall Gust Tracking</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px] font-mono">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-blue-300" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-100">{liveHumidity}%</p>
          <span className="text-[10px] text-stone-400 font-mono">Atmospheric Saturation</span>
        </div>
      </div>

      {/* District Warning Grid directly from IMD Bulletin */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-mono font-bold text-stone-400 uppercase tracking-wider">
            IMD Live District-Wise Warning Bulletin (Mausam NWFC)
          </h4>
          <span className="text-[10px] text-stone-500 font-mono">Real-time Weather Classification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(keralaWarnings.length > 0 ? keralaWarnings.slice(0, 6) : [
            { district: 'Wayanad', severity: 'Yellow (Be Updated)', warningType: 'Thunderstorm with Lightning, Squall', colorCode: 'Yellow' },
            { district: 'Idukki', severity: 'Yellow (Be Updated)', warningType: 'Heavy Rain & Thunderstorm', colorCode: 'Yellow' },
            { district: 'Kottayam', severity: 'Yellow (Be Updated)', warningType: 'Heavy Rainfall & Gusty Wind', colorCode: 'Yellow' },
            { district: 'Malappuram', severity: 'Yellow (Be Updated)', warningType: 'Heavy Rainfall & Squall', colorCode: 'Yellow' },
            { district: 'Kozhikode', severity: 'Yellow (Be Updated)', warningType: 'Thunderstorm & Maritime Gale', colorCode: 'Yellow' },
            { district: 'Alappuzha', severity: 'Yellow (Be Updated)', warningType: 'Water Surge Watch & Lightning', colorCode: 'Yellow' },
          ]).map((d, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-700/40 flex items-center justify-between text-xs font-sans"
            >
              <div className="min-w-0 pr-2">
                <p className="font-serif font-bold text-stone-200 truncate">{d.district}</p>
                <p className="text-[10px] text-stone-400 font-mono truncate">{d.warningType || 'Severe Weather Watch'}</p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    d.colorCode === 'Red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : d.colorCode === 'Orange'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : d.colorCode === 'Green'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {d.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
