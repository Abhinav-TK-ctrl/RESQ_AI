import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { IncidentReport, Shelter, Volunteer } from '../types';
import {
  MapPin,
  Building,
  ShieldAlert,
  Navigation,
  Compass,
  Zap,
  Layers,
  Users,
  Radio,
  Sparkles,
  Info,
  Clock,
  CloudRain,
  AlertTriangle,
} from 'lucide-react';
import { AiAnalysisPanel } from '../components/common/AiAnalysisPanel';

export const MapView: React.FC = () => {
  const { incidents, shelters, volunteers, addToast, navigate } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'all' | 'disasters' | 'shelters' | 'volunteers'>('all');
  const [mapTile, setMapTile] = useState<'dark' | 'street'>('dark');
  const [selectedPin, setSelectedPin] = useState<{
    type: 'incident' | 'shelter' | 'volunteer';
    item: any;
  } | null>({
    type: 'incident',
    item: incidents[0],
  });

  const KERALA_CENTER: [number, number] = [10.8505, 76.2711];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KERALA_CENTER,
      zoom: 8,
      zoomControl: true,
    });

    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const streetTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(mapTile === 'dark' ? darkTileUrl : streetTileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors & CartoDB',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerGroupRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Tile Theme Switching
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const streetTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(mapTile === 'dark' ? darkTileUrl : streetTileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors & CartoDB',
    }).addTo(map);
  }, [mapTile]);

  // Update Markers on Layer / Data Change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;
    const markersGroup = markersLayerGroupRef.current;
    markersGroup.clearLayers();

    // Helper to generate DivIcon
    const createCustomIcon = (
      bgColor: string,
      emojiOrText: string,
      ringColor: string = 'ring-stone-900',
      isPulse: boolean = false
    ) => {
      return L.divIcon({
        className: 'custom-leaflet-marker-pin',
        html: `
          <div class="relative flex items-center justify-center">
            ${isPulse ? `<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${bgColor} opacity-60"></span>` : ''}
            <div class="w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center font-bold text-xs shadow-xl border-2 border-stone-900 ${ringColor} transition-transform hover:scale-115">
              ${emojiOrText}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    };

    // Add Incidents Markers
    if (activeLayer === 'all' || activeLayer === 'disasters') {
      incidents.forEach((inc) => {
        if (!inc?.location || typeof inc.location.lat !== 'number' || typeof inc.location.lng !== 'number') return;
        let pinColor = 'bg-red-600';
        let symbol = '🔴';

        if (inc.category === 'landslide') {
          pinColor = 'bg-amber-600';
          symbol = '🟠';
        } else if (inc.category === 'road_blockage' || inc.category === 'tree_collapse') {
          pinColor = 'bg-yellow-600';
          symbol = '🟡';
        } else if (inc.category === 'power_line') {
          pinColor = 'bg-purple-600';
          symbol = '⚡';
        }

        const marker = L.marker([inc.location.lat, inc.location.lng], {
          icon: createCustomIcon(pinColor, symbol, 'ring-red-500', inc.severity === 'critical'),
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 220px; font-size: 12px; color: #1c1917;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
              <span style="font-weight: 800; text-transform: uppercase; font-size: 10px; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">
                ${inc.category.replace('_', ' ')}
              </span>
              <span style="font-weight: 700; font-size: 10px; color: #78716c;">
                Urgency: ${inc.urgencyScore || 95}/100
              </span>
            </div>
            <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 4px 0;">${inc.title}</h4>
            <p style="margin: 0 0 8px 0; color: #57534e; line-height: 1.4;">${inc.description.slice(0, 100)}...</p>
            <div style="font-size: 10px; font-family: monospace; color: #78716c; background: #f5f5f4; padding: 4px 6px; border-radius: 4px;">
              📍 ${inc.location.address}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'incident', item: inc });
        });
        markersGroup.addLayer(marker);
      });
    }

    // Add Shelters Markers
    if (activeLayer === 'all' || activeLayer === 'shelters') {
      shelters.forEach((s) => {
        const sLat = typeof s?.lat === 'number' ? s.lat : (s as any)?.location?.lat;
        const sLng = typeof s?.lng === 'number' ? s.lng : (s as any)?.location?.lng;
        if (typeof sLat !== 'number' || typeof sLng !== 'number') return;
        const freeSpots = s.capacity - s.occupancy;
        const marker = L.marker([sLat, sLng], {
          icon: createCustomIcon('bg-emerald-600', '🟢', 'ring-emerald-400'),
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px; font-size: 12px; color: #1c1917;">
            <span style="font-weight: 800; font-size: 10px; color: #059669; background: #d1fae5; padding: 2px 6px; border-radius: 4px;">
              RELIEF CAMP
            </span>
            <h4 style="font-weight: 700; font-size: 13px; margin: 4px 0;">${s.name}</h4>
            <p style="margin: 0 0 6px 0; color: #059669; font-weight: 700;">${freeSpots} Beds Available</p>
            <div style="font-size: 10px; color: #57534e;">${s.address}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'shelter', item: s });
        });
        markersGroup.addLayer(marker);
      });
    }

    // Add Volunteers Markers
    if (activeLayer === 'all' || activeLayer === 'volunteers') {
      volunteers.forEach((v) => {
        if (!v?.location || typeof v.location.lat !== 'number' || typeof v.location.lng !== 'number') return;
        const marker = L.marker([v.location.lat, v.location.lng], {
          icon: createCustomIcon('bg-blue-600', '🔵', 'ring-blue-400'),
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px; font-size: 12px; color: #1c1917;">
            <span style="font-weight: 800; font-size: 10px; color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 4px;">
              VOLUNTEER RESPONDER
            </span>
            <h4 style="font-weight: 700; font-size: 13px; margin: 4px 0;">${v.name}</h4>
            <p style="margin: 0; color: #57534e; font-size: 11px;">${v.roleTitle}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'volunteer', item: v });
        });
        markersGroup.addLayer(marker);
      });
    }
  }, [activeLayer, incidents, shelters, volunteers]);

  const handleRecenterKerala = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(KERALA_CENTER, 8, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Map Control Header */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Kerala Interactive Disaster & Rescue Map
              </h1>
              <span className="px-2 py-0.5 rounded bg-red-600/10 text-red-600 dark:text-red-400 font-mono text-[10px] font-bold border border-red-500/30">
                LIVE LEAFLET GIS
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Center: 10.8505° N, 76.2711° E • OpenStreetMap Engine • Meppadi, Kuttanad, Chalakudy, Nilambur
            </p>
          </div>
        </div>

        {/* Map Controls & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Filter Buttons */}
          <div className="flex gap-1 p-1 bg-stone-200 dark:bg-zinc-800 rounded-xl text-xs font-mono font-bold">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'all'
                  ? 'bg-white dark:bg-stone-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              ALL (14)
            </button>
            <button
              onClick={() => setActiveLayer('disasters')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'disasters'
                  ? 'bg-white dark:bg-stone-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              🔴 DISASTERS
            </button>
            <button
              onClick={() => setActiveLayer('shelters')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'shelters'
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              🟢 CAMPS
            </button>
            <button
              onClick={() => setActiveLayer('volunteers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'volunteers'
                  ? 'bg-white dark:bg-stone-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              🔵 RESCUERS
            </button>
          </div>

          {/* Map Tile Theme Switcher */}
          <div className="flex gap-1 p-1 bg-stone-200 dark:bg-zinc-800 rounded-xl text-xs font-mono">
            <button
              onClick={() => setMapTile('dark')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                mapTile === 'dark'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Dark Map
            </button>
            <button
              onClick={() => setMapTile('street')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                mapTile === 'street'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Street Map
            </button>
          </div>

          <button
            onClick={handleRecenterKerala}
            className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 dark:hover:bg-zinc-700 text-xs font-mono font-bold text-stone-800 dark:text-stone-200"
          >
            Reset Center
          </button>
        </div>
      </div>

      {/* Main Interactive Map Stage & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[680px]">
        {/* Interactive OpenStreetMap Container (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden shadow-xl flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full z-10"></div>

          {/* Map Legend HUD Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-stone-900/95 text-stone-100 border border-stone-800 p-3 rounded-xl text-[11px] font-mono backdrop-blur-md shadow-2xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              <span>🔴 Flood</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
              <span>🟠 Landslide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-600 inline-block"></span>
              <span>🟡 Road Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span>🟢 Relief Camp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
              <span>🔵 Rescuer</span>
            </div>
          </div>
        </div>

        {/* Selected Pin GIS Detail & AI Panel Sidebar (1 col) */}
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 overflow-y-auto space-y-4 shadow-sm h-full">
          {selectedPin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-300 dark:border-zinc-800">
                <span className="text-[10px] font-mono uppercase font-bold text-red-600 dark:text-red-400">
                  Selected Map Node Metadata
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  ID: {selectedPin.item.id}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  {selectedPin.type === 'incident'
                    ? selectedPin.item.title
                    : selectedPin.type === 'shelter'
                    ? selectedPin.item.name
                    : selectedPin.item.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                  <span>
                    {selectedPin.type === 'incident'
                      ? selectedPin.item.location.address
                      : selectedPin.type === 'shelter'
                      ? selectedPin.item.address
                      : selectedPin.item.sector}
                  </span>
                </p>
              </div>

              {selectedPin.type === 'incident' && (
                <>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-serif font-bold text-red-600 dark:text-red-400 uppercase">
                        Severity: {selectedPin.item.severity}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-stone-400">
                        Status: {selectedPin.item.status}
                      </span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                      {selectedPin.item.description}
                    </p>
                  </div>

                  {/* AI Analysis Panel inside GIS sidebar */}
                  <AiAnalysisPanel incident={selectedPin.item} />
                </>
              )}

              {selectedPin.type === 'shelter' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-serif font-bold text-emerald-600 dark:text-emerald-400 uppercase text-sm">
                      Evacuation Camp Status
                    </p>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      OPEN
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-700 dark:text-stone-300">
                      <span>Bed Occupancy:</span>
                      <strong>
                        {selectedPin.item.occupancy} / {selectedPin.item.capacity} Beds
                      </strong>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(selectedPin.item.occupancy / selectedPin.item.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300">
                    Phone: <strong>{selectedPin.item.contactPhone}</strong>
                  </div>
                </div>
              )}

              {selectedPin.type === 'volunteer' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs space-y-2">
                  <p className="font-serif font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Rescuer Responder Details
                  </p>
                  <p className="text-stone-700 dark:text-stone-300 font-sans">
                    Speciality: <strong>{selectedPin.item.roleTitle}</strong>
                  </p>
                  <p className="text-stone-700 dark:text-stone-300 font-mono text-[11px]">
                    Phone: <strong>{selectedPin.item.phone}</strong>
                  </p>
                  <p className="text-emerald-500 font-mono text-[10px] font-bold">
                    ✓ Verified KSDMA Volunteer
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  addToast(
                    'Emergency GPS Route Transmitted',
                    `Route calculated for ${
                      selectedPin.type === 'incident' ? selectedPin.item.title : selectedPin.item.name
                    }`,
                    'success'
                  )
                }
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 border border-red-400"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Emergency GPS Directions</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-stone-500 my-auto font-serif">
              Click any location marker on the Kerala Leaflet map to inspect GIS telemetry & emergency routing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
