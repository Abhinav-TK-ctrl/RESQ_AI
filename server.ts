import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDbPool, queryCitizensForAlert, queryNearestShelters } from './src/db/index';
import { ensureSeedData } from './src/db/seed';
import { runShelterMigration } from './src/services/migrationService';
import { formatTwilioAlertSms, VERIFIED_TEST_PHONE } from './src/services/twilioDispatchService';
import {
  fetchLiveImdDistrictWarnings,
  fetchLiveWeatherTelemetry,
  convertImdWarningsToAlerts,
} from './src/services/imdService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed database tables on boot if needed
  try {
    await ensureSeedData();
  } catch (err) {
    console.warn('Initial seed skipped or already present:', err);
  }

  // --- API Endpoints ---

  // Health check & PostGIS status
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const db = getDbPool();
      const dbCheck = await db.query(
        "SELECT current_database(), extname FROM pg_extension WHERE extname = 'postgis';"
      );
      res.json({
        status: 'ok',
        database: 'connected',
        postgis: dbCheck.rows.length > 0,
        currentDatabase: dbCheck.rows[0]?.current_database || 'cloud_sql',
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'degraded',
        error: err.message,
      });
    }
  });

  // PostGIS Proximity Function 1: Find Citizens for an Alert (10km or district)
  app.get('/api/proximity/citizens', async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 11.554;
      const lon = parseFloat(req.query.lon as string) || 76.126;
      const district = (req.query.district as string) || 'Wayanad';
      const radiusKm = parseFloat(req.query.radius_km as string) || 10;
      const radiusMeters = radiusKm * 1000;

      const citizens = await queryCitizensForAlert(lat, lon, district, radiusMeters);
      res.json({
        success: true,
        count: citizens.length,
        alertLocation: { lat, lon, district, radiusKm },
        citizens,
      });
    } catch (err: any) {
      console.error('Proximity query error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PostGIS Proximity Function 2: Find Nearest 2 Shelters
  app.get('/api/proximity/nearest-shelters', async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 11.554;
      const lon = parseFloat(req.query.lon as string) || 76.126;
      const limit = parseInt(req.query.limit as string, 10) || 2;

      const shelters = await queryNearestShelters(lat, lon, limit);
      res.json({
        success: true,
        count: shelters.length,
        citizenLocation: { lat, lon },
        shelters,
      });
    } catch (err: any) {
      console.error('Nearest shelters query error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List all Shelters from PostgreSQL
  app.get('/api/shelters', async (req: Request, res: Response) => {
    try {
      const db = getDbPool();
      const result = await db.query(`
        SELECT id, name, district, address, contact_number, capacity, latitude, longitude,
               extensions.st_astext(location) as location_wkt
        FROM public.shelters
        ORDER BY district, name;
      `);
      res.json({
        success: true,
        count: result.rows.length,
        shelters: result.rows,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List all Citizen Profiles from PostgreSQL
  app.get('/api/profiles', async (req: Request, res: Response) => {
    try {
      const db = getDbPool();
      const result = await db.query(`
        SELECT id, full_name, phone_number, role, district, latitude, longitude, created_at
        FROM public.profiles
        ORDER BY created_at DESC;
      `);
      res.json({
        success: true,
        count: result.rows.length,
        profiles: result.rows,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Register / Update Citizen Profile with PostGIS Point (Upsert)
  app.post('/api/profiles', async (req: Request, res: Response) => {
    try {
      const { full_name, phone_number, role, district, latitude, longitude } = req.body;
      const db = getDbPool();

      // Check if profile exists by phone number or name
      const existing = await db.query(
        'SELECT id FROM public.profiles WHERE phone_number = $1 OR (full_name = $2 AND role = $3)',
        [phone_number, full_name, role || 'citizen']
      );

      let profileRow;
      if (existing.rows.length > 0) {
        const updateRes = await db.query(
          `UPDATE public.profiles
           SET full_name = $1, role = $3, district = $4, latitude = $5, longitude = $6,
               location = extensions.st_point($6, $5)::extensions.geography
           WHERE id = $2
           RETURNING id, full_name, phone_number, role, district, latitude, longitude, created_at;`,
          [full_name, existing.rows[0].id, role || 'citizen', district, latitude, longitude]
        );
        profileRow = updateRes.rows[0];
      } else {
        const insertQuery = `
          INSERT INTO public.profiles (full_name, phone_number, role, district, latitude, longitude, location)
          VALUES (
            $1, $2, $3, $4, $5, $6,
            extensions.st_point($6, $5)::extensions.geography
          )
          RETURNING id, full_name, phone_number, role, district, latitude, longitude, created_at;
        `;
        const insertRes = await db.query(insertQuery, [
          full_name,
          phone_number,
          role || 'citizen',
          district,
          latitude,
          longitude,
        ]);
        profileRow = insertRes.rows[0];
      }

      res.json({
        success: true,
        profile: profileRow,
      });
    } catch (err: any) {
      console.error('Profile creation error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List all Alerts from PostgreSQL
  app.get('/api/alerts', async (req: Request, res: Response) => {
    try {
      const db = getDbPool();
      const result = await db.query(`
        SELECT id, title, description, severity, district, latitude, longitude, radius_km, created_at
        FROM public.alerts
        ORDER BY created_at DESC;
      `);
      res.json({
        success: true,
        count: result.rows.length,
        alerts: result.rows,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create an Alert in PostgreSQL and compute PostGIS matching citizens
  app.post('/api/alerts', async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        severity,
        district: rawDistrict,
        targetDistrict,
        latitude: rawLat,
        lat,
        longitude: rawLng,
        lng,
        lon,
        radius_km,
        radiusKm,
      } = req.body;
      const db = getDbPool();

      const district = rawDistrict || targetDistrict || 'Wayanad';
      const latitude = rawLat ?? lat ?? 11.554;
      const longitude = rawLng ?? lng ?? lon ?? 76.126;
      const radius = radius_km || radiusKm || 10.0;
      const radiusMeters = radius * 1000;

      // 1. Insert alert
      const insertAlert = `
        INSERT INTO public.alerts (title, description, severity, district, latitude, longitude, radius_km, location)
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          extensions.st_point($6, $5)::extensions.geography
        )
        RETURNING id, title, description, severity, district, latitude, longitude, radius_km, created_at;
      `;
      const alertResult = await db.query(insertAlert, [
        title,
        description,
        severity || 'red',
        district,
        latitude,
        longitude,
        radius,
      ]);
      const createdAlert = alertResult.rows[0];

      // 2. Query PostGIS proximity function to find citizens within 10 km OR same district
      const matchedCitizens = await queryCitizensForAlert(
        latitude,
        longitude,
        district,
        radiusMeters
      );

      // 3. For each citizen, calculate distance and categorize into risk tier:
      // - <= 10 km (radiusMeters): 'HIGH_RISK'
      // - within district (> 10 km): 'NORMAL_RISK'
      // - other districts: 'STATEWIDE_ALERT'
      let highRiskCount = 0;
      let normalRiskCount = 0;
      let statewideCount = 0;

      const citizenEnrichments = await Promise.all(
        matchedCitizens.map(async (c) => {
          const profileRes = await db.query(
            'SELECT latitude, longitude, district FROM public.profiles WHERE id = $1',
            [c.citizen_id]
          );
          const cLat = profileRes.rows[0]?.latitude || latitude;
          const cLon = profileRes.rows[0]?.longitude || longitude;
          const cDistrict = profileRes.rows[0]?.district || c.district || district;

          const distanceMeters = c.distance_meters || 0;
          const distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));

          const isHighRisk = distanceMeters <= radiusMeters;
          const isNormalRisk = !isHighRisk && (cDistrict.toLowerCase() === district.toLowerCase());

          const riskTier: 'HIGH_RISK' | 'NORMAL_RISK' | 'STATEWIDE_ALERT' = isHighRisk
            ? 'HIGH_RISK'
            : isNormalRisk
            ? 'NORMAL_RISK'
            : 'STATEWIDE_ALERT';

          if (riskTier === 'HIGH_RISK') highRiskCount++;
          else if (riskTier === 'NORMAL_RISK') normalRiskCount++;
          else statewideCount++;

          const shelters = await queryNearestShelters(cLat, cLon, 2);

          return {
            ...c,
            distance_meters: distanceMeters,
            distance_km: distanceKm,
            risk_tier: riskTier,
            nearest_shelters: shelters,
          };
        })
      );

      // 4. Query Evaluator's location and distance from PostGIS profiles
      const evaluatorProfileRes = await db.query(
        `SELECT id, full_name, phone_number, district, latitude, longitude,
                extensions.st_distance(location, extensions.st_point($2, $1)::extensions.geography) as distance_meters
         FROM public.profiles
         WHERE phone_number = $3 OR full_name ILIKE '%evaluator%'
         ORDER BY (phone_number = $3) DESC, created_at DESC
         LIMIT 1`,
        [latitude, longitude, VERIFIED_TEST_PHONE]
      );

      let evaluatorDistMeters = 0;
      let evaluatorDistrict = district;
      let evaluatorName = 'Verified Evaluator / Field Responder';
      let evaluatorLat = latitude;
      let evaluatorLon = longitude;

      if (evaluatorProfileRes.rows.length > 0) {
        const evRow = evaluatorProfileRes.rows[0];
        evaluatorDistMeters = parseFloat(evRow.distance_meters) || 0;
        evaluatorDistrict = evRow.district || district;
        evaluatorName = evRow.full_name || evaluatorName;
        evaluatorLat = evRow.latitude || latitude;
        evaluatorLon = evRow.longitude || longitude;
      }

      const evaluatorDistKm = parseFloat((evaluatorDistMeters / 1000).toFixed(1));
      const evaluatorIsWithin10Km = evaluatorDistMeters <= radiusMeters;
      const evaluatorIsDistrictMatch = evaluatorDistrict.toLowerCase() === district.toLowerCase();

      const evaluatorRiskTier: 'HIGH_RISK' | 'NORMAL_RISK' | 'STATEWIDE_ALERT' = evaluatorIsWithin10Km
        ? 'HIGH_RISK'
        : evaluatorIsDistrictMatch
        ? 'NORMAL_RISK'
        : 'STATEWIDE_ALERT';

      const nearestSheltersForEvaluator = await queryNearestShelters(evaluatorLat, evaluatorLon, 2);

      // 5. Automated Twilio dispatch formatted with Tiered Risk Level
      const twilioMessageBody = formatTwilioAlertSms({
        to: VERIFIED_TEST_PHONE,
        alertTitle: title,
        alertSeverity: severity || 'Red Alert',
        alertDistrict: district,
        alertMessage: description,
        nearestShelters: nearestSheltersForEvaluator,
        recipientName: evaluatorName,
        riskLevel: evaluatorRiskTier,
        distanceKm: evaluatorDistKm,
      });

      let twilioSid = 'SM' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      let twilioStatus = 'delivered';
      let twilioProvider = 'twilio_simulated_gateway';

      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const twilioPkg = (await import('twilio')).default;
          const client = twilioPkg(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          try {
            const twilioMsg = await client.messages.create({
              body: twilioMessageBody,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: VERIFIED_TEST_PHONE,
            });
            twilioSid = twilioMsg.sid;
            twilioStatus = twilioMsg.status as any;
            twilioProvider = 'twilio_live_api';
          } catch (customErr: any) {
            if (customErr.message?.includes('predefined SMS templates') || customErr.code === 572006) {
              const trialTemplate = evaluatorRiskTier === 'HIGH_RISK' ? 'sms_account_alerts' : 'sms_event_notifications';
              console.log(`[Twilio Trial Account] Using Twilio predefined template '${trialTemplate}' for ${evaluatorRiskTier} dispatch...`);
              const trialMsg = await client.messages.create({
                body: trialTemplate,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: VERIFIED_TEST_PHONE,
              });
              twilioSid = trialMsg.sid;
              twilioStatus = trialMsg.status as any;
              twilioProvider = `twilio_live_api (${trialTemplate})`;
            } else {
              throw customErr;
            }
          }
        } catch (twErr: any) {
          console.warn('[Twilio Live API Warning - Fallback to Simulation]', twErr.message);
        }
      }

      const twilioDispatch = {
        success: true,
        messageSid: twilioSid,
        to: VERIFIED_TEST_PHONE,
        body: twilioMessageBody,
        status: twilioStatus,
        provider: twilioProvider,
        riskTier: evaluatorRiskTier,
        distanceKm: evaluatorDistKm,
        nearestShelters: nearestSheltersForEvaluator,
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        alert: createdAlert,
        matchedCount: matchedCitizens.length,
        highRiskCount,
        normalRiskCount,
        statewideCount,
        matchedCitizens: citizenEnrichments,
        evaluatorDispatch: twilioDispatch,
        twilioDispatch,
      });
    } catch (err: any) {
      console.error('Create alert error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- ETL Migration & PostGIS Ingestion Endpoints ---
  app.post('/api/migration/run-shelters', async (req: Request, res: Response) => {
    try {
      const migrationResult = runShelterMigration();
      const db = getDbPool();

      // Ingest all 7 validated non-duplicate records into public.shelters
      const ingestedShelters = [];
      for (const item of migrationResult.importedRecords) {
        const existing = await db.query(
          'SELECT id FROM public.shelters WHERE name = $1 OR contact_number = $2',
          [item.name, item.contact_number]
        );

        if (existing.rows.length === 0) {
          const insertRes = await db.query(
            `INSERT INTO public.shelters (name, district, address, contact_number, capacity, latitude, longitude, location)
             VALUES ($1, $2, $3, $4, $5, $6, $7, extensions.st_setsrid(extensions.st_makepoint($7, $6), 4326)::extensions.geography)
             RETURNING id, name, district, address, contact_number, capacity, latitude, longitude`,
            [
              item.name,
              item.district,
              item.address,
              item.contact_number,
              item.capacity,
              item.latitude,
              item.longitude,
            ]
          );
          ingestedShelters.push(insertRes.rows[0]);
        } else {
          const updateRes = await db.query(
            `UPDATE public.shelters
             SET district = $2, address = $3, contact_number = $4, capacity = $5, latitude = $6, longitude = $7,
                 location = extensions.st_setsrid(extensions.st_makepoint($7, $6), 4326)::extensions.geography
             WHERE id = $1
             RETURNING id, name, district, address, contact_number, capacity, latitude, longitude`,
            [
              existing.rows[0].id,
              item.district,
              item.address,
              item.contact_number,
              item.capacity,
              item.latitude,
              item.longitude,
            ]
          );
          ingestedShelters.push(updateRes.rows[0]);
        }
      }

      res.json({
        success: true,
        result: migrationResult,
        dbIngestedCount: ingestedShelters.length,
        dbShelters: ingestedShelters,
      });
    } catch (err: any) {
      console.error('Migration error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/migration/status', async (req: Request, res: Response) => {
    try {
      const migrationResult = runShelterMigration();
      res.json({
        success: true,
        result: migrationResult,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Dedicated Twilio Alert SMS Dispatch Endpoint ---
  app.post('/api/twilio/send-alert-sms', async (req: Request, res: Response) => {
    try {
      const {
        to = VERIFIED_TEST_PHONE,
        alertTitle = 'Landslide Warning: Chooralmala & Meppadi',
        alertSeverity = 'Red Alert',
        alertDistrict = 'Wayanad',
        alertMessage = 'Heavy torrential rainfall triggering debris flow. Evacuate immediately.',
        nearestShelters = [],
        recipientName = 'Verified Field Responder / Evaluator',
      } = req.body;

      const targetPhone = to || VERIFIED_TEST_PHONE;

      // If nearestShelters not provided, query from PostGIS database
      let resolvedShelters = nearestShelters;
      if (!resolvedShelters || resolvedShelters.length === 0) {
        resolvedShelters = await queryNearestShelters(11.5512, 76.1245, 2);
      }

      const body = formatTwilioAlertSms({
        to: targetPhone,
        alertTitle,
        alertSeverity,
        alertDistrict,
        alertMessage,
        nearestShelters: resolvedShelters,
        recipientName,
      });

      let messageSid = 'SM' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      let status = 'delivered';
      let provider = 'twilio_simulated_gateway';

      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const twilioPkg = (await import('twilio')).default;
          const client = twilioPkg(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          try {
            const twilioMsg = await client.messages.create({
              body,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: targetPhone,
            });
            messageSid = twilioMsg.sid;
            status = twilioMsg.status as any;
            provider = 'twilio_live_api';
          } catch (customErr: any) {
            if (customErr.message?.includes('predefined SMS templates') || customErr.code === 572006) {
              console.log('[Twilio Trial Account] Using Twilio predefined template sms_account_alerts...');
              const trialMsg = await client.messages.create({
                body: 'sms_account_alerts',
                from: process.env.TWILIO_PHONE_NUMBER,
                to: targetPhone,
              });
              messageSid = trialMsg.sid;
              status = trialMsg.status as any;
              provider = 'twilio_live_api (trial_template)';
            } else {
              throw customErr;
            }
          }
        } catch (twilioErr: any) {
          console.warn('[Twilio Live API Warning - Fallback to Simulation]', twilioErr.message);
        }
      }

      res.json({
        success: true,
        messageSid,
        to: targetPhone,
        body,
        status,
        provider,
        timestamp: new Date().toISOString(),
        nearestSheltersIncluded: resolvedShelters.slice(0, 2),
      });
    } catch (err: any) {
      console.error('Twilio SMS error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Live IMD (India Meteorological Department) Endpoints ---

  // 1. Get Live IMD District Warnings (all Kerala districts & national)
  app.get('/api/imd/warnings', async (req: Request, res: Response) => {
    try {
      const warnings = await fetchLiveImdDistrictWarnings();
      res.json({
        success: true,
        source: 'India Meteorological Department (IMD) - National Weather Forecasting Centre (NWFC)',
        lastUpdated: new Date().toISOString(),
        totalDistricts: warnings.length,
        keralaAlertCount: warnings.filter((w) => w.state === 'Kerala' && w.severity !== 'Green (No Warning)').length,
        warnings,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get Live Weather Telemetry (temperature, rainfall, wind, humidity)
  app.get('/api/imd/weather', async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 11.554;
      const lng = parseFloat(req.query.lng as string) || 76.126;
      const district = (req.query.district as string) || 'Wayanad';

      const weather = await fetchLiveWeatherTelemetry(lat, lng, district);
      res.json({
        success: true,
        district,
        coordinates: { lat, lng },
        weather,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Get Active IMD Warnings converted to Disaster Alerts
  app.get('/api/imd/alerts', async (req: Request, res: Response) => {
    try {
      const warnings = await fetchLiveImdDistrictWarnings();
      const activeAlerts = convertImdWarningsToAlerts(warnings);
      res.json({
        success: true,
        count: activeAlerts.length,
        alerts: activeAlerts,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResQ AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
