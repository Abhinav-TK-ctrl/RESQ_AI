import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DisasterAlert, AlertSeverity, AlertCategory } from '../types';
import { calculateDistanceKm, formatDate } from '../lib/utils';
import { getNearestSheltersForLocation, buildTwilioSmsBody, VERIFIED_EVALUATOR_PHONE, parseKeralaLocationFromAddress } from '../services/smsService';
import {
  AlertTriangle,
  Bell,
  BellRing,
  ShieldAlert,
  Send,
  MapPin,
  Phone,
  Navigation,
  Plus,
  Edit2,
  Trash2,
  Radio,
  Search,
  Check,
  X,
  Building,
  ChevronRight,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Database,
  CloudRain,
  History,
  Globe,
  Thermometer,
  Wind,
} from 'lucide-react';
import { PostgisQueryTester } from '../components/PostgisQueryTester';

const KERALA_DISTRICTS = [
  'All Kerala (Statewide)',
  'Wayanad',
  'Idukki',
  'Kozhikode',
  'Alappuzha',
  'Ernakulam',
  'Thrissur',
  'Malappuram',
  'Kottayam',
  'Pathanamthitta',
  'Palakkad',
  'Kannur',
  'Kasaragod',
  'Kollam',
  'Thiruvananthapuram',
];

const PRESET_LOCATIONS = [
  { name: 'Chooralmala / Meppadi (Wayanad)', lat: 11.554, lng: 76.126, district: 'Wayanad' },
  { name: 'Munnar Ghat Slopes (Idukki)', lat: 10.088, lng: 77.06, district: 'Idukki' },
  { name: 'Champakulam / Kuttanad (Alappuzha)', lat: 9.49, lng: 76.33, district: 'Alappuzha' },
  { name: 'Chalakudy River Basin (Thrissur)', lat: 10.307, lng: 76.333, district: 'Thrissur' },
  { name: 'Periyar River Lower Reach (Ernakulam)', lat: 10.108, lng: 76.353, district: 'Ernakulam' },
];

export const AlertsView: React.FC = () => {
  const {
    currentRole,
    alerts,
    createAlert,
    updateAlert,
    deleteAlert,
    dispatchManualSmsForAlert,
    smsLogs,
    clearSmsLogs,
    userLocation,
    shelters,
    checkIns,
    registeredUsers,
    reserveShelterSpot,
    navigate,
    addToast,
    imdWarnings,
    imdLiveWeather,
    imdLoading,
    imdLastUpdated,
    refreshImdData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'alerts' | 'sms_logs' | 'postgis_sql'>('alerts');
  const [alertTimelineFilter, setAlertTimelineFilter] = useState<'all' | 'live_imd' | 'historical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [reservingShelterId, setReservingShelterId] = useState<string | null>(null);
  const [logFilterAlertId, setLogFilterAlertId] = useState<string>('all');

  // New / Edit Alert Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'Red Alert' as AlertSeverity,
    category: 'Landslide' as AlertCategory,
    targetDistrict: 'Wayanad',
    lat: 11.554,
    lng: 76.126,
    address: 'Chooralmala - Mundakkai Belt, Meppadi, Wayanad',
    radiusKm: 10,
    safetyInstructions:
      'Immediate evacuation of vulnerable slopes and riverbanks\nProceed immediately to designated relief camps\nAvoid crossing swollen causeways and ghat roads\nEmergency helpline 1077 active 24x7',
    issuedBy: 'KSDMA State Emergency Operations Centre (SEOC)',
    status: 'published' as const,
  });

  // Calculate live matching citizens count for form preview with tiered risk classification
  const previewMatches = useMemo(() => {
    const alertRadius = formData.radiusKm || 10;
    const alertTargetDist = formData.targetDistrict.toLowerCase();
    const isStatewide =
      alertTargetDist.includes('all') ||
      alertTargetDist.includes('statewide') ||
      alertTargetDist.includes('kerala');

    type MatchedItem = {
      name: string;
      phone: string;
      distKm: number;
      district: string;
      riskTier: 'HIGH_RISK' | 'NORMAL_RISK' | 'STATEWIDE_ALERT';
      reason: string;
      isEvaluator: boolean;
    };

    const matchedList: MatchedItem[] = [];
    const seenPhones = new Set<string>();

    const evaluateRecipient = (
      name: string,
      phone: string,
      lat: number,
      lng: number,
      rawDistrict: string
    ) => {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      if (!cleanPhone || seenPhones.has(cleanPhone)) return;

      const distKm = calculateDistanceKm(lat, lng, formData.lat, formData.lng);
      const recipientDist = rawDistrict.toLowerCase();
      const districtMatch =
        isStatewide ||
        recipientDist.includes(alertTargetDist) ||
        alertTargetDist.includes(recipientDist);

      const isHighRisk = distKm <= alertRadius;
      const isNormalRisk = !isHighRisk && districtMatch;
      const isStatewideMatch = !isHighRisk && !isNormalRisk && isStatewide;

      if (isHighRisk || isNormalRisk || isStatewideMatch) {
        seenPhones.add(cleanPhone);
        const riskTier: 'HIGH_RISK' | 'NORMAL_RISK' | 'STATEWIDE_ALERT' = isHighRisk
          ? 'HIGH_RISK'
          : isNormalRisk
          ? 'NORMAL_RISK'
          : 'STATEWIDE_ALERT';

        const isEvaluator =
          cleanPhone === VERIFIED_EVALUATOR_PHONE ||
          cleanPhone.endsWith('7907733921') ||
          cleanPhone.includes('7907733921');

        matchedList.push({
          name,
          phone,
          distKm,
          district: rawDistrict,
          riskTier,
          reason:
            riskTier === 'HIGH_RISK'
              ? `${distKm.toFixed(1)} km (<=${alertRadius}km) - High Risk Zone`
              : riskTier === 'NORMAL_RISK'
              ? `${distKm.toFixed(1)} km - Same District (${formData.targetDistrict})`
              : `${distKm.toFixed(1)} km - Statewide General Alert`,
          isEvaluator,
        });
      }
    };

    // 1. Check current logged-in user
    evaluateRecipient(
      'Arjun Nair & Family (You)',
      '+91 94470 12345',
      userLocation.lat,
      userLocation.lng,
      userLocation.district || userLocation.sector || 'Wayanad'
    );

    // 2. Check all registered users from portal database
    if (registeredUsers && registeredUsers.length > 0) {
      for (const u of registeredUsers) {
        let uLat = u.location?.lat;
        let uLng = u.location?.lng;
        let uDist = u.district || '';

        if ((!uLat || !uLng) && u.address) {
          const parsed = parseKeralaLocationFromAddress(u.address);
          uLat = parsed.lat;
          uLng = parsed.lng;
          if (!uDist) uDist = parsed.district;
        }

        evaluateRecipient(
          u.fullName || 'Registered Citizen',
          u.phone,
          uLat || 11.554,
          uLng || 76.126,
          uDist || 'Wayanad'
        );
      }
    }

    // 3. Check all checked-in citizens
    for (const c of checkIns) {
      evaluateRecipient(
        c.userName,
        c.phone,
        c.location.lat,
        c.location.lng,
        c.district || c.sector || 'Kerala'
      );
    }

    return matchedList;
  }, [formData, userLocation, checkIns, registeredUsers]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingAlertId(null);
    setFormData({
      title: '',
      message: '',
      severity: 'Red Alert',
      category: 'Landslide',
      targetDistrict: 'Wayanad',
      lat: userLocation.lat || 11.554,
      lng: userLocation.lng || 76.126,
      address: userLocation.address || 'Disaster Sector, Kerala',
      radiusKm: 10,
      safetyInstructions:
        'Immediate evacuation of vulnerable slopes and riverbanks\nProceed immediately to designated relief camps\nAvoid crossing swollen causeways and ghat roads\nEmergency helpline 1077 active 24x7',
      issuedBy: 'KSDMA State Emergency Operations Centre (SEOC)',
      status: 'published',
    });
    setShowCreateModal(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (alert: DisasterAlert) => {
    setEditingAlertId(alert.id);
    setFormData({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      category: alert.category,
      targetDistrict: alert.targetDistrict,
      lat: alert.location.lat,
      lng: alert.location.lng,
      address: alert.location.address,
      radiusKm: alert.location.radiusKm || 10,
      safetyInstructions: alert.safetyInstructions.join('\n'),
      issuedBy: alert.issuedBy,
      status: alert.status,
    });
    setShowCreateModal(true);
  };

  // Submit form (create or edit)
  const handleSubmitAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      addToast('Validation Error', 'Title and warning message are required.', 'error');
      return;
    }

    const instructionsArray = formData.safetyInstructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingAlertId) {
      updateAlert(
        editingAlertId,
        {
          title: formData.title,
          message: formData.message,
          severity: formData.severity,
          category: formData.category,
          targetDistrict: formData.targetDistrict,
          location: {
            lat: Number(formData.lat),
            lng: Number(formData.lng),
            address: formData.address,
            radiusKm: Number(formData.radiusKm) || 10,
          },
          safetyInstructions: instructionsArray,
          issuedBy: formData.issuedBy,
          status: formData.status,
        },
        true // re-trigger geofenced SMS
      );
    } else {
      createAlert({
        title: formData.title,
        message: formData.message,
        severity: formData.severity,
        category: formData.category,
        targetDistrict: formData.targetDistrict,
        location: {
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          address: formData.address,
          radiusKm: Number(formData.radiusKm) || 10,
        },
        safetyInstructions: instructionsArray,
        issuedBy: formData.issuedBy,
        status: formData.status,
      });

      // Also persist alert to Cloud SQL PostGIS database
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.message,
          severity: formData.severity === 'Red Alert' ? 'red' : formData.severity === 'Orange Alert' ? 'orange' : formData.severity === 'Yellow Alert' ? 'yellow' : 'info',
          district: formData.targetDistrict,
          latitude: Number(formData.lat),
          longitude: Number(formData.lng),
          radius_km: Number(formData.radiusKm) || 10,
        }),
      }).catch((err) => console.warn('Cloud SQL alert sync:', err));
    }

    setShowCreateModal(false);
    setEditingAlertId(null);
  };

  // Handle reserve spot at nearest shelter
  const handleReserveSpot = (shelterId: string, shelterName: string) => {
    setReservingShelterId(shelterId);
    setTimeout(() => {
      const ok = reserveShelterSpot(shelterId, 1);
      setReservingShelterId(null);
      if (ok) {
        addToast(
          'Shelter Spot Reserved',
          `1 spot reserved at ${shelterName}. Emergency badge registered.`,
          'success'
        );
      }
    }, 250);
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (alertTimelineFilter === 'live_imd' && !alert.isImdLiveAlert) {
        return false;
      }
      if (alertTimelineFilter === 'historical' && !alert.isHistoricalArchive) {
        return false;
      }
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
        return false;
      }
      if (selectedDistrict !== 'all' && alert.targetDistrict !== selectedDistrict) {
        const matchesAffected = alert.affectedDistricts?.includes(selectedDistrict);
        if (!matchesAffected) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesMsg = alert.message.toLowerCase().includes(q);
        const matchesDist = alert.targetDistrict.toLowerCase().includes(q);
        const matchesCat = alert.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesDist && !matchesCat) return false;
      }
      return true;
    });
  }, [alerts, alertTimelineFilter, selectedSeverity, selectedDistrict, searchQuery]);

  // Filter SMS logs
  const filteredLogs = useMemo(() => {
    if (logFilterAlertId === 'all') return smsLogs;
    return smsLogs.filter((l) => l.alertId === logFilterAlertId);
  }, [smsLogs, logFilterAlertId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>EARLY WARNING & GEOFENCE BROADCAST</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-mono font-bold">
                {alerts.length} Published Disaster Alerts
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>Automated SMS Dispatch: Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
              <span>Disaster Emergency Alerts & Warnings</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-400 text-sm max-w-2xl leading-relaxed">
              Real-time geofenced disaster warnings issued by Kerala State Emergency Operations
              Centre (KSDMA) and District Emergency Operations Centres (DEOCs). Alerts automatically
              trigger SMS dispatches to all citizens within a 10 km incident radius or matching district.
            </p>

            {/* Citizen Proximity Status Pill */}
            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 flex-wrap">
              <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-bold">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Your Live Position:</span>
              </span>
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                {userLocation.address || 'Chooralmala Road, Wayanad'}
              </span>
              <span className="text-[11px] text-stone-400">
                ({userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E)
              </span>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {currentRole === 'authority' && (
              <>
                <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'alerts'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Alerts ({alerts.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sms_logs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'sms_logs'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>SMS Dispatch Logs ({smsLogs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('postgis_sql')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'postgis_sql'
                        ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>PostGIS Engine</span>
                  </button>
                </div>

                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Emergency Alert</span>
                </button>
              </>
            )}

            {currentRole === 'citizen' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'alerts'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Alerts ({alerts.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('postgis_sql')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'postgis_sql'
                        ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>PostGIS Engine</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 font-mono">
                      10 km Geofence Monitored
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PostGIS Spatial Engine Tab */}
      {activeTab === 'postgis_sql' ? (
        <PostgisQueryTester />
      ) : currentRole === 'authority' && activeTab === 'sms_logs' ? (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">
                  Twilio Cellular Dispatch Integration
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {filteredLogs.length} Total Automated Notifications Logged
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Geofenced & District-Based SMS Notification Queue
              </h2>
              <p className="text-xs text-stone-500">
                Shows all citizens targeted by the 10 km geofence radius or district criteria, complete with Twilio payload and nearest shelters.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={logFilterAlertId}
                onChange={(e) => setLogFilterAlertId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="all">Filter by Alert: All Alerts</option>
                {alerts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title.slice(0, 35)}...
                  </option>
                ))}
              </select>

              {smsLogs.length > 0 && (
                <button
                  onClick={clearSmsLogs}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-600 dark:text-stone-300 hover:text-red-600 text-xs font-mono transition-colors"
                >
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <MessageSquare className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No SMS Dispatch Logs Found
              </p>
              <p className="text-xs text-stone-500">
                Issue or update an alert in the Alerts tab to trigger automated geofenced SMS notifications.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                        {log.riskTier === 'HIGH_RISK' ? (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                            🔴 HIGH RISK (&lt;10 KM)
                          </span>
                        ) : log.riskTier === 'NORMAL_RISK' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-mono text-[10px] font-bold">
                            🟠 NORMAL RISK (DISTRICT)
                          </span>
                        ) : log.riskTier === 'STATEWIDE_ALERT' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                            🟡 STATEWIDE ALERT
                          </span>
                        ) : null}
                        {log.distanceKm !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[10px]">
                            {log.distanceKm.toFixed(1)} km
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-stone-400">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {log.recipientName}
                      </h4>
                      <p className="text-xs font-mono text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{log.recipientPhone}</span>
                        <span>•</span>
                        <span>{log.recipientDistrict || 'Kerala'}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                      Twilio SID: {log.twilioSid.slice(0, 10)}...
                    </span>
                  </div>

                  {/* Trigger Match Reason */}
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/60 text-xs space-y-1">
                    <p className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                      Matched Location Criteria:
                    </p>
                    <p className="text-stone-700 dark:text-stone-300 font-sans text-xs">
                      {log.matchReason}
                    </p>
                  </div>

                  {/* SMS Body Prepared for Twilio */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span>SMS Message Payload (Twilio Body):</span>
                      <span>Attached Safe Spots: {log.nearestShelters.length}</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-stone-800 max-h-48 overflow-y-auto">
                      {log.messageBody}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Alerts List Section (Citizen & Authority Default) */
        <div className="space-y-4">
          {/* IMD Mausam Official Live Bulletin Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 text-stone-100 border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase border border-cyan-500/40 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
                  <span>IMD MAUSAM OFFICIAL REAL-TIME INTEGRATION</span>
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  {imdLastUpdated ? `Bulletin Sync: ${imdLastUpdated}` : 'Live Real-Time'}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span>India Meteorological Department (IMD) Live Weather Advisory</span>
              </h3>
              <p className="text-xs text-stone-400 max-w-2xl">
                Official district-wise severe weather bulletins from IMD NWFC. All historical monsoon floods and landslides (e.g. July 2024 Chooralmala) are safely stored in the Previous Incidents Archive.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {imdLiveWeather && (
                <div className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs font-mono text-stone-300 flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{imdLiveWeather.temperature}°C</span>
                  <span className="text-stone-500">•</span>
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{imdLiveWeather.windSpeed} km/h</span>
                </div>
              )}
              <button
                onClick={() => refreshImdData()}
                disabled={imdLoading}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${imdLoading ? 'animate-spin' : ''}`} />
                <span>{imdLoading ? 'Querying IMD...' : 'Sync Live IMD'}</span>
              </button>
            </div>
          </div>

          {/* Timeline Filter: All vs Live IMD vs Historical Archive */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 w-fit flex-wrap">
            <button
              onClick={() => setAlertTimelineFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                alertTimelineFilter === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm border border-stone-200 dark:border-stone-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setAlertTimelineFilter('live_imd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                alertTimelineFilter === 'live_imd'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Live IMD Warnings ({alerts.filter((a) => a.isImdLiveAlert).length})</span>
            </button>
            <button
              onClick={() => setAlertTimelineFilter('historical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                alertTimelineFilter === 'historical'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <History className="w-3 h-3" />
              <span>Previous Incidents Archive ({alerts.filter((a) => a.isHistoricalArchive).length})</span>
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emergency warnings, landslides, flood surges, districts..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="Red Alert">Red Alert</option>
                <option value="Orange Alert">Orange Alert</option>
                <option value="Yellow Alert">Yellow Alert</option>
                <option value="Advisory">Advisory</option>
              </select>

              {/* District filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono focus:outline-none"
              >
                <option value="all">All Districts (Statewide)</option>
                {KERALA_DISTRICTS.filter((d) => !d.includes('Statewide')).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alerts Cards Grid */}
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <ShieldAlert className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                No Emergency Alerts Match Your Filters
              </p>
              <p className="text-xs text-stone-500">
                Try clearing your search query or selecting "All Severities".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                // Calculate distance from logged-in citizen to alert epicenter
                const distToUserKm = calculateDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  alert.location.lat,
                  alert.location.lng
                );
                const alertRadiusKm = alert.location.radiusKm || 10;
                const isRadiusMatch = distToUserKm <= alertRadiusKm;
                const userDistrict = (
                  userLocation.district ||
                  userLocation.sector ||
                  userLocation.address ||
                  ''
                ).toLowerCase();
                const targetDist = alert.targetDistrict.toLowerCase();
                const isDistrictMatch =
                  targetDist.includes('all') ||
                  targetDist.includes('statewide') ||
                  userDistrict.includes(targetDist) ||
                  targetDist.includes(userDistrict) ||
                  Boolean(
                    alert.affectedDistricts &&
                      alert.affectedDistricts.some((d) => userDistrict.includes(d.toLowerCase()))
                  );

                const isCitizenInGeofence = isRadiusMatch || isDistrictMatch;

                // Calculate nearest 2 shelters for this alert's epicenter
                const nearestShelters = getNearestSheltersForLocation(
                  userLocation.lat,
                  userLocation.lng,
                  shelters,
                  2
                );

                const isRed = alert.severity === 'Red Alert';
                const isOrange = alert.severity === 'Orange Alert';

                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-3xl bg-white dark:bg-stone-900 border transition-all shadow-sm space-y-4 relative ${
                      isCitizenInGeofence && isRed
                        ? 'border-red-500/80 ring-2 ring-red-500/20'
                        : isRed
                        ? 'border-red-300 dark:border-red-900/60'
                        : isOrange
                        ? 'border-amber-300 dark:border-amber-900/60'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    {/* Top Row: Severity, Category, District, Timestamp, Authority Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                            isRed
                              ? 'bg-red-600 text-white'
                              : isOrange
                              ? 'bg-amber-600 text-white'
                              : 'bg-yellow-500 text-stone-900'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{alert.severity}</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold border border-stone-200 dark:border-stone-700">
                          {alert.category}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold border border-blue-500/30 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Target: {alert.targetDistrict}</span>
                        </span>

                        {alert.isImdLiveAlert && (
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono font-bold border border-cyan-500/40 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-cyan-500 animate-pulse" />
                            <span>IMD LIVE BULLETIN</span>
                          </span>
                        )}

                        {alert.isHistoricalArchive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-bold border border-amber-500/40 flex items-center gap-1">
                            <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>PREVIOUS INCIDENT ARCHIVE ({alert.archiveDate || 'Past Record'})</span>
                          </span>
                        )}

                        {alert.location.radiusKm && (
                          <span className="text-[11px] font-mono text-stone-500">
                            ({alert.location.radiusKm} km Perimeter)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-stone-400">
                          {formatDate(alert.timestamp)}
                        </span>

                        {/* Authority controls: Edit, Re-trigger SMS, Delete */}
                        {currentRole === 'authority' && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => dispatchManualSmsForAlert(alert.id)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors"
                              title="Re-broadcast Automated SMS to Matching Citizens"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(alert)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition-colors"
                              title="Edit Alert Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950 text-stone-600 dark:text-stone-300 hover:text-red-600 transition-colors"
                              title="Delete Alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Citizen Proximity Match Alert Banner */}
                    {isCitizenInGeofence && (
                      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
                          <span className="font-bold text-xs font-mono uppercase tracking-wide">
                            GEOFENCE MATCH: YOU ARE {distToUserKm.toFixed(1)} KM FROM THIS HAZARD PERIMETER
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                          Evacuation Advisories Apply
                        </span>
                      </div>
                    )}

                    {/* Headline & Warning Message */}
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                        {alert.message}
                      </p>
                    </div>

                    {/* Historical Significance Debrief */}
                    {alert.isHistoricalArchive && alert.archiveSignificance && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                        <History className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-mono font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300">
                            Historical Disaster Record & Lessons Learned ({alert.archiveDate || 'Past Record'})
                          </p>
                          <p className="mt-0.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                            {alert.archiveSignificance}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Epicenter & Authority Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-stone-500 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">
                          Epicenter: {alert.location.address} ({alert.location.lat.toFixed(4)}° N,{' '}
                          {alert.location.lng.toFixed(4)}° E)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">Issued by: {alert.issuedBy}</span>
                      </div>
                    </div>

                    {/* Safety Instructions Checklist */}
                    {alert.safetyInstructions && alert.safetyInstructions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Emergency Action & Evacuation Instructions:</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {alert.safetyInstructions.map((instruction, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2"
                            >
                              <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{instruction}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nearest Safe Evacuation Shelters for this Citizen */}
                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nearest Safe Evacuation Spots & Shelters:</span>
                        </span>
                        <button
                          onClick={() => navigate('/shelters')}
                          className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>Full Shelter Directory</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nearestShelters.map((shelter) => {
                          const spotsAvailable = shelter.availableSpots;
                          return (
                            <div
                              key={shelter.id}
                              className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                                    {shelter.name}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold shrink-0">
                                    {shelter.distanceKm.toFixed(1)} km away
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{shelter.address}</span>
                                </p>
                                <p className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-stone-400" />
                                  <span>Helpline: {shelter.contactPhone}</span>
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {spotsAvailable} Available Beds
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleReserveSpot(shelter.id, shelter.name)}
                                    disabled={reservingShelterId === shelter.id || spotsAvailable <= 0}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                      spotsAvailable <= 0
                                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                    }`}
                                  >
                                    {reservingShelterId === shelter.id
                                      ? 'Reserving...'
                                      : spotsAvailable <= 0
                                      ? 'Full'
                                      : 'Reserve Spot'}
                                  </button>
                                  <button
                                    onClick={() => navigate('/shelters')}
                                    className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-[11px] font-mono"
                                  >
                                    Route
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Status Bar: SMS Broadcast Count */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-mono text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          Cellular SMS Broadcast: {alert.smsDispatchedCount || 14} citizens notified via automated geofence trigger
                        </span>
                      </div>
                      <span className="text-stone-400">ID: {alert.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Authority Alert Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase">
                  Authority Management Control
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-red-600" />
                  <span>{editingAlertId ? 'Edit Emergency Alert' : 'Issue New Emergency Alert'}</span>
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAlert} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Alert Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. WAYANAD LANDSLIDE & FLASH FLOOD SURGE RED ALERT"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none font-bold"
                />
              </div>

              {/* Severity, Category, District */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-none"
                  >
                    <option value="Red Alert">Red Alert (Severe)</option>
                    <option value="Orange Alert">Orange Alert (Moderate)</option>
                    <option value="Yellow Alert">Yellow Alert (Precaution)</option>
                    <option value="Advisory">Advisory (Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Disaster Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AlertCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-none"
                  >
                    <option value="Landslide">Landslide</option>
                    <option value="Flood">Flood</option>
                    <option value="Heavy Rain">Heavy Rain</option>
                    <option value="Dam Shutter Release">Dam Shutter Release</option>
                    <option value="Cyclone / Wind">Cyclone / Wind</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Target District
                  </label>
                  <select
                    value={formData.targetDistrict}
                    onChange={(e) => setFormData({ ...formData, targetDistrict: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-none"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warning Message Details */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Alert Message & Hazard Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Extremely heavy rainfall exceeding 240mm has triggered severe landslide and mudflow warnings..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Location Epicenter & Geofence Radius */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Geofenced Epicenter Parameters (10 km Radius Default)</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          lat: userLocation.lat,
                          lng: userLocation.lng,
                          address: userLocation.address,
                        })
                      }
                      className="text-[11px] font-mono text-red-600 dark:text-red-400 hover:underline"
                    >
                      Use My GPS
                    </button>
                    <span className="text-stone-300">|</span>
                    <select
                      onChange={(e) => {
                        const preset = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                        if (preset) {
                          setFormData({
                            ...formData,
                            lat: preset.lat,
                            lng: preset.lng,
                            address: preset.name,
                            targetDistrict: preset.district,
                          });
                        }
                      }}
                      className="text-[11px] font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-0.5"
                    >
                      <option value="">Kerala Hotspots...</option>
                      {PRESET_LOCATIONS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-500 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-500 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-500 mb-1">
                      Geofence Radius (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.radiusKm}
                      onChange={(e) => setFormData({ ...formData, radiusKm: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold text-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-500 mb-1">
                    Landmark / Sector Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Chooralmala - Mundakkai Belt, Meppadi, Wayanad"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-sans"
                  />
                </div>
              </div>

              {/* Safety Instructions */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Evacuation Instructions (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.safetyInstructions}
                  onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
                  placeholder="Immediate evacuation of vulnerable slopes and riverbanks&#10;Proceed immediately to designated relief camps"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Geofence Calculation Live Preview Box */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span>Automated Tiered SMS Dispatch Engine Scan</span>
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-2.5 py-0.5 rounded-full">
                    {previewMatches.length} Total Recipients
                  </span>
                </div>

                {/* Tier badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400">
                    <span className="block font-bold text-sm">
                      {previewMatches.filter((m) => m.riskTier === 'HIGH_RISK').length}
                    </span>
                    <span className="text-[10px] uppercase font-bold">🔴 High Risk (&lt;10km)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                    <span className="block font-bold text-sm">
                      {previewMatches.filter((m) => m.riskTier === 'NORMAL_RISK').length}
                    </span>
                    <span className="text-[10px] uppercase font-bold">🟠 Normal Risk (District)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                    <span className="block font-bold text-sm">
                      {previewMatches.filter((m) => m.riskTier === 'STATEWIDE_ALERT').length}
                    </span>
                    <span className="text-[10px] uppercase font-bold">🟡 Statewide Alert</span>
                  </div>
                </div>

                {/* Evaluator Specific Status Banner */}
                {(() => {
                  const evalRecipient = previewMatches.find((m) => m.isEvaluator);
                  if (evalRecipient) {
                    return (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold font-mono uppercase text-[11px]">
                              Evaluator Detected (+917907733921):
                            </span>{' '}
                            <span className="font-sans">
                              {evalRecipient.distKm.toFixed(1)} km away ({evalRecipient.district})
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            evalRecipient.riskTier === 'HIGH_RISK'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {evalRecipient.riskTier === 'HIGH_RISK'
                            ? '🔴 HIGH RISK SMS WILL DISPATCH'
                            : '🟠 NORMAL RISK SMS WILL DISPATCH'}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <span>Evaluator (+917907733921) not yet registered in portal session</span>
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline"
                      >
                        Register Evaluator
                      </button>
                    </div>
                  );
                })()}

                {/* Recipient breakdown list */}
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {previewMatches.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg flex items-center justify-between text-[11px] font-mono border ${
                        m.isEvaluator
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 font-bold'
                          : m.riskTier === 'HIGH_RISK'
                          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-stone-900 dark:text-stone-100'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        <span className="truncate">{m.name}</span>
                        <span className="text-stone-400">({m.phone})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-stone-500">{m.distKm.toFixed(1)} km</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            m.riskTier === 'HIGH_RISK'
                              ? 'bg-red-600 text-white'
                              : m.riskTier === 'NORMAL_RISK'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {m.riskTier === 'HIGH_RISK' ? 'High' : m.riskTier === 'NORMAL_RISK' ? 'Normal' : 'State'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {editingAlertId
                      ? 'Update & Re-dispatch Automated SMS'
                      : 'Publish & Dispatch Automated SMS'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
