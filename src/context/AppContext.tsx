import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  IncidentReport,
  Shelter,
  Volunteer,
  ResourceItem,
  EmergencyNotification,
  ToastMessage,
  IncidentStatus,
  CitizenCheckIn,
  CheckInStatus,
  MonsoonAlertConfig,
  DisasterAlert,
  SmsDispatchLog,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_SHELTERS,
  INITIAL_VOLUNTEERS,
  INITIAL_RESOURCES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHECK_INS,
  INITIAL_MONSOON_ALERT,
  INITIAL_ALERTS,
  INITIAL_SMS_LOGS,
} from '../data/mockData';
import { calculateDistanceKm } from '../lib/utils';
import { dispatchGeofencedSmsNotifications } from '../services/smsService';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  sector: string;
  district?: string;
  accuracy?: number;
  gpsActive?: boolean;
}

interface AppContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  incidents: IncidentReport[];
  addIncident: (newIncident: Omit<IncidentReport, 'id' | 'timestamp' | 'upvotes'>) => IncidentReport;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  verifyIncident: (id: string) => void;
  shelters: Shelter[];
  reserveShelterSpot: (shelterId: string, count?: number) => boolean;
  nearestShelter: { shelter: Shelter; distanceKm: number } | null;
  volunteers: Volunteer[];
  setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
  upvoteIncident: (id: string) => void;
  dispatchRescueSquad: (incidentId: string, specificVolunteerId?: string) => { volunteer: Volunteer; matchReason: string } | null;
  resources: ResourceItem[];
  allocateResource: (resourceId: string, quantity: number, destinationSector?: string) => boolean;
  notifications: EmergencyNotification[];
  markNotificationAsRead: (id: string) => void;
  activeSos: boolean;
  triggerSos: () => void;
  cancelSos: () => void;
  userLocation: UserLocation;
  requestUserLocation: () => Promise<void>;
  alerts: DisasterAlert[];
  smsLogs: SmsDispatchLog[];
  createAlert: (alertData: Omit<DisasterAlert, 'id' | 'timestamp' | 'lastUpdated' | 'smsDispatchedCount'>) => {
    alert: DisasterAlert;
    dispatchedCount: number;
    matchedCitizens: any[];
  };
  updateAlert: (id: string, updated: Partial<DisasterAlert>, retriggerSms?: boolean) => void;
  deleteAlert: (id: string) => void;
  dispatchManualSmsForAlert: (alertId: string) => number;
  clearSmsLogs: () => void;
  monsoonAlert: MonsoonAlertConfig;
  updateMonsoonAlert: (newAlert: Partial<MonsoonAlertConfig>) => void;
  clearMonsoonAlert: () => void;
  checkIns: CitizenCheckIn[];
  updateCheckInStatus: (status: CheckInStatus, notes?: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeSos, setActiveSos] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [monsoonAlert, setMonsoonAlert] = useState<MonsoonAlertConfig>(INITIAL_MONSOON_ALERT);
  const [checkIns, setCheckIns] = useState<CitizenCheckIn[]>(INITIAL_CHECK_INS);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(INITIAL_ALERTS);
  const [smsLogs, setSmsLogs] = useState<SmsDispatchLog[]>(INITIAL_SMS_LOGS);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // User Exact GPS Coordinates (defaults to Wayanad Disaster Zone coordinates if GPS is initializing)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: 11.554,
    lng: 76.126,
    address: 'Chooralmala Road, Meppadi, Wayanad',
    sector: 'Wayanad District (DEOC)',
    accuracy: 5,
    gpsActive: false,
  });

  // Automatically request GPS location on login/app mount
  const requestUserLocation = async (): Promise<void> => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Live GPS (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`,
            sector: 'Captured Live GPS Sector',
            accuracy: Math.round(pos.coords.accuracy),
            gpsActive: true,
          });
          addToast(
            'GPS Location Captured',
            `Coordinates locked at ±${Math.round(pos.coords.accuracy)}m accuracy`,
            'success'
          );
        },
        (err) => {
          console.warn('Geolocation access fallback to Wayanad Disaster Zone:', err.message);
          // Fallback to designated Kerala emergency sector
          setUserLocation((prev) => ({
            ...prev,
            gpsActive: true,
          }));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  // Dynamically calculate nearest shelter based on userLocation
  const nearestShelter = useMemo(() => {
    if (!shelters.length || !userLocation) return null;
    let closest: Shelter = shelters[0];
    let minDistance = Infinity;

    for (const s of shelters) {
      const sLat = typeof s.lat === 'number' ? s.lat : (s as any)?.location?.lat;
      const sLng = typeof s.lng === 'number' ? s.lng : (s as any)?.location?.lng;
      if (
        typeof sLat === 'number' &&
        typeof sLng === 'number' &&
        typeof userLocation?.lat === 'number' &&
        typeof userLocation?.lng === 'number'
      ) {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, sLat, sLng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = s;
        }
      }
    }

    return {
      shelter: closest,
      distanceKm: minDistance === Infinity ? 0 : minDistance,
    };
  }, [shelters, userLocation]);

  // Handle popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    addToast(`Switched Role to ${role.toUpperCase()}`, `View adjusted to ${role} perspective`, 'info');
  };

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addIncident = (newIncidentData: Omit<IncidentReport, 'id' | 'timestamp' | 'upvotes'>) => {
    const created: IncidentReport = {
      ...newIncidentData,
      id: `INC-2026-${Math.floor(8000 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      upvotes: 1,
    };
    setIncidents((prev) => [created, ...prev]);
    addToast('Incident Transmitted Successfully', `Tracking ID: ${created.id}`, 'success');

    // Add automatic system notification
    const newNotif: EmergencyNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `NEW REPORT: ${created.title}`,
      message: `A new ${created.severity.toUpperCase()} severity ${created.category} report was submitted at ${created.location.sector}.`,
      severity: created.severity === 'critical' ? 'critical' : 'warning',
      timestamp: new Date().toISOString(),
      sender: 'Citizen Incident Relay',
      targetSector: created.location.sector,
      read: false,
      actionUrl: '/reports',
      actionText: 'View Incident Feed',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return created;
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
    addToast('Incident Status Updated', `Incident ${id} is now ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  // Incident Priority Upvote
  const upvoteIncident = (id: string) => {
    let newUpvoteCount = 0;
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          newUpvoteCount = (inc.upvotes || 0) + 1;
          return {
            ...inc,
            upvotes: newUpvoteCount,
            urgencyScore: Math.min(100, (inc.urgencyScore || 50) + 1),
          };
        }
        return inc;
      })
    );
    addToast(
      'Incident Priority Upvoted',
      `Community weight increased! Current priority is now ${newUpvoteCount} upvotes.`,
      'success'
    );
  };

  // Smart Rescue Squad & Specialist Dispatch
  const dispatchRescueSquad = (
    incidentId: string,
    specificVolunteerId?: string
  ): { volunteer: Volunteer; matchReason: string } | null => {
    const targetIncident = incidents.find((i) => i.id === incidentId);
    if (!targetIncident) {
      addToast('Dispatch Failed', `Incident ${incidentId} not found in the live registry.`, 'error');
      return null;
    }

    let bestVol: Volunteer | null = null;
    let matchReason = '';

    if (specificVolunteerId) {
      bestVol = volunteers.find((v) => v.id === specificVolunteerId) || null;
      matchReason = 'Assigned directly by Disaster Operations Command';
    } else {
      // Domain-specific keyword matching for Kerala disaster response
      const skillKeywords: Record<string, string[]> = {
        medical: ['Trauma', 'Triage', 'Doctor', 'Physician', 'Life Support', 'BLS', 'Paramedic', 'Nursing', 'First Aid'],
        flood: ['Swift Water', 'Boat', 'Rescue Boat', 'Navigation', 'ODR', 'Swimmer', 'Water'],
        river_overflow: ['Swift Water', 'Boat', 'Navigation', 'Flood', 'Swimmer'],
        landslide: ['Excavator', 'Heavy Equipment', 'Chainsaw', 'Search & Rescue', 'Clearing'],
        house_collapse: ['Search & Rescue', 'Excavator', 'Heavy Equipment', 'Structural'],
        tree_collapse: ['Chainsaw', 'Clearing', 'Heavy Equipment', 'Highway'],
        power_line: ['Electrical', 'Highway', 'Radio', 'Chainsaw'],
        road_blockage: ['Highway', 'Excavator', 'Chainsaw', 'Clearing'],
        strong_wind: ['Chainsaw', 'Clearing', 'Radio'],
      };

      const targetKeywords = skillKeywords[targetIncident.category] || ['Rescue', 'First Aid', 'First Responder'];

      const scored = volunteers.map((vol) => {
        let score = 0;
        const matchedSkills: string[] = [];

        // Availability weighting
        if (vol.status === 'available') score += 50;
        else if (vol.status === 'deployed') score += 10;

        // Specialized skill matching
        vol.skills.forEach((skill) => {
          targetKeywords.forEach((kw) => {
            if (skill.toLowerCase().includes(kw.toLowerCase()) || vol.roleTitle.toLowerCase().includes(kw.toLowerCase())) {
              score += 30;
              if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
            }
          });
        });

        // Verification tier weighting
        if (vol.verificationLevel === 'Medical Specialist') score += (targetIncident.category === 'medical' ? 35 : 15);
        if (vol.verificationLevel === 'Certified Rescuer') score += 25;
        if (vol.verificationLevel === 'Team Lead') score += 20;

        // Proximity / Sector matching
        if (targetIncident.location?.sector && vol.location?.sector) {
          const incSec = targetIncident.location.sector.toLowerCase();
          const volSec = vol.location.sector.toLowerCase();
          if (incSec.includes(volSec) || volSec.includes(incSec)) {
            score += 35;
          }
        }

        return {
          volunteer: vol,
          score,
          matchReason:
            matchedSkills.length > 0
              ? `Specialist certified in ${matchedSkills.join(', ')} (${vol.verificationLevel})`
              : `Selected for ${vol.location.sector} operational readiness (${vol.roleTitle})`,
        };
      });

      scored.sort((a, b) => b.score - a.score);
      if (scored.length > 0) {
        bestVol = scored[0].volunteer;
        matchReason = scored[0].matchReason;
      }
    }

    if (!bestVol) {
      addToast('No Available Responders', 'No suitable volunteer could be matched at this moment.', 'error');
      return null;
    }

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';

    // Update volunteer state to deployed with assigned mission
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === bestVol!.id
          ? {
              ...v,
              status: 'deployed',
              assignedTask: `${targetIncident.title} (${targetIncident.location.sector})`,
            }
          : v
      )
    );

    // Update incident report with assigned volunteer information and audit log
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const newNotes = [
            ...(inc.notes || []),
            `[DISPATCHED RESCUE LEAD] ${bestVol!.name} (${bestVol!.roleTitle}, Tel: ${bestVol!.phone}) assigned at ${nowFormatted}. ${matchReason}.`,
          ];
          return {
            ...inc,
            status: 'dispatching' as IncidentStatus,
            dispatchTeam: `${bestVol!.name} (${bestVol!.roleTitle}) • ${bestVol!.verificationLevel}`,
            assignedVolunteer: {
              id: bestVol!.id,
              name: bestVol!.name,
              phone: bestVol!.phone,
              roleTitle: bestVol!.roleTitle,
              skills: bestVol!.skills,
              avatar: bestVol!.avatar,
              verificationLevel: bestVol!.verificationLevel,
              sector: bestVol!.location?.sector || targetIncident.location.sector,
              dispatchedAt: nowFormatted,
              matchReason: matchReason,
            },
            notes: newNotes,
          };
        }
        return inc;
      })
    );

    // Broadcast emergency notification to command log
    const dispatchNotif: EmergencyNotification = {
      id: `NOTIF-DISPATCH-${Date.now()}`,
      title: `RESCUE DISPATCHED: ${bestVol.name}`,
      message: `${bestVol.name} (${bestVol.roleTitle}) assigned to lead emergency response for "${targetIncident.title}" in ${targetIncident.location.sector}.`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      sender: 'KSDMA SEOC Dispatch Control',
      targetSector: targetIncident.location.sector,
      read: false,
      actionUrl: '/reports',
      actionText: 'Track Assigned Squad',
    };
    setNotifications((prev) => [dispatchNotif, ...prev]);

    addToast(
      'Rescue Squad Dispatched',
      `${bestVol.name} (${bestVol.roleTitle}) assigned to ${targetIncident.title}. Contact: ${bestVol.phone}`,
      'success'
    );

    return { volunteer: bestVol, matchReason };
  };

  // Authority verification workflow
  const verifyIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          return {
            ...inc,
            status: 'verified',
            notes: [
              ...(inc.notes || []),
              `Verified by KSDMA Authority at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`,
            ],
          };
        }
        return inc;
      })
    );
    addToast(
      'Incident Verified by Authority',
      'Report has transitioned from pending state and is now publicly visible on the main Active Incidents page.',
      'success'
    );
  };

  // Dynamic shelter reservation decrementing
  const reserveShelterSpot = (shelterId: string, count: number = 1): boolean => {
    let success = false;
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === shelterId) {
          const available = s.capacity - s.occupancy;
          if (available < count) {
            addToast('Capacity Limit Reached', `${s.name} cannot accommodate additional check-ins`, 'error');
            return s;
          }
          success = true;
          const newOccupancy = s.occupancy + count;
          const newStatus = newOccupancy >= s.capacity ? 'full' : newOccupancy >= s.capacity * 0.9 ? 'near_capacity' : 'available';
          return {
            ...s,
            occupancy: newOccupancy,
            status: newStatus,
          };
        }
        return s;
      })
    );

    if (success) {
      addToast(
        'Shelter Check-In Confirmed',
        `Spot reserved successfully. Available capacity decremented in real time.`,
        'success'
      );
    }
    return success;
  };

  // Dynamic resource allocation decrementing
  const allocateResource = (resourceId: string, quantity: number, destinationSector: string = 'Relief Camp Alpha'): boolean => {
    let success = false;
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          if (res.availableQuantity < quantity) {
            addToast('Insufficient Stock', `Only ${res.availableQuantity} ${res.unit} available for dispatch`, 'error');
            return res;
          }
          success = true;
          const newAvailable = res.availableQuantity - quantity;
          const newAllocated = res.allocatedQuantity + quantity;
          const newUrgency = newAvailable <= res.totalQuantity * 0.2 ? 'critical' : newAvailable <= res.totalQuantity * 0.4 ? 'urgent' : 'stable';
          return {
            ...res,
            availableQuantity: newAvailable,
            allocatedQuantity: newAllocated,
            urgencyToReplenish: newUrgency,
            lastUpdated: new Date().toISOString(),
          };
        }
        return res;
      })
    );

    if (success) {
      addToast(
        'Resource Dispatched',
        `${quantity} units allocated to ${destinationSector}. Available stock decremented automatically.`,
        'success'
      );
    }
    return success;
  };

  // State Monsoon Alert controls
  const updateMonsoonAlert = (newAlert: Partial<MonsoonAlertConfig>) => {
    setMonsoonAlert((prev) => ({
      ...prev,
      ...newAlert,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST (Updated)',
    }));
    addToast('Monsoon Warning Updated', 'Broadcast alert pushed to all citizen devices statewide', 'info');
  };

  const clearMonsoonAlert = () => {
    setMonsoonAlert((prev) => ({
      ...prev,
      active: false,
    }));
    addToast('Monsoon Alert Cleared', 'Active state alert dismissed by Authority Command', 'info');
  };

  // Citizen safety check-in tracking
  const updateCheckInStatus = (status: CheckInStatus, notes?: string) => {
    const nowIso = new Date().toISOString();
    const updatedCheckIn: CitizenCheckIn = {
      id: 'CHK-YOU',
      userName: 'Arjun Nair & Family (You)',
      phone: '+91 94470 12345',
      familyCount: 3,
      status,
      location: {
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: userLocation.address,
        sector: userLocation.sector,
      },
      timestamp: nowIso,
      lastUpdated: nowIso,
      notes: notes || `Citizen self check-in status updated to ${status}.`,
    };

    setCheckIns((prev) => [
      updatedCheckIn,
      ...prev.filter((c) => c.id !== 'CHK-YOU' && !c.userName.includes('(You)')),
    ]);
    addToast('Safety Status Updated', `Your status is marked as: ${status}`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const triggerSos = () => {
    setActiveSos(true);
    addToast(
      '🚨 CITIZEN SOS BROADCAST TRANSMITTED',
      `Live GPS coordinates (${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E) sent to Authority Command. Incident added to My Emergency Reports.`,
      'error'
    );

    // Immediately create an incident that appears in "My Emergency Reports" and authority verification queue
    const sosIncident: IncidentReport = {
      id: `SOS-KL-${Date.now()}`,
      title: 'BROADCAST IMMEDIATE SOS: CITIZEN EMERGENCY BEACON',
      description: 'Emergency SOS broadcast triggered. Citizen requesting immediate search and rescue evacuation squad.',
      category: 'medical',
      severity: 'critical',
      status: 'unverified', // Unverified until Authority clicks "Verify Incident"
      isSosBroadcast: true,
      location: {
        address: userLocation.address,
        lat: userLocation.lat,
        lng: userLocation.lng,
        sector: userLocation.sector,
      },
      reporter: {
        name: 'Arjun Nair (Citizen)',
        phone: '+91 94470 12345',
        role: 'citizen',
        verified: true,
      },
      affectedCount: 1,
      aiConfidence: 99,
      aiCategorySuggestion: 'Live Citizen Panic Beacon & Rescue Vector',
      urgencyScore: 100,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      dispatchTeam: 'Pending Authority Verification',
      notes: ['Broadcast SOS panic beacon activated via emergency quick action.'],
    };

    setIncidents((prev) => [sosIncident, ...prev]);
  };

  const cancelSos = () => {
    setActiveSos(false);
    addToast('SOS Emergency Beacon Stood Down', 'Responders notified of safe status check', 'info');
  };

  // Automated Geofenced & District-Based Alert Creation & SMS Dispatching
  const createAlert = (
    alertData: Omit<DisasterAlert, 'id' | 'timestamp' | 'lastUpdated' | 'smsDispatchedCount'>
  ) => {
    const alertId = `ALT-KL-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newAlert: DisasterAlert = {
      ...alertData,
      id: alertId,
      timestamp: nowIso,
      lastUpdated: nowIso,
      smsDispatchedCount: 0,
      targetedCitizensCount: 0,
    };

    // Prepare active logged-in citizen record
    const activeUserCitizen = {
      id: 'CITIZEN-CURRENT-USER',
      userName: 'Arjun Nair & Family (You)',
      phone: '+91 94470 12345',
      lat: userLocation.lat,
      lng: userLocation.lng,
      district: userLocation.district || (userLocation.sector.includes('Wayanad') ? 'Wayanad' : 'Kerala'),
      address: userLocation.address,
      sector: userLocation.sector,
    };

    // Calculate geofence (10km radius) and district match against all registered citizens
    const dispatchResult = dispatchGeofencedSmsNotifications(
      newAlert,
      checkIns,
      shelters,
      activeUserCitizen
    );

    newAlert.smsDispatchedCount = dispatchResult.dispatchedCount;
    newAlert.targetedCitizensCount = dispatchResult.matchedCitizens.length;

    setAlerts((prev) => [newAlert, ...prev]);

    if (dispatchResult.logs.length > 0) {
      setSmsLogs((prev) => [...dispatchResult.logs, ...prev]);
    }

    // Push emergency notification
    const newNotif: EmergencyNotification = {
      id: `NOTIF-ALT-${Date.now()}`,
      title: `[${newAlert.severity.toUpperCase()}] ${newAlert.title}`,
      message: `${newAlert.message.slice(0, 140)}... (${dispatchResult.dispatchedCount} citizens notified via automated SMS)`,
      severity: newAlert.severity === 'Red Alert' ? 'critical' : 'warning',
      timestamp: nowIso,
      sender: newAlert.issuedBy || 'KSDMA Emergency Operations Center',
      targetSector: newAlert.targetDistrict,
      read: false,
      actionUrl: '/alerts',
      actionText: 'View Alert & Evacuation Details',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(
      `🚨 ${newAlert.severity.toUpperCase()} Published`,
      `${newAlert.title} published. Automated SMS triggered for ${dispatchResult.dispatchedCount} matching citizens (10km radius & district match).`,
      'success'
    );

    return {
      alert: newAlert,
      dispatchedCount: dispatchResult.dispatchedCount,
      matchedCitizens: dispatchResult.matchedCitizens,
    };
  };

  const updateAlert = (
    id: string,
    updated: Partial<DisasterAlert>,
    retriggerSms: boolean = false
  ) => {
    let retriggeredCount = 0;

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const merged: DisasterAlert = {
            ...a,
            ...updated,
            lastUpdated: new Date().toISOString(),
          };

          if (retriggerSms) {
            const activeUserCitizen = {
              id: 'CITIZEN-CURRENT-USER',
              userName: 'Arjun Nair & Family (You)',
              phone: '+91 94470 12345',
              lat: userLocation.lat,
              lng: userLocation.lng,
              district: userLocation.district || (userLocation.sector.includes('Wayanad') ? 'Wayanad' : 'Kerala'),
              address: userLocation.address,
              sector: userLocation.sector,
            };

            const dispatchResult = dispatchGeofencedSmsNotifications(
              merged,
              checkIns,
              shelters,
              activeUserCitizen
            );
            retriggeredCount = dispatchResult.dispatchedCount;
            merged.smsDispatchedCount = (merged.smsDispatchedCount || 0) + dispatchResult.dispatchedCount;
            merged.targetedCitizensCount = dispatchResult.matchedCitizens.length;

            if (dispatchResult.logs.length > 0) {
              setSmsLogs((logs) => [...dispatchResult.logs, ...logs]);
            }
          }

          return merged;
        }
        return a;
      })
    );

    addToast(
      'Alert Updated',
      retriggerSms
        ? `Alert updated and automated SMS re-broadcasted to ${retriggeredCount} matching citizens.`
        : 'Alert modified successfully.',
      'success'
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    addToast('Alert Removed', 'Emergency alert has been deleted from active registry.', 'info');
  };

  const dispatchManualSmsForAlert = (alertId: string): number => {
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (!targetAlert) return 0;

    const activeUserCitizen = {
      id: 'CITIZEN-CURRENT-USER',
      userName: 'Arjun Nair & Family (You)',
      phone: '+91 94470 12345',
      lat: userLocation.lat,
      lng: userLocation.lng,
      district: userLocation.district || (userLocation.sector.includes('Wayanad') ? 'Wayanad' : 'Kerala'),
      address: userLocation.address,
      sector: userLocation.sector,
    };

    const dispatchResult = dispatchGeofencedSmsNotifications(
      targetAlert,
      checkIns,
      shelters,
      activeUserCitizen
    );

    if (dispatchResult.logs.length > 0) {
      setSmsLogs((prev) => [...dispatchResult.logs, ...prev]);
    }

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              smsDispatchedCount: (a.smsDispatchedCount || 0) + dispatchResult.dispatchedCount,
            }
          : a
      )
    );

    addToast(
      'SMS Broadcast Re-triggered',
      `Automated SMS dispatched to ${dispatchResult.dispatchedCount} citizens within geofence/district perimeter.`,
      'success'
    );

    return dispatchResult.dispatchedCount;
  };

  const clearSmsLogs = () => {
    setSmsLogs([]);
    addToast('SMS Dispatch Logs Cleared', 'Twilio integration queue logs emptied.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        incidents,
        addIncident,
        updateIncidentStatus,
        verifyIncident,
        shelters,
        reserveShelterSpot,
        nearestShelter,
        volunteers,
        setVolunteers,
        upvoteIncident,
        dispatchRescueSquad,
        resources,
        allocateResource,
        notifications,
        markNotificationAsRead,
        activeSos,
        triggerSos,
        cancelSos,
        userLocation,
        requestUserLocation,
        alerts,
        smsLogs,
        createAlert,
        updateAlert,
        deleteAlert,
        dispatchManualSmsForAlert,
        clearSmsLogs,
        monsoonAlert,
        updateMonsoonAlert,
        clearMonsoonAlert,
        checkIns,
        updateCheckInStatus,
        toasts,
        addToast,
        removeToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
        currentPath,
        navigate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
