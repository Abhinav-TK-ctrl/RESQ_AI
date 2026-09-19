import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  MapPin,
  Building,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Code2,
  Check,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface CitizenResult {
  citizen_id: string;
  full_name: string;
  phone_number: string;
  district: string;
  distance_meters: number;
}

interface ShelterResult {
  shelter_id: string;
  name: string;
  address: string;
  contact_number: string;
  distance_meters: number;
}

interface HealthData {
  status: string;
  database: string;
  postgis: boolean;
  currentDatabase: string;
}

const PRESETS = [
  {
    name: 'Wayanad Chooralmala Hills',
    district: 'Wayanad',
    lat: 11.554,
    lon: 76.126,
    radiusKm: 10,
    type: 'Landslide Epicenter',
  },
  {
    name: 'Idukki Cheruthoni Spillway',
    district: 'Idukki',
    lat: 9.84,
    lon: 76.97,
    radiusKm: 15,
    type: 'Dam Water Surge',
  },
  {
    name: 'Aluva Manappuram Riverfront',
    district: 'Ernakulam',
    lat: 10.11,
    lon: 76.35,
    radiusKm: 10,
    type: 'River Inundation',
  },
  {
    name: 'Champakulam Kuttanad Basin',
    district: 'Alappuzha',
    lat: 9.5,
    lon: 76.34,
    radiusKm: 8,
    type: 'Backwater Flood',
  },
];

export const PostgisQueryTester: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Function 1 inputs
  const [alertLat, setAlertLat] = useState<number>(11.554);
  const [alertLon, setAlertLon] = useState<number>(76.126);
  const [alertDistrict, setAlertDistrict] = useState<string>('Wayanad');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [citizens, setCitizens] = useState<CitizenResult[]>([]);
  const [loadingCitizens, setLoadingCitizens] = useState<boolean>(false);
  const [citizenLatency, setCitizenLatency] = useState<number | null>(null);

  // Function 2 inputs
  const [citizenLat, setCitizenLat] = useState<number>(11.554);
  const [citizenLon, setCitizenLon] = useState<number>(76.126);
  const [shelterLimit, setShelterLimit] = useState<number>(2);
  const [shelters, setShelters] = useState<ShelterResult[]>([]);
  const [loadingShelters, setLoadingShelters] = useState<boolean>(false);
  const [shelterLatency, setShelterLatency] = useState<number | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'tester' | 'schema'>('tester');
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  // Fetch health on mount
  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn('Database health check failed:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    runCitizensQuery();
    runSheltersQuery();
  }, []);

  // Run Function 1: get_citizens_for_alert
  const runCitizensQuery = async (
    customLat?: number,
    customLon?: number,
    customDist?: string,
    customRadius?: number
  ) => {
    const lat = customLat ?? alertLat;
    const lon = customLon ?? alertLon;
    const dist = customDist ?? alertDistrict;
    const rad = customRadius ?? radiusKm;

    setLoadingCitizens(true);
    const start = performance.now();
    try {
      const res = await fetch(
        `/api/proximity/citizens?lat=${lat}&lon=${lon}&district=${encodeURIComponent(
          dist
        )}&radius_km=${rad}`
      );
      const data = await res.json();
      setCitizenLatency(Math.round(performance.now() - start));
      if (data.success && data.citizens) {
        setCitizens(data.citizens);
      }
    } catch (err) {
      console.error('Citizens query error:', err);
    } finally {
      setLoadingCitizens(false);
    }
  };

  // Run Function 2: get_nearest_shelters
  const runSheltersQuery = async (customLat?: number, customLon?: number, customLimit?: number) => {
    const lat = customLat ?? citizenLat;
    const lon = customLon ?? citizenLon;
    const lim = customLimit ?? shelterLimit;

    setLoadingShelters(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/proximity/nearest-shelters?lat=${lat}&lon=${lon}&limit=${lim}`);
      const data = await res.json();
      setShelterLatency(Math.round(performance.now() - start));
      if (data.success && data.shelters) {
        setShelters(data.shelters);
      }
    } catch (err) {
      console.error('Shelters query error:', err);
    } finally {
      setLoadingShelters(false);
    }
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setAlertLat(preset.lat);
    setAlertLon(preset.lon);
    setAlertDistrict(preset.district);
    setRadiusKm(preset.radiusKm);

    setCitizenLat(preset.lat);
    setCitizenLon(preset.lon);

    runCitizensQuery(preset.lat, preset.lon, preset.district, preset.radiusKm);
    runSheltersQuery(preset.lat, preset.lon, shelterLimit);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(id);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Cloud SQL + PostGIS Status */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white border border-stone-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CLOUD SQL POSTGIS 3.5 ACTIVE</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-700/60 text-stone-300 text-[10px] font-mono">
                Region: asia-southeast1
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-700/60 text-stone-300 text-[10px] font-mono">
                PostgreSQL 17 Developer Edition
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>PostGIS Geospatial Distance & Geofence Engine</span>
            </h2>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Spatial computations execute directly within Cloud SQL PostgreSQL using indexed{' '}
              <code className="text-emerald-300">geography(Point, 4326)</code> coordinates with GiST
              indexing for sub-millisecond geofencing and nearest-shelter routing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-stone-800/80 p-1 rounded-xl border border-stone-700 text-xs font-mono">
              <button
                onClick={() => setActiveSubTab('tester')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubTab === 'tester'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Interactive Tester
              </button>
              <button
                onClick={() => setActiveSubTab('schema')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubTab === 'schema'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Schema & Functions
              </button>
            </div>
            <button
              onClick={checkHealth}
              disabled={loadingHealth}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition-all"
              title="Refresh database connection status"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'tester' ? (
        <div className="space-y-6">
          {/* Quick Disaster Location Presets */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <p className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-2.5">
              Quick Test Kerala Disaster Presets:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs font-mono ${
                    alertDistrict === p.district
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-stone-900 dark:text-stone-100'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {p.district}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">{p.type}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {p.lat.toFixed(4)}°N, {p.lon.toFixed(4)}°E • Radius: {p.radiusKm}km
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Function 1: get_citizens_for_alert */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                        Function 1: get_citizens_for_alert
                      </h3>
                      <p className="text-[11px] font-mono text-stone-500">
                        Find citizens within 10 km OR same district
                      </p>
                    </div>
                  </div>
                  {citizenLatency !== null && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{citizenLatency} ms</span>
                    </span>
                  )}
                </div>

                {/* Input Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={alertLat}
                      onChange={(e) => setAlertLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={alertLon}
                      onChange={(e) => setAlertLon(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">District</label>
                    <input
                      type="text"
                      value={alertDistrict}
                      onChange={(e) => setAlertDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Radius (km)</label>
                    <input
                      type="number"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(parseFloat(e.target.value) || 10)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runCitizensQuery()}
                    disabled={loadingCitizens}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>
                      {loadingCitizens ? 'Executing PostGIS Query...' : 'Run get_citizens_for_alert'}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `SELECT * FROM get_citizens_for_alert(${alertLat}, ${alertLon}, '${alertDistrict}', ${
                          radiusKm * 1000
                        });`,
                        'q1'
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-mono flex items-center gap-1"
                    title="Copy SQL statement"
                  >
                    {copiedQuery === 'q1' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5" />
                    )}
                    <span>SQL</span>
                  </button>
                </div>

                {/* SQL Snippet preview */}
                <div className="p-2.5 rounded-xl bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto border border-stone-800">
                  <span className="text-blue-400">SELECT</span> *{' '}
                  <span className="text-blue-400">FROM</span>{' '}
                  <span className="text-emerald-400">get_citizens_for_alert</span>(
                  <span className="text-amber-300">{alertLat}</span>,{' '}
                  <span className="text-amber-300">{alertLon}</span>, '
                  <span className="text-emerald-300">{alertDistrict}</span>',{' '}
                  <span className="text-amber-300">{radiusKm * 1000}</span>);
                </div>

                {/* Results Table */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500">
                      Matched Citizens (PostGIS DWithin / District):
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {citizens.length} records found
                    </span>
                  </div>

                  {citizens.length === 0 ? (
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-center text-xs text-stone-500 font-mono">
                      No citizens registered within this radius or district.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {citizens.map((c) => (
                        <div
                          key={c.citizen_id}
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">
                              {c.full_name}
                            </p>
                            <p className="text-[11px] text-stone-500 flex items-center gap-2">
                              <span>{c.phone_number}</span>
                              <span>•</span>
                              <span>{c.district}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px]">
                              {(c.distance_meters / 1000).toFixed(2)} km
                            </span>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {Math.round(c.distance_meters)} m
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Function 2: get_nearest_shelters */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                        Function 2: get_nearest_shelters
                      </h3>
                      <p className="text-[11px] font-mono text-stone-500">
                        KNN GiST spatial search (operator &lt;-&gt;)
                      </p>
                    </div>
                  </div>
                  {shelterLatency !== null && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{shelterLatency} ms</span>
                    </span>
                  )}
                </div>

                {/* Input Controls */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Citizen Lat</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={citizenLat}
                      onChange={(e) => setCitizenLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Citizen Lon</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={citizenLon}
                      onChange={(e) => setCitizenLon(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Limit</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={shelterLimit}
                      onChange={(e) => setShelterLimit(parseInt(e.target.value, 10) || 2)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runSheltersQuery()}
                    disabled={loadingShelters}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>
                      {loadingShelters ? 'Executing KNN Query...' : 'Run get_nearest_shelters'}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `SELECT * FROM get_nearest_shelters(${citizenLat}, ${citizenLon}, ${shelterLimit});`,
                        'q2'
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-mono flex items-center gap-1"
                    title="Copy SQL statement"
                  >
                    {copiedQuery === 'q2' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5" />
                    )}
                    <span>SQL</span>
                  </button>
                </div>

                {/* SQL Snippet preview */}
                <div className="p-2.5 rounded-xl bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto border border-stone-800">
                  <span className="text-blue-400">SELECT</span> *{' '}
                  <span className="text-blue-400">FROM</span>{' '}
                  <span className="text-blue-400">get_nearest_shelters</span>(
                  <span className="text-amber-300">{citizenLat}</span>,{' '}
                  <span className="text-amber-300">{citizenLon}</span>,{' '}
                  <span className="text-amber-300">{shelterLimit}</span>);
                </div>

                {/* Results Table */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500">Nearest Safe Spots (PostGIS ST_Distance):</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {shelters.length} nearest shelters
                    </span>
                  </div>

                  {shelters.length === 0 ? (
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-center text-xs text-stone-500 font-mono">
                      No safe spots returned.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {shelters.map((s, idx) => (
                        <div
                          key={s.shelter_id}
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                                #{idx + 1}
                              </span>
                              <span>{s.name}</span>
                            </p>
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate max-w-[260px]">
                              {s.address}
                            </p>
                            <p className="text-[10px] text-stone-400">{s.contact_number}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                              {(s.distance_meters / 1000).toFixed(2)} km
                            </span>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {Math.round(s.distance_meters)} m
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Schema & SQL Definitions Tab */
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                PostgreSQL + PostGIS Database Architecture
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Instance: resq-db • Engine: PostgreSQL 17 • Extension: postgis (extensions schema)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Applied to Cloud SQL</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 font-mono text-xs space-y-2">
              <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Database Tables Created</span>
              </p>
              <ul className="space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                <li>
                  <code className="text-emerald-600 dark:text-emerald-400">public.profiles</code> :
                  Citizen/Authority with PostGIS geography point
                </li>
                <li>
                  <code className="text-emerald-600 dark:text-emerald-400">public.shelters</code> :
                  Safe spots with capacity, phone, geography point
                </li>
                <li>
                  <code className="text-emerald-600 dark:text-emerald-400">public.alerts</code> :
                  Disaster warning records with radius & epicenter
                </li>
                <li>
                  <code className="text-emerald-600 dark:text-emerald-400">auth.users</code> :
                  Authentication identity records schema
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 font-mono text-xs space-y-2">
              <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Spatial Indexing & Functions</span>
              </p>
              <ul className="space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
                <li>
                  <code className="text-amber-600 dark:text-amber-400">idx_profiles_location</code>{' '}
                  : GiST index on profiles.location
                </li>
                <li>
                  <code className="text-amber-600 dark:text-amber-400">idx_shelters_location</code>{' '}
                  : GiST index on shelters.location
                </li>
                <li>
                  <code className="text-blue-600 dark:text-blue-400">get_citizens_for_alert</code> :
                  ST_Distance & ST_DWithin 10 km geofence
                </li>
                <li>
                  <code className="text-blue-600 dark:text-blue-400">get_nearest_shelters</code> :
                  KNN operator (&lt;-&gt;) nearest 2 safe spots
                </li>
              </ul>
            </div>
          </div>

          {/* Stored procedure code display */}
          <div className="p-4 rounded-2xl bg-stone-950 text-stone-300 font-mono text-xs border border-stone-800 overflow-x-auto">
            <p className="text-stone-400 text-[11px] mb-2 font-bold uppercase">
              Proximity Function 1 (get_citizens_for_alert):
            </p>
            <pre className="text-[11px] leading-relaxed text-emerald-300">
              {`create or replace function get_citizens_for_alert(
  alert_lat double precision,
  alert_lon double precision,
  alert_district text,
  radius_meters double precision default 10000
) returns table (citizen_id uuid, full_name text, phone_number text, district text, distance_meters double precision)
language sql as $$
  select id, full_name, phone_number, district,
         extensions.st_distance(location, extensions.st_point(alert_lon, alert_lat)::extensions.geography) as distance_meters
  from public.profiles
  where role = 'citizen'
    and (district = alert_district 
         or extensions.st_dwithin(location, extensions.st_point(alert_lon, alert_lat)::extensions.geography, radius_meters));
$$;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
