import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CloudRain,
  AlertTriangle,
  MapPin,
  Building,
  PhoneCall,
  Navigation,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const StateMonsoonBanner: React.FC = () => {
  const {
    monsoonAlert,
    userLocation,
    nearestShelter,
    reserveShelterSpot,
    requestUserLocation,
    navigate,
    addToast,
  } = useApp();

  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  if (!monsoonAlert || !monsoonAlert.active) return null;

  const getAlertColorClasses = (level: string) => {
    const lvl = (level || '').toLowerCase();
    if (lvl.includes('red')) {
      return {
        bg: 'bg-red-950/90 dark:bg-red-950/95',
        border: 'border-red-600/80 dark:border-red-500/70',
        badge: 'bg-red-600 text-white shadow-red-950/50',
        text: 'text-red-400',
        lightBg: 'bg-red-900/30',
      };
    }
    if (lvl.includes('orange')) {
      return {
        bg: 'bg-amber-950/90 dark:bg-amber-950/95',
        border: 'border-amber-600/80 dark:border-amber-500/70',
        badge: 'bg-amber-600 text-white shadow-amber-950/50',
        text: 'text-amber-400',
        lightBg: 'bg-amber-900/30',
      };
    }
    return {
      bg: 'bg-yellow-950/90 dark:bg-yellow-950/95',
      border: 'border-yellow-600/80 dark:border-yellow-500/70',
      badge: 'bg-yellow-600 text-stone-950 shadow-yellow-950/50',
      text: 'text-yellow-400',
      lightBg: 'bg-yellow-900/30',
    };
  };

  const colors = getAlertColorClasses(monsoonAlert.level);

  const affectedDistrictsList: string[] =
    monsoonAlert.affectedDistricts && monsoonAlert.affectedDistricts.length > 0
      ? monsoonAlert.affectedDistricts
      : monsoonAlert.districts && monsoonAlert.districts.length > 0
      ? monsoonAlert.districts
      : ['Wayanad', 'Idukki', 'Kozhikode', 'Alappuzha', 'Thrissur', 'Ernakulam'];

  const safetyAdvisoriesList: string[] =
    monsoonAlert.safetyAdvisories && monsoonAlert.safetyAdvisories.length > 0
      ? monsoonAlert.safetyAdvisories
      : [
          'Evacuate vulnerable riverbanks and landslide slopes to nearest relief camps',
          'Avoid nighttime vehicular travel through mountain Ghat roads',
          'Emergency helpline 1077 active 24x7 across all 14 DEOCs',
        ];

  const rainfallMm = monsoonAlert.rainfallMm ?? 210;

  const handleQuickReserve = () => {
    if (!nearestShelter) return;
    setReserving(true);
    setTimeout(() => {
      const success = reserveShelterSpot(nearestShelter.shelter.id, 1);
      setReserving(false);
      if (success) {
        setReserved(true);
        addToast(
          'Shelter Spot Reserved',
          `1 spot held at ${nearestShelter.shelter.name}. Capacity updated in real-time.`,
          'success'
        );
      }
    }, 400);
  };

  const remainingSpots = nearestShelter
    ? nearestShelter.shelter.capacity - nearestShelter.shelter.occupancy
    : 0;

  return (
    <div
      className={`w-full rounded-2xl border ${colors.border} ${colors.bg} text-stone-100 p-5 shadow-2xl relative overflow-hidden transition-all duration-300`}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
        {/* Left Column: Monsoon Alert Telemetry */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow ${colors.badge}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>STATE MONSOON {monsoonAlert.level} ALERT</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-stone-900/70 border border-stone-700 text-stone-300 text-[11px] font-mono flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Rainfall: {rainfallMm}mm (24h)</span>
            </span>

            {/* GPS Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900/70 border border-stone-700 text-[11px] font-mono text-stone-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate max-w-[180px]">
                {userLocation.gpsActive ? userLocation.sector : 'GPS: Kerala Active'}
              </span>
              <button
                onClick={requestUserLocation}
                title="Refresh GPS location"
                className="hover:text-stone-100 ml-1 text-stone-400"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
              <span>Kerala State Monsoon & Flood Warning</span>
            </h2>
            <p className="text-xs text-stone-300 font-sans mt-1">
              <strong className="text-stone-200">Affected High-Risk Districts:</strong>{' '}
              {affectedDistrictsList.join(', ')}
            </p>
          </div>

          {/* Safety Advisories List */}
          <div className="flex flex-wrap gap-2 pt-1">
            {safetyAdvisoriesList.map((advisory, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-stone-900/60 border border-stone-700/80 text-stone-300 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                <span>{advisory}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Closest Evacuation Shelter Card */}
        {nearestShelter && (
          <div className="w-full lg:w-96 shrink-0 p-4 rounded-xl bg-stone-900/95 border border-stone-700/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 animate-bounce" />
                <span>NEAREST EVACUATION SHELTER</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                {nearestShelter.distanceKm} km away
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-stone-100 leading-snug">
                {nearestShelter.shelter.name}
              </h3>
              <p className="text-xs text-stone-400 flex items-center gap-1 font-sans">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{nearestShelter.shelter.address}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
              <div>
                <span className="text-stone-400 text-[10px] block">REMAINING CAPACITY</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {remainingSpots} / {nearestShelter.shelter.capacity} spots
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block">HELPLINE CONTACT</span>
                <a
                  href={`tel:${nearestShelter.shelter.contactPhone}`}
                  className="font-bold text-blue-400 hover:underline flex items-center gap-1 text-xs"
                >
                  <PhoneCall className="w-3 h-3 shrink-0" />
                  <span className="truncate">{nearestShelter.shelter.contactPhone}</span>
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleQuickReserve}
                disabled={reserving || reserved || remainingSpots <= 0}
                className={`flex-1 py-2 px-3 rounded-lg font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                  reserved
                    ? 'bg-emerald-700 text-white cursor-default'
                    : remainingSpots <= 0
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {reserved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Spot Reserved!</span>
                  </>
                ) : reserving ? (
                  <span>Reserving...</span>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Reserve 1 Spot</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/shelters')}
                className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-serif font-bold text-xs flex items-center justify-center gap-1"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
