import { DisasterAlert, Shelter, SmsDispatchLog, CitizenCheckIn } from '../types';
import { calculateDistanceKm } from '../lib/utils';

export interface CitizenLocationRecord {
  id: string;
  userName: string;
  phone: string;
  lat: number;
  lng: number;
  district: string;
  address?: string;
  sector?: string;
}

export interface MatchResult {
  matched: boolean;
  isRadiusMatch: boolean;
  isDistrictMatch: boolean;
  distanceKm: number;
  matchReason: string;
}

/**
 * Checks if a citizen is within 10 km radius of the alert epicenter
 * OR within the citizen's current district (or affected districts).
 */
export function matchCitizenToAlert(
  citizen: {
    lat: number;
    lng: number;
    district?: string;
    sector?: string;
    address?: string;
  },
  alert: DisasterAlert
): MatchResult {
  const alertRadiusKm = alert.location.radiusKm ?? 10;
  const distanceKm = calculateDistanceKm(
    citizen.lat,
    citizen.lng,
    alert.location.lat,
    alert.location.lng
  );

  const isRadiusMatch = distanceKm <= alertRadiusKm;

  const citizenDistrict = (
    citizen.district ||
    citizen.sector ||
    citizen.address ||
    ''
  ).toLowerCase();

  const targetDist = (alert.targetDistrict || '').toLowerCase();
  const isStatewide =
    targetDist.includes('all') ||
    targetDist.includes('statewide') ||
    targetDist.includes('kerala');

  const isDirectDistrictMatch =
    !isStatewide &&
    targetDist.length > 2 &&
    (citizenDistrict.includes(targetDist) || targetDist.includes(citizenDistrict));

  const isAffectedDistrictMatch =
    !isStatewide &&
    Boolean(
      alert.affectedDistricts &&
        alert.affectedDistricts.some((d) => {
          const dLower = d.toLowerCase();
          return citizenDistrict.includes(dLower) || dLower.includes(citizenDistrict);
        })
    );

  const isDistrictMatch = isStatewide || isDirectDistrictMatch || isAffectedDistrictMatch;
  const matched = isRadiusMatch || isDistrictMatch;

  let matchReason = '';
  if (isRadiusMatch && isDistrictMatch) {
    matchReason = `Within ${distanceKm.toFixed(1)} km radius (<=${alertRadiusKm} km) & in affected district (${alert.targetDistrict})`;
  } else if (isRadiusMatch) {
    matchReason = `Within ${distanceKm.toFixed(1)} km geofence radius of incident epicenter (<=${alertRadiusKm} km)`;
  } else if (isDistrictMatch) {
    matchReason = `Located in targeted alert district: ${alert.targetDistrict} (${distanceKm.toFixed(1)} km away)`;
  } else {
    matchReason = `Outside ${alertRadiusKm} km perimeter (${distanceKm.toFixed(1)} km) and outside target district`;
  }

  return {
    matched,
    isRadiusMatch,
    isDistrictMatch,
    distanceKm,
    matchReason,
  };
}

/**
 * Calculates and returns the closest designated safe spots / shelters for a given GPS location.
 */
export function getNearestSheltersForLocation(
  lat: number,
  lng: number,
  allShelters: Shelter[],
  limit: number = 2
) {
  if (!allShelters || allShelters.length === 0) return [];

  return allShelters
    .map((s) => {
      const dist = calculateDistanceKm(lat, lng, s.lat, s.lng);
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        contactPhone: s.contactPhone,
        status: s.status,
        capacity: s.capacity,
        occupancy: s.occupancy,
        availableSpots: Math.max(0, s.capacity - s.occupancy),
        distanceKm: dist,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Builds the urgent SMS message body formatted for cellular broadcast and Twilio SMS.
 */
export function buildTwilioSmsBody(
  alert: DisasterAlert,
  recipientName: string,
  nearestShelters: ReturnType<typeof getNearestSheltersForLocation>
): string {
  const header = `[KSDMA ${alert.severity.toUpperCase()}] ResQ AI Alert for ${recipientName}:`;
  const alertDetail = `${alert.title} (${alert.targetDistrict})\nWarning: ${alert.message}`;

  const sheltersList =
    nearestShelters.length > 0
      ? nearestShelters
          .map(
            (s, idx) =>
              `${idx + 1}. ${s.name} (${s.distanceKm.toFixed(1)} km) - ${s.address} | Ph: ${s.contactPhone} [${s.availableSpots} open beds]`
          )
          .join('\n')
      : 'Contact District Emergency Operations Centre (1077) for nearest transport.';

  return `${header}
${alertDetail}

NEAREST DESIGNATED SAFE SPOTS / SHELTERS:
${sheltersList}

24x7 Control Room: 1077 (DEOC) | 112 (Disaster Response) | ResQ AI Kerala`;
}

/**
 * Generates a mock Twilio Message SID (e.g. SM9a8b7c6d5e4f3...)
 */
function generateTwilioSid(): string {
  const chars = '0123456789abcdef';
  let result = 'SM';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Dispatches automated Geofenced & District-based SMS notifications.
 * Prepares Twilio integration payload for every citizen matching the criteria.
 */
export function dispatchGeofencedSmsNotifications(
  alert: DisasterAlert,
  citizens: CitizenCheckIn[],
  shelters: Shelter[],
  activeUserCitizen?: CitizenLocationRecord
): {
  logs: SmsDispatchLog[];
  matchedCitizens: CitizenLocationRecord[];
  dispatchedCount: number;
} {
  const normalizedCitizens: CitizenLocationRecord[] = [];
  const seenPhones = new Set<string>();

  // Add active logged-in citizen first if provided
  if (activeUserCitizen && activeUserCitizen.phone) {
    normalizedCitizens.push(activeUserCitizen);
    seenPhones.add(activeUserCitizen.phone);
  }

  // Add all registered citizens from check-in database
  for (const c of citizens) {
    if (!seenPhones.has(c.phone)) {
      seenPhones.add(c.phone);
      normalizedCitizens.push({
        id: c.id,
        userName: c.userName,
        phone: c.phone,
        lat: c.location.lat,
        lng: c.location.lng,
        district: c.district || (c.location.sector.includes('Wayanad') ? 'Wayanad' : c.location.sector.split(' ')[0]) || 'Kerala',
        address: c.location.address || c.address,
        sector: c.location.sector || c.sector,
      });
    }
  }

  const logs: SmsDispatchLog[] = [];
  const matchedCitizens: CitizenLocationRecord[] = [];
  const nowIso = new Date().toISOString();

  for (const citizen of normalizedCitizens) {
    const match = matchCitizenToAlert(citizen, alert);

    if (match.matched) {
      matchedCitizens.push(citizen);

      const nearestShelters = getNearestSheltersForLocation(
        citizen.lat,
        citizen.lng,
        shelters,
        2
      );

      const messageBody = buildTwilioSmsBody(alert, citizen.userName, nearestShelters);

      const log: SmsDispatchLog = {
        id: `SMS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        alertId: alert.id,
        alertTitle: alert.title,
        alertSeverity: alert.severity,
        recipientPhone: citizen.phone,
        recipientName: citizen.userName,
        recipientDistrict: citizen.district,
        recipientLocation: {
          lat: citizen.lat,
          lng: citizen.lng,
          address: citizen.address,
        },
        distanceKm: match.distanceKm,
        matchReason: match.matchReason,
        messageBody,
        nearestShelters,
        timestamp: nowIso,
        status: 'delivered',
        twilioSid: generateTwilioSid(),
      };

      logs.push(log);
    }
  }

  return {
    logs,
    matchedCitizens,
    dispatchedCount: logs.length,
  };
}
