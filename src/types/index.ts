export type UserRole = 'citizen' | 'authority';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  district?: string;
  lat?: number;
  lng?: number;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentCategory =
  | 'flood'
  | 'landslide'
  | 'heavy_rain'
  | 'river_overflow'
  | 'road_blockage'
  | 'tree_collapse'
  | 'power_line'
  | 'house_collapse'
  | 'strong_wind'
  | 'medical'
  | 'other';
export type IncidentStatus = 'unverified' | 'verified' | 'dispatching' | 'in_progress' | 'resolved';

export interface AssignedVolunteerInfo {
  id: string;
  name: string;
  phone: string;
  roleTitle: string;
  skills: string[];
  avatar?: string;
  verificationLevel: string;
  sector: string;
  dispatchedAt: string;
  matchReason?: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  isSosBroadcast?: boolean;
  isHistoricalArchive?: boolean;
  archiveDate?: string;
  archiveCategory?: string;
  archiveSignificance?: string;
  isImdVerified?: boolean;
  location: {
    address: string;
    lat: number;
    lng: number;
    sector: string;
  };
  reporter: {
    name: string;
    phone: string;
    role: UserRole;
    verified: boolean;
  };
  mediaUrls?: string[];
  affectedCount: number;
  aiConfidence: number; // e.g., 94 for 94%
  aiCategorySuggestion?: string;
  urgencyScore: number; // 1-100
  timestamp: string;
  upvotes: number;
  dispatchTeam?: string;
  assignedVolunteer?: AssignedVolunteerInfo;
  notes?: string[];
}

export type CheckInStatus =
  | 'Marked Safe'
  | 'Spot / At Same Location'
  | 'Assistance Needed'
  | 'safe'
  | 'at_location'
  | 'needs_help';

export interface CitizenCheckIn {
  id: string;
  userName: string;
  phone: string;
  familyCount: number;
  familyMembersCount?: number;
  status: CheckInStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  address?: string;
  sector?: string;
  district?: string;
  timestamp: string;
  lastUpdated?: string;
  notes?: string;
}

export type AlertSeverity = 'Red Alert' | 'Orange Alert' | 'Yellow Alert' | 'Advisory';

export type AlertCategory =
  | 'Flood'
  | 'Landslide'
  | 'Heavy Rain'
  | 'Dam Shutter Release'
  | 'Cyclone / Wind'
  | 'General';

export interface DisasterAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  targetDistrict: string;
  affectedDistricts?: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    radiusKm?: number; // Geofence radius in km (default 10 km)
  };
  safetyInstructions: string[];
  issuedBy: string;
  status: 'published' | 'draft' | 'archived';
  timestamp: string;
  lastUpdated: string;
  smsDispatchedCount?: number;
  targetedCitizensCount?: number;
  isHistoricalArchive?: boolean;
  archiveDate?: string;
  isImdLiveAlert?: boolean;
  imdWarningTypes?: string[];
  source?: string;
}

export interface ImdDistrictWarning {
  district: string;
  districtId: string;
  state: string;
  colorCode: string; // e.g. '#FFFF00', '#FFA500', '#FF0000', '#7CFC00'
  severity: 'Red Alert' | 'Orange Alert' | 'Yellow Alert' | 'Green (No Warning)';
  warningTypes: string[]; // e.g. ['Heavy Rain', 'Thunderstorm & Lightning, Squall etc']
  forecastDate: string;
  updatedDate: string;
  rawHtml?: string;
  lat: number;
  lng: number;
  safetySummary: string;
  source: string; // 'India Meteorological Department (IMD) - Mausam'
}

export interface ImdLiveWeather {
  district: string;
  temperature: number; // °C
  apparentTemperature: number;
  relativeHumidity: number; // %
  precipitationMm: number; // mm
  windSpeedKmH: number; // km/h
  weatherCode: number;
  weatherCondition: string;
  lastUpdated: string;
  source: string;
}

export interface SmsDispatchLog {
  id: string;
  alertId: string;
  alertTitle: string;
  alertSeverity: AlertSeverity;
  recipientPhone: string;
  recipientName: string;
  recipientDistrict: string;
  recipientLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  distanceKm?: number;
  riskTier?: 'HIGH_RISK' | 'NORMAL_RISK' | 'STATEWIDE_ALERT';
  matchReason: string;
  messageBody: string;
  nearestShelters: {
    name: string;
    distanceKm: number;
    address: string;
    contactPhone: string;
    status: string;
    availableSpots: number;
  }[];
  timestamp: string;
  status: 'delivered' | 'sent' | 'queued';
  twilioSid: string;
}

export interface MonsoonAlertConfig {
  active: boolean;
  level: 'Red Alert' | 'Orange Alert' | 'Yellow Alert' | 'Green Alert' | string;
  title: string;
  message: string;
  districts: string[];
  affectedDistricts?: string[];
  safetyAdvisories?: string[];
  rainfallMm?: number;
  lastUpdated: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  status: 'open' | 'near_capacity' | 'full' | 'closed';
  amenities: {
    medical: boolean;
    food: boolean;
    water: boolean;
    power: boolean;
    petsAllowed: boolean;
    wheelchairAccessible: boolean;
  };
  contactPhone: string;
  managerName: string;
  sector: string;
  suppliesStatus: 'sufficient' | 'low' | 'critical';
}

export interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  roleTitle: string;
  skills: string[];
  status: 'available' | 'deployed' | 'resting' | 'off_duty';
  location: {
    lat: number;
    lng: number;
    sector: string;
  };
  assignedTask?: string;
  phone: string;
  badgeCount: number;
  verificationLevel: 'Basic' | 'Certified Rescuer' | 'Medical Specialist' | 'Team Lead';
  totalMissionsCompleted: number;
  joinedDate: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'medical' | 'food_water' | 'equipment' | 'power_fuel' | 'shelter_kits';
  totalQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  unit: string;
  hubLocation: string;
  sector: string;
  urgencyToReplenish: 'normal' | 'urgent' | 'critical';
  lastUpdated: string;
}

export interface EmergencyNotification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  sender: string;
  targetSector: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface WeatherMetrics {
  temperature: number;
  condition: string;
  windSpeed: number; // km/h
  rainfall24h: number; // mm
  humidity: number; // %
  riverLevel: number; // meters above danger level
  riverName?: string; // e.g. Periyar River
  monsoonAlertLevel?: 'Red Alert' | 'Orange Alert' | 'Yellow Alert' | 'Green Alert';
  floodRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  seismicActivity?: number;
  airQualityIndex?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
