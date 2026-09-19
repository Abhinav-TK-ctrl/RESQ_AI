import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Building, MapPin, Phone, Check, ShieldCheck, Heart, Navigation, Search } from 'lucide-react';
import { calculateDistanceKm } from '../lib/utils';

export const SheltersView: React.FC = () => {
  const { shelters, reserveShelterSpot, userLocation, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [petsOnly, setPetsOnly] = useState(false);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservationCounts, setReservationCounts] = useState<Record<string, number>>({});

  const sortedShelters = useMemo(() => {
    return [...shelters]
      .map((s) => ({
        ...s,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [shelters, userLocation]);

  const filteredShelters = sortedShelters.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPets = !petsOnly || s.amenities.petsAllowed;
    return matchesSearch && matchesPets;
  });

  const handleReserve = (shelterId: string, shelterName: string) => {
    const count = reservationCounts[shelterId] || 1;
    setReservingId(shelterId);
    setTimeout(() => {
      const success = reserveShelterSpot(shelterId, count);
      setReservingId(null);
      if (success) {
        addToast(
          'Shelter Spot Reserved',
          `Reserved ${count} spot(s) at ${shelterName}. Live shelter capacity decremented.`,
          'success'
        );
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Evacuation Shelters Directory
            </h1>
            <p className="text-xs text-zinc-500">
              Verified emergency refuge centers with real-time bed capacity & amenities.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter shelters by name, neighborhood, or sector..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
            <input
              type="checkbox"
              checked={petsOnly}
              onChange={(e) => setPetsOnly(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Pet-Friendly Only 🐾</span>
          </label>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShelters.map((s) => {
          const occupancyPercent = Math.round((s.occupancy / s.capacity) * 100);
          const spotsAvailable = s.capacity - s.occupancy;

          return (
            <div
              key={s.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {s.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>{s.distanceKm} km away</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      s.status === 'open'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : s.status === 'near_capacity'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{s.address}</span>
              </p>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Capacity Status:</span>
                  <span className="font-bold text-emerald-500">
                    {spotsAvailable} Spots Free ({occupancyPercent}% full)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      occupancyPercent > 90
                        ? 'bg-red-500'
                        : occupancyPercent > 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Amenities Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {s.amenities.medical && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-mono">
                    🏥 Medical Station
                  </span>
                )}
                {s.amenities.food && (
                  <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded font-mono">
                    🍲 Hot Meals
                  </span>
                )}
                {s.amenities.power && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono">
                    ⚡ Power Generator
                  </span>
                )}
                {s.amenities.petsAllowed && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono">
                    🐾 Pet Friendly
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <a href={`tel:${s.contactPhone}`} className="hover:underline text-zinc-700 dark:text-zinc-300">
                    {s.contactPhone}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={reservationCounts[s.id] || 1}
                    onChange={(e) =>
                      setReservationCounts({
                        ...reservationCounts,
                        [s.id]: parseInt(e.target.value) || 1,
                      })
                    }
                    className="px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                  >
                    <option value={1}>1 Spot</option>
                    <option value={2}>2 Spots</option>
                    <option value={3}>3 Spots</option>
                    <option value={4}>4 Spots</option>
                    <option value={5}>5 Spots (Family)</option>
                  </select>

                  <button
                    onClick={() => handleReserve(s.id, s.name)}
                    disabled={reservingId === s.id || spotsAvailable <= 0}
                    className={`px-4 py-2 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ${
                      spotsAvailable <= 0
                        ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {reservingId === s.id ? (
                      <span>Reserving...</span>
                    ) : spotsAvailable <= 0 ? (
                      <span>Shelter Full</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Reserve Spot</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
