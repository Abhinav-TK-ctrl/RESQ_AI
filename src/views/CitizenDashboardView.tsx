import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CheckInStatus } from '../types';
import {
  Radio,
  ShieldAlert,
  Building,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CloudRain,
  Navigation,
  ArrowRight,
  PhoneCall,
  AlertTriangle,
  FileText,
  Activity,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_WEATHER } from '../data/mockData';
import { formatDate, calculateDistanceKm } from '../lib/utils';
import { KeralaWeatherCard } from '../components/common/KeralaWeatherCard';

export const CitizenDashboardView: React.FC = () => {
  const {
    incidents,
    activeIncidents,
    historicalIncidents,
    shelters,
    userLocation,
    reserveShelterSpot,
    navigate,
    triggerSos,
    activeSos,
    cancelSos,
    checkIns,
    updateCheckInStatus,
    addToast,
  } = useApp();

  const [reservingId, setReservingId] = useState<string | null>(null);

  const myCheckIn = checkIns.find((c) => c.id === 'chk-1') || checkIns[0];

  const sortedShelters = useMemo(() => {
    return [...shelters]
      .map((s) => ({
        ...s,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [shelters, userLocation]);

  const nearestShelters = sortedShelters.slice(0, 3);
  const closestOpenShelter = sortedShelters.find((s) => s.status !== 'full') || sortedShelters[0];

  const myReports = activeIncidents.filter(
    (i) =>
      i.reporter.role === 'citizen' ||
      i.isSosBroadcast ||
      i.reporter.name.toLowerCase() === 'you' ||
      i.reporter.name.toLowerCase().includes('rahul') ||
      i.reporter.name.toLowerCase().includes('arjun')
  );

  const handleReserve = (shelterId: string, shelterName: string) => {
    setReservingId(shelterId);
    setTimeout(() => {
      const success = reserveShelterSpot(shelterId, 1);
      setReservingId(null);
      if (success) {
        addToast(
          'Shelter Spot Reserved',
          `Reserved 1 spot at ${shelterName}. Live shelter capacity decremented.`,
          'success'
        );
      }
    }, 250);
  };

  const handleSetCheckInStatus = (newStatus: string) => {
    const formattedStatus: CheckInStatus =
      newStatus === 'safe'
        ? 'Marked Safe'
        : newStatus === 'at_location'
        ? 'Spot / At Same Location'
        : 'Assistance Needed';
    updateCheckInStatus(formattedStatus);
  };

  const isSafe = myCheckIn?.status === 'safe' || myCheckIn?.status === 'Marked Safe';
  const isAtLoc = myCheckIn?.status === 'at_location' || myCheckIn?.status === 'Spot / At Same Location';
  const selectValue = isSafe ? 'safe' : isAtLoc ? 'at_location' : 'needs_help';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 dark:bg-[#131317] text-stone-100 border border-stone-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wide">
            <Radio className="w-3.5 h-3.5" />
            <span>CITIZEN SAFETY PORTAL • SECTOR 2 CENTRAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Emergency Portal & Active Safety Status
          </h1>
          <p className="text-xs text-stone-400 font-sans leading-relaxed">
            Report emergencies, locate nearest evacuation shelters, track live weather alerts, and verify family safety.
          </p>
        </div>

        {/* SOS Action Module */}
        <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
          {!activeSos ? (
            <button
              onClick={triggerSos}
              className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm tracking-widest uppercase shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-3 border border-red-500"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>BROADCAST IMMEDIATE SOS</span>
            </button>
          ) : (
            <button
              onClick={cancelSos}
              className="px-6 py-4 rounded-xl bg-red-950 text-red-200 border-2 border-red-600 font-mono font-bold text-xs uppercase shadow-xl animate-pulse"
            >
              <span>SOS ACTIVE — CANCEL EMERGENCY</span>
            </button>
          )}
          <span className="text-[10px] text-stone-500 text-center font-mono">
            Direct 1-Tap GPS Dispatch to National Responders
          </span>
        </div>
      </div>

      {/* Live Kerala Monsoon Telemetry Card */}
      <KeralaWeatherCard />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Family Safety Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-mono uppercase">Family Check-In Status</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div>
              <span
                className={`text-base font-bold font-serif ${
                  isSafe
                    ? 'text-emerald-500'
                    : isAtLoc
                    ? 'text-blue-500'
                    : 'text-amber-500'
                }`}
              >
                {isSafe
                  ? 'Marked Safe'
                  : isAtLoc
                  ? 'Spot / At Location'
                  : 'Assistance Needed'}
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {myCheckIn?.familyCount ?? myCheckIn?.familyMembersCount ?? 4} Members • {myCheckIn?.location?.sector || myCheckIn?.sector || 'Meppadi Sector'}
              </p>
            </div>

            <select
              value={selectValue}
              onChange={(e) => handleSetCheckInStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200"
            >
              <option value="safe">✓ Marked Safe</option>
              <option value="at_location">📍 Spot / At Location</option>
              <option value="needs_help">🚨 Assistance Needed</option>
            </select>
          </div>
        </div>

        {/* Card 2: Local Weather & Surge */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-mono uppercase">River Level Surge</span>
            <CloudRain className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {INITIAL_WEATHER.riverLevel}m
              </span>
              <p className="text-[11px] text-red-500 font-mono mt-0.5">
                +1.2m above baseline • High Surge
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Local Shelter Capacity */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-mono uppercase">Nearest Open Shelter</span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-sm truncate text-zinc-900 dark:text-zinc-100">
              {closestOpenShelter?.name || 'Emergency Shelter'}
            </p>
            <p className="text-[11px] text-emerald-500 font-mono mt-0.5">
              {closestOpenShelter
                ? `${closestOpenShelter.capacity - closestOpenShelter.occupancy} Open Beds • ${closestOpenShelter.distanceKm} km away`
                : 'No shelters available'}
            </p>
          </div>
        </div>

        {/* Card 4: Emergency Hotline */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-mono uppercase">State Emergency Helpline</span>
            <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <p className="font-serif font-bold text-lg text-red-600 dark:text-red-500">1077 / 1070</p>
            <p className="text-[11px] text-stone-500 mt-0.5 font-mono">KSDMA 24/7 Toll Free Operations</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Nearest Shelters & Incident Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shelters Module */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-500" />
                  <span>Nearby Evacuation Shelters</span>
                </h3>
                <p className="text-xs text-zinc-500">Live capacity and amenities</p>
              </div>
              <button
                onClick={() => navigate('/shelters')}
                className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {nearestShelters.map((s) => {
                const spotsFree = s.capacity - s.occupancy;
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          <span>{s.distanceKm} km</span>
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            s.status === 'open'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{s.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-emerald-500">
                          {spotsFree} Spots Free
                        </p>
                        <p className="text-[10px] text-zinc-400">Cap: {s.capacity}</p>
                      </div>
                      <button
                        onClick={() => handleReserve(s.id, s.name)}
                        disabled={reservingId === s.id || spotsFree <= 0}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-sm transition-all flex items-center gap-1 ${
                          spotsFree <= 0
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {reservingId === s.id ? (
                          <span>Reserving...</span>
                        ) : spotsFree <= 0 ? (
                          <span>Full</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Reserve 1 Spot</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate('/shelters')}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizen's Reported Incidents */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>My Emergency Reports</span>
                </h3>
                <p className="text-xs text-zinc-500">Track real-time rescue status</p>
              </div>
              <button
                onClick={() => navigate('/report')}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm"
              >
                + New Report
              </button>
            </div>

            {myReports.length > 0 ? (
              <div className="space-y-3">
                {myReports.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => navigate('/reports')}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2 hover:border-orange-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {inc.title}
                        </span>
                        {inc.isSosBroadcast && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-500 font-bold border border-red-500/40 uppercase">
                            Distress Beacon
                          </span>
                        )}
                      </div>

                      {inc.status === 'unverified' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/40 uppercase">
                          Pending Authority Verification
                        </span>
                      ) : inc.status === 'dispatching' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 font-bold border border-blue-500/40 uppercase">
                          Rescue Dispatched
                        </span>
                      ) : inc.status === 'in_progress' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/40 uppercase">
                          Rescue In Progress
                        </span>
                      ) : inc.status === 'resolved' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 uppercase">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/40 uppercase">
                          ✓ Verified Public
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{inc.description}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-700/50">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{inc.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500 font-bold">Score: {inc.urgencyScore}</span>
                        <span>•</span>
                        <span>{formatDate(inc.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2">
                <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  No Active Reports Submitted
                </p>
                <p className="text-[11px] text-zinc-400">
                  If you spot localized flooding, road damage, or medical need, click below.
                </p>
                <button
                  onClick={() => navigate('/report')}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
                >
                  Submit Incident Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): AI Disaster Survival Tips & Weather */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                ResQ AI Safety Guidance
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-1">
                <p className="font-bold text-orange-600 dark:text-orange-400">
                  ⚠️ Flash Flood Rule #1
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Never drive or walk through moving water. Just 6 inches of fast-moving water can knock down an adult.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  💧 Clean Water Conservation
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Fill bathtubs and clean containers with fresh tap water immediately before power grid shutdowns.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  📱 Mobile Battery Saver
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Enable Low Power Mode and keep location services active for the ResQ AI SOS beacon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
