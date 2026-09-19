import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
}

export interface DbCitizenMatch {
  citizen_id: string;
  full_name: string;
  phone_number: string;
  district: string;
  distance_meters: number;
}

export interface DbShelterMatch {
  shelter_id: string;
  name: string;
  address: string;
  contact_number: string;
  distance_meters: number;
}

/**
 * Execute PostGIS proximity query to find citizens within radius_meters or in the target district
 */
export async function queryCitizensForAlert(
  lat: number,
  lon: number,
  district: string,
  radiusMeters: number = 10000
): Promise<DbCitizenMatch[]> {
  const db = getDbPool();
  const query = `
    SELECT citizen_id, full_name, phone_number, district, distance_meters
    FROM get_citizens_for_alert($1, $2, $3, $4);
  `;
  const result = await db.query(query, [lat, lon, district, radiusMeters]);
  return result.rows.map((row) => ({
    citizen_id: row.citizen_id,
    full_name: row.full_name,
    phone_number: row.phone_number,
    district: row.district,
    distance_meters: parseFloat(row.distance_meters) || 0,
  }));
}

/**
 * Execute PostGIS spatial query to find the nearest safe spots / shelters to a coordinate
 */
export async function queryNearestShelters(
  lat: number,
  lon: number,
  maxResults: number = 2
): Promise<DbShelterMatch[]> {
  const db = getDbPool();
  const query = `
    SELECT shelter_id, name, address, contact_number, distance_meters
    FROM get_nearest_shelters($1, $2, $3);
  `;
  const result = await db.query(query, [lat, lon, maxResults]);
  return result.rows.map((row) => ({
    shelter_id: row.shelter_id,
    name: row.name,
    address: row.address,
    contact_number: row.contact_number,
    distance_meters: parseFloat(row.distance_meters) || 0,
  }));
}
