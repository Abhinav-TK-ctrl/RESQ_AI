import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckInStatus, ResourceItem } from '../types';
import {
  ShieldAlert,
  Radio,
  Cpu,
  Building,
  Box,
  Users,
  Activity,
  Sparkles,
  MapPin,
  Flame,
  CloudRain,
  Navigation,
  Anchor,
  CloudAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  PhoneCall,
  Phone,
  UserCheck,
  Truck,
  Check,
  Filter,
  X,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const AuthorityDashboardView: React.FC = () => {
  const {
    incidents,
    shelters,
    resources,
    volunteers,
    monsoonAlert,
    updateMonsoonAlert,
    clearMonsoonAlert,
    updateIncidentStatus,
    verifyIncident,
    dispatchRescueSquad,
    allocateResource,
    checkIns,
    updateCheckInStatus,
    addToast,
    navigate,
  } = useApp();

  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [targetSector, setTargetSector] = useState('All Kerala Districts (14 DEOCs)');

  // Monsoon Alert Control State
  const [isEditingMonsoon, setIsEditingMonsoon] = useState(false);
  const [monsoonForm, setMonsoonForm] = useState({
    active: monsoonAlert?.active ?? true,
    level: monsoonAlert?.level || 'Red Alert',
    title: monsoonAlert?.title || 'Kerala State Monsoon & Flood Warning',
    districts: (
      monsoonAlert?.affectedDistricts ||
      monsoonAlert?.districts || [
        'Wayanad',
        'Idukki',
        'Kozhikode',
        'Alappuzha',
        'Thrissur',
        'Ernakulam',
      ]
    ).join(', '),
    rainfallMm: monsoonAlert?.rainfallMm ?? 210,
    advisories: (
      monsoonAlert?.safetyAdvisories || [
        'Evacuate vulnerable riverbanks and landslide slopes to nearest relief camps',
        'Avoid nighttime vehicular travel through mountain Ghat roads',
        'Emergency helpline 1077 active 24x7 across all 14 DEOCs',
      ]
    ).join('\n'),
  });

  const handleSaveMonsoonAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedDistricts = monsoonForm.districts
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const parsedAdvisories = monsoonForm.advisories
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    updateMonsoonAlert({
      active: true,
      level: monsoonForm.level,
      title: monsoonForm.title,
      districts: parsedDistricts,
      affectedDistricts: parsedDistricts,
      rainfallMm: Number(monsoonForm.rainfallMm) || 0,
      safetyAdvisories: parsedAdvisories,
    });
    setMonsoonForm((prev) => ({ ...prev, active: true }));
    setIsEditingMonsoon(false);
    addToast(
      'Monsoon Alert Updated & Published',
      `${monsoonForm.level} text and safety warnings are now live on all Citizen dashboards.`,
      'success'
    );
  };

  const handleClearMonsoonAlert = () => {
    clearMonsoonAlert();
    setMonsoonForm((prev) => ({ ...prev, active: false }));
    setIsEditingMonsoon(false);
    addToast(
      'Monsoon Alert Cleared',
      'The State Monsoon banner has been deactivated and cleared from citizen dashboards.',
      'info'
    );
  };

  const handleApplyPreset = (level: string, rainfall: number) => {
    setMonsoonForm((prev) => ({
      ...prev,
      level,
      rainfallMm: rainfall,
      active: true,
    }));
  };

  // Family Check-In Filter Tab State
  const [checkInFilter, setCheckInFilter] = useState<'all' | CheckInStatus>('all');

  // Quick Resource Allocation Modal State
  const [allocModal, setAllocModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState<ResourceItem | null>(null);
  const [allocQty, setAllocQty] = useState<number>(5);
  const [allocDest, setAllocDest] = useState<string>('Wayanad Chooralmala Relief Base');

  // Filter Broadcast SOS Alerts sent by citizens
  const citizenSosAlerts = incidents.filter(
    (i) => i.isSosBroadcast || i.category === 'sos' || (i.urgencyScore >= 90 && i.reporter.role === 'citizen')
  );

  // Filter Family Check-Ins by Tab
  const isCheckInSafe = (status: string) => status === 'safe' || status === 'Marked Safe';
  const isCheckInAtLoc = (status: string) => status === 'at_location' || status === 'Spot / At Same Location';
  const isCheckInHelp = (status: string) => status === 'needs_help' || status === 'Assistance Needed';

  const filteredCheckIns = checkIns.filter((c) => {
    if (checkInFilter === 'all') return true;
    if (checkInFilter === 'safe') return isCheckInSafe(c.status);
    if (checkInFilter === 'at_location') return isCheckInAtLoc(c.status);
    if (checkInFilter === 'needs_help') return isCheckInHelp(c.status);
    return c.status === checkInFilter;
  });

  const safeCount = checkIns.filter((c) => isCheckInSafe(c.status)).length;
  const atLocCount = checkIns.filter((c) => isCheckInAtLoc(c.status)).length;
  const helpCount = checkIns.filter((c) => isCheckInHelp(c.status)).length;

  // Stat Calculations based on Kerala specifications
  const criticalFloodAlerts = incidents.filter(
    (i) => (i.category === 'flood' || i.category === 'river_overflow') && (i.severity === 'critical' || i.severity === 'high')
  ).length;

  const activeLandslides = incidents.filter(
    (i) => i.category === 'landslide'
  ).length;

  const blockedRoads = incidents.filter(
    (i) => i.category === 'road_blockage' || i.category === 'tree_collapse'
  ).length;

  const totalReliefCamps = shelters.length;

  const availableVolunteers = volunteers.filter(
    (v) => v.status === 'available' || v.status === 'deployed'
  ).length;

  const rescueBoatsResource = resources.find((r) => r.name.toLowerCase().includes('boat'));
  const availableRescueBoats = rescueBoatsResource ? rescueBoatsResource.availableQuantity : 12;

  const totalResourceItems = resources.reduce((acc, r) => acc + r.availableQuantity, 0);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText) return;
    addToast(
      '🚨 KSDMA EMERGENCY BROADCAST SENT',
      `Geotargeted Alert dispatched via Cell Broadcast & SMS to ${targetSector}`,
      'error'
    );
    setBroadcastModal(false);
    setBroadcastText('');
  };

  const handleQuickAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    const success = allocateResource(selectedRes.id, allocQty, allocDest);
    if (success) {
      addToast(
        'Warehouse Inventory Decremented',
        `Dispatched ${allocQty} ${selectedRes.unit} of ${selectedRes.name} to ${allocDest}.`,
        'success'
      );
      setAllocModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 dark:bg-[#131317] text-stone-100 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>KSDMA COMMAND CENTER • STATE EMERGENCY OPERATIONS CENTRE (SEOC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Kerala Disaster Command Console & AI Triage Matrix
          </h1>
          <p className="text-xs text-stone-400 font-sans leading-relaxed">
            Real-time incident streams, automated Gemini urgency scoring, district emergency relay matrix, and state wide alert dispatch.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setBroadcastModal(true)}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 border border-red-500"
          >
            <Radio className="w-4 h-4" />
            <span>DISPATCH STATE ALERT</span>
          </button>
        </div>
      </div>

      {/* State Monsoon Alert: Authority Live Control Panel */}
      <div className="p-6 rounded-2xl bg-stone-900 border-2 border-amber-600/60 text-stone-100 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                <CloudRain className="w-3 h-3" />
                <span>STATE MONSOON ALERT CONTROL</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  monsoonAlert?.active
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {monsoonAlert?.active ? '● Broadcast Active on Citizen Views' : '○ Cleared / Inactive'}
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Authority Monsoon Warning & Advisory Control Panel</span>
            </h2>
            <p className="text-xs text-stone-400">
              Live configuration of weather warnings, affected districts, and safety advisories shown to all citizens in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {monsoonAlert?.active && (
              <button
                onClick={handleClearMonsoonAlert}
                className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                title="Clear and remove the alert banner from all citizen screens"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear / Dismiss Alert</span>
              </button>
            )}
            <button
              onClick={() => setIsEditingMonsoon(!isEditingMonsoon)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingMonsoon ? 'Hide Edit Form' : 'Edit Alert Text'}</span>
            </button>
          </div>
        </div>

        {/* Current Active Summary Preview */}
        <div className="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  (monsoonAlert?.level || '').includes('Red')
                    ? 'bg-red-600 text-white'
                    : (monsoonAlert?.level || '').includes('Orange')
                    ? 'bg-amber-600 text-white'
                    : 'bg-yellow-600 text-stone-950'
                }`}
              >
                {monsoonAlert?.level || 'Red Alert'}
              </span>
              <span className="text-stone-300 font-serif font-bold text-sm">
                {monsoonAlert?.title || 'Kerala State Monsoon & Flood Warning'}
              </span>
              <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                Rainfall: {monsoonAlert?.rainfallMm ?? 210}mm
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Updated: {monsoonAlert?.lastUpdated || 'Live'}
            </span>
          </div>

          <div className="text-xs text-stone-400">
            <strong className="text-stone-300">Affected Districts: </strong>
            {(monsoonAlert?.affectedDistricts || monsoonAlert?.districts || []).join(', ')}
          </div>

          <div className="flex flex-wrap gap-2">
            {(monsoonAlert?.safetyAdvisories || []).map((adv, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{adv}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Editable Form Panel */}
        {isEditingMonsoon && (
          <form
            onSubmit={handleSaveMonsoonAlert}
            className="p-5 rounded-xl bg-stone-950 border border-amber-600/40 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 flex-wrap gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Authority Live Editor (Updates Citizens in Real Time)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-mono">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('Red Alert', 220)}
                  className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono hover:bg-red-900"
                >
                  Red (220mm)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('Orange Alert', 125)}
                  className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono hover:bg-amber-900"
                >
                  Orange (125mm)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('Yellow Alert', 65)}
                  className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800 text-[10px] font-mono hover:bg-yellow-900"
                >
                  Yellow (65mm)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Alert Warning Level
                </label>
                <select
                  value={monsoonForm.level}
                  onChange={(e) => setMonsoonForm({ ...monsoonForm, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Red Alert">Red Alert (Extreme Hazard)</option>
                  <option value="Orange Alert">Orange Alert (Heavy Downpour)</option>
                  <option value="Yellow Alert">Yellow Alert (Precautionary)</option>
                  <option value="Green Alert">Green Alert (Normalcy)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Alert Title / Headline
                </label>
                <input
                  type="text"
                  value={monsoonForm.title}
                  onChange={(e) => setMonsoonForm({ ...monsoonForm, title: e.target.value })}
                  placeholder="e.g. Kerala State Monsoon & Landslide Red Warning"
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-sans text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  24h Projected Rainfall (mm)
                </label>
                <input
                  type="number"
                  value={monsoonForm.rainfallMm}
                  onChange={(e) => setMonsoonForm({ ...monsoonForm, rainfallMm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Affected Districts (comma separated)
                </label>
                <input
                  type="text"
                  value={monsoonForm.districts}
                  onChange={(e) => setMonsoonForm({ ...monsoonForm, districts: e.target.value })}
                  placeholder="Wayanad, Idukki, Kozhikode, Alappuzha, Thrissur, Ernakulam"
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-400 mb-1">
                Safety Advisories & Instructions (one per line)
              </label>
              <textarea
                rows={3}
                value={monsoonForm.advisories}
                onChange={(e) => setMonsoonForm({ ...monsoonForm, advisories: e.target.value })}
                placeholder="Evacuate vulnerable riverbanks and landslide slopes to nearest relief camps&#10;Avoid nighttime vehicular travel through mountain Ghat roads&#10;Emergency helpline 1077 active 24x7 across all 14 DEOCs"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-sans text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClearMonsoonAlert}
                className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-mono font-bold border border-red-800 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Alert Text</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMonsoon(false)}
                  className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update & Broadcast to Citizens</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Emergency Portal & Active Perspective: Broadcast SOS Live Queue */}
      <div className="p-6 rounded-2xl bg-stone-900 border-2 border-red-600/70 text-stone-100 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>EMERGENCY PORTAL</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-mono font-bold uppercase border border-stone-700">
                ACTIVE PERSPECTIVE: AUTHORITY
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
              <span>Live Broadcast SOS Alerts from Citizens</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-950 text-red-300 text-xs font-mono font-bold border border-red-800">
              {citizenSosAlerts.length} Active Distress Beacons
            </span>
          </div>
        </div>

        {citizenSosAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {citizenSosAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-stone-950/80 border border-red-900/50 hover:border-red-600/80 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-serif font-bold text-red-300">
                        {alert.title}
                      </span>
                      {alert.status === 'unverified' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pending Verification
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ Verified Public
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 mt-1 line-clamp-2">{alert.description}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-600 text-white font-mono text-xs font-bold shrink-0">
                    Urgency: {alert.urgencyScore}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-stone-900/90 p-2.5 rounded-lg border border-stone-800 text-stone-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">{alert.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{alert.reporter.name} ({alert.reporter.phone || 'GPS Auto'})</span>
                  </div>
                </div>

                {/* Assigned Volunteer / Dispatch Banner */}
                {alert.assignedVolunteer ? (
                  <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="font-bold text-blue-200">{alert.assignedVolunteer.name}</span>
                        <span className="text-stone-300 text-[11px] ml-1">({alert.assignedVolunteer.roleTitle})</span>
                        <span className="text-[10px] text-blue-300 block font-mono">
                          Dispatched: {alert.assignedVolunteer.dispatchedAt} • {alert.assignedVolunteer.sector}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${alert.assignedVolunteer.phone}`}
                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold flex items-center gap-1 shrink-0 self-start sm:self-center"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{alert.assignedVolunteer.phone}</span>
                    </a>
                  </div>
                ) : (
                  alert.dispatchTeam && (
                    <div className="p-2 rounded bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-400">
                      Team: {alert.dispatchTeam}
                    </div>
                  )
                )}

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-stone-500">
                    Received {formatDate(alert.timestamp)}
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.status === 'unverified' && (
                      <button
                        onClick={() => verifyIncident(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs shadow flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify Incident</span>
                      </button>
                    )}

                    {!alert.assignedVolunteer && alert.status !== 'resolved' ? (
                      <button
                        onClick={() => dispatchRescueSquad(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs shadow flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Dispatch Rescue Squad</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => dispatchRescueSquad(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-900 text-blue-300 text-xs font-mono font-bold border border-blue-700 flex items-center gap-1"
                        title="Click to reassign to another available specialist"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Reassign Responder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-stone-400 text-xs font-mono">
            No active unhandled SOS beacons at this moment. All citizen distress channels monitoring.
          </div>
        )}
      </div>

      {/* KPI Command Metrics Grid ( Kerala Disaster Dashboard Specs ) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>CRITICAL FLOODS</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {criticalFloodAlerts}
          </p>
          <span className="text-[9px] text-red-600 dark:text-red-400 font-mono font-bold">RED ALERT ZONES</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>LANDSLIDES</span>
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
            {activeLandslides}
          </p>
          <span className="text-[9px] text-stone-500 font-mono">WAYANAD & IDUKKI</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>BLOCKED ROADS</span>
            <Navigation className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {blockedRoads}
          </p>
          <span className="text-[9px] text-stone-500 font-mono">SH & NH BLOCKAGES</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>RELIEF CAMPS</span>
            <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {totalReliefCamps}
          </p>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">14 DISTRICT HUBS</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>VOLUNTEERS</span>
            <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {availableVolunteers}
          </p>
          <span className="text-[9px] text-stone-500 font-mono">ACTIVE RESCUERS</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>RESCUE BOATS</span>
            <Anchor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400 mt-1">
            {availableRescueBoats}
          </p>
          <span className="text-[9px] text-stone-500 font-mono">ODR FLEET READY</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>RESOURCES</span>
            <Box className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {totalResourceItems.toLocaleString()}
          </p>
          <span className="text-[9px] text-stone-500 font-mono">DISASTER KITS</span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-mono font-bold uppercase">
            <span>WEATHER</span>
            <CloudAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xl font-serif font-bold text-red-600 dark:text-red-400 mt-1">
            RED
          </p>
          <span className="text-[9px] text-red-600 dark:text-red-400 font-mono font-bold">184mm RAIN (24H)</span>
        </div>
      </div>

      {/* Authority Family Check-In Tracking Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Authority Citizen & Family Check-In Tracking</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live ward registry tracking citizen safety statuses, spot locations, and distress requests.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-mono font-bold">
            <button
              onClick={() => setCheckInFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                checkInFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              All Check-Ins ({checkIns.length})
            </button>
            <button
              onClick={() => setCheckInFilter('safe')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                checkInFilter === 'safe'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marked Safe ({safeCount})</span>
            </button>
            <button
              onClick={() => setCheckInFilter('at_location')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                checkInFilter === 'at_location'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Spot / At Same Location ({atLocCount})</span>
            </button>
            <button
              onClick={() => setCheckInFilter('needs_help')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                checkInFilter === 'needs_help'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Assistance Needed ({helpCount})</span>
            </button>
          </div>
        </div>

        {/* Check-in Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCheckIns.map((ci) => (
            <div
              key={ci.id}
              className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700/70 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    {ci.userName}
                  </h4>
                  <p className="text-xs text-stone-500 font-mono">{ci.phone}</p>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                    ci.status === 'safe' || ci.status === 'Marked Safe'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : ci.status === 'at_location' || ci.status === 'Spot / At Same Location'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 animate-pulse'
                  }`}
                >
                  {ci.status === 'safe' || ci.status === 'Marked Safe'
                    ? 'Marked Safe'
                    : ci.status === 'at_location' || ci.status === 'Spot / At Same Location'
                    ? 'Spot / At Location'
                    : 'Assistance Needed'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{ci.location?.address || ci.address || 'Registered Location'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                  <span>Linked Family: <strong>{ci.familyCount ?? ci.familyMembersCount ?? 1} members</strong></span>
                  <span>{ci.location?.sector || ci.sector || 'Kerala State'}</span>
                </div>
              </div>

              {ci.notes && (
                <p className="text-xs bg-stone-100 dark:bg-zinc-800 p-2 rounded-lg text-stone-600 dark:text-stone-300 font-sans border border-stone-200 dark:border-zinc-700">
                  {ci.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-zinc-700/60 text-[10px] font-mono text-stone-400">
                <span>Updated: {formatDate(ci.timestamp || ci.lastUpdated)}</span>
                <a
                  href={`tel:${ci.phone}`}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Ward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): AI Triage Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600 dark:text-red-500" />
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  KSDMA Real-time AI Triage & Verification Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold">
                GEMINI MULTIMODAL TRIAGE
              </span>
            </div>

            <div className="space-y-4">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    inc.severity === 'critical'
                      ? 'bg-red-500/5 border-red-500/30'
                      : 'bg-white dark:bg-zinc-900/60 border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {inc.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40">
                        {inc.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        Urgency Score: {inc.urgencyScore}/100
                      </span>
                      <span>•</span>
                      <span>{inc.aiConfidence}% AI Confidence</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed font-sans">
                    {inc.description}
                  </p>

                  {inc.assignedVolunteer && (
                    <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-[11px] text-blue-600 dark:text-blue-300 font-medium">
                          Assigned Lead: <strong>{inc.assignedVolunteer.name}</strong> ({inc.assignedVolunteer.roleTitle})
                        </span>
                      </div>
                      <a
                        href={`tel:${inc.assignedVolunteer.phone}`}
                        className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{inc.assignedVolunteer.phone}</span>
                      </a>
                    </div>
                  )}

                  <div className="mt-3 p-2.5 rounded-lg bg-stone-100 dark:bg-zinc-800/80 border border-stone-300 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                      <span>{inc.location.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase">
                        Status: <strong className="text-stone-800 dark:text-stone-200">{inc.status}</strong>
                      </span>

                      {inc.status === 'unverified' && (
                        <button
                          onClick={() => verifyIncident(inc.id)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-[11px] shadow flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      )}

                      {!inc.assignedVolunteer && inc.status !== 'resolved' ? (
                        <button
                          onClick={() => dispatchRescueSquad(inc.id)}
                          className="px-3 py-1 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white font-serif font-bold text-[11px] shadow flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Assign & Dispatch</span>
                        </button>
                      ) : inc.status !== 'resolved' ? (
                        <button
                          onClick={() => dispatchRescueSquad(inc.id)}
                          className="px-2.5 py-1 rounded bg-blue-900/60 text-blue-300 hover:bg-blue-900 text-[11px] font-mono font-bold border border-blue-700 flex items-center gap-1"
                          title="Reassign to another specialist"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Reassign Squad</span>
                        </button>
                      ) : null}

                      {inc.status === 'in_progress' && (
                        <button
                          onClick={() => updateIncidentStatus(inc.id, 'resolved')}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-[11px] shadow"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Resource Allocation & Emergency Dispatch Matrix */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kerala Disaster Resource Stock</span>
              </h3>
              <button
                onClick={() => navigate('/resources')}
                className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
              >
                Manage Warehouses
              </button>
            </div>

            <div className="space-y-3">
              {resources.map((res) => {
                const percentage = Math.round(
                  (res.availableQuantity / res.totalQuantity) * 100
                );
                return (
                  <div key={res.id} className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="truncate pr-2 text-stone-800 dark:text-stone-200 font-serif font-bold">
                        {res.name}
                      </span>
                      <span className="font-mono text-stone-500 shrink-0 text-[11px]">
                        {res.availableQuantity.toLocaleString()} / {res.totalQuantity.toLocaleString()} {res.unit}
                      </span>
                    </div>

                    <div className="w-full bg-stone-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage < 25
                            ? 'bg-red-600'
                            : percentage < 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-stone-400">
                        {res.hubLocation}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedRes(res);
                          setAllocQty(Math.min(10, res.availableQuantity));
                          setAllocModal(true);
                        }}
                        disabled={res.availableQuantity <= 0}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                          res.availableQuantity <= 0
                            ? 'bg-stone-200 dark:bg-zinc-800 text-stone-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                        }`}
                      >
                        Dispatch Stock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Resource Allocation Modal */}
      {allocModal && selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setAllocModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400">
              <Truck className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg">Dispatch Resource Stock</h3>
            </div>

            <div className="p-3 bg-stone-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Item:</span>
                <span className="font-bold text-stone-100">{selectedRes.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Available:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedRes.availableQuantity} {selectedRes.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickAllocate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">Target Relief Center</label>
                <select
                  value={allocDest}
                  onChange={(e) => setAllocDest(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100"
                >
                  <option value="Wayanad Chooralmala Relief Base">Wayanad Chooralmala Relief Base</option>
                  <option value="Alappuzha Kuttanad Champakulam Camp">Alappuzha Kuttanad Champakulam Camp</option>
                  <option value="Idukki Munnar Emergency Relief Camp">Idukki Munnar Emergency Relief Camp</option>
                  <option value="Thrissur Chalakudy Relief Center">Thrissur Chalakudy Relief Center</option>
                  <option value="Kozhikode Beach General Hospital Hub">Kozhikode Beach General Hospital Hub</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Quantity to Dispatch ({selectedRes.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedRes.availableQuantity}
                  value={allocQty}
                  onChange={(e) => setAllocQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocModal(false)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-xs font-serif font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs rounded-xl shadow"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg">Broadcast State Emergency Warning</h3>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">Target District / Sector</label>
                <select
                  value={targetSector}
                  onChange={(e) => setTargetSector(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100"
                >
                  <option value="All Kerala Districts (14 DEOCs)">All Kerala Districts (14 DEOCs)</option>
                  <option value="Wayanad District (Meppadi Zone)">Wayanad District (Meppadi Zone)</option>
                  <option value="Alappuzha District (Kuttanad Zone)">Alappuzha District (Kuttanad Zone)</option>
                  <option value="Kozhikode District">Kozhikode District</option>
                  <option value="Ernakulam District (Periyar Zone)">Ernakulam District (Periyar Zone)</option>
                  <option value="Thrissur District (Chalakudy Zone)">Thrissur District (Chalakudy Zone)</option>
                  <option value="Idukki District">Idukki District</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">Warning Message Text</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g. Mandatory evacuation order issued for Kuttanad Champakulam residents due to Pamba river breach."
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModal(false)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-xs font-serif font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs rounded-xl shadow-lg border border-red-400"
                >
                  Dispatch Warning Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
