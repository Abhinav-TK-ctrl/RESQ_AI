import { getDbPool } from './index';

export async function ensureSeedData() {
  const db = getDbPool();

  try {
    // Check shelter count
    const shelterRes = await db.query('SELECT COUNT(*) as count FROM public.shelters');
    const shelterCount = parseInt(shelterRes.rows[0].count, 10);

    if (shelterCount < 5) {
      await db.query(`
        INSERT INTO public.shelters (name, district, address, contact_number, capacity, latitude, longitude, location)
        VALUES
          ('GHSS Meppadi Relief Camp', 'Wayanad', 'Chooralmala Road, Meppadi, Wayanad District', '+91 94471 00101', 800, 11.5500, 76.1200, extensions.st_point(76.1200, 11.5500)::extensions.geography),
          ('Vellarmala Higher Secondary School', 'Wayanad', 'Vellarmala, Meppadi, Wayanad District', '+91 94471 00102', 500, 11.5420, 76.1310, extensions.st_point(76.1310, 11.5420)::extensions.geography),
          ('Kalpetta Municipal Town Hall', 'Wayanad', 'Main Road, Kalpetta, Wayanad District', '+91 94471 00103', 1000, 11.6050, 76.0820, extensions.st_point(76.0820, 11.6050)::extensions.geography),
          ('District Relief Camp Kozhikode (Civil Station)', 'Kozhikode', 'Civil Station Grounds, Eranhipalam, Kozhikode', '+91 94471 00104', 1200, 11.2700, 75.7900, extensions.st_point(75.7900, 11.2700)::extensions.geography),
          ('Taluk Relief Centre Thrissur (Chalakudy)', 'Thrissur', 'Town Hall Complex, Chalakudy, Thrissur', '+91 94471 00105', 950, 10.3000, 76.3300, extensions.st_point(76.3300, 10.3000)::extensions.geography),
          ('Aluva Municipal Community Center Relief Hub', 'Ernakulam', 'Near Palace Ghat, Aluva, Ernakulam District', '+91 94471 00106', 600, 10.1100, 76.3500, extensions.st_point(76.3500, 10.1100)::extensions.geography),
          ('Champakulam Govt High School Relief Centre', 'Alappuzha', 'Champakulam Boat Jetty Road, Kuttanad, Alappuzha', '+91 94471 00107', 450, 9.5000, 76.3400, extensions.st_point(76.3400, 9.5000)::extensions.geography),
          ('Munnar High School Relief Centre', 'Idukki', 'Old Munnar Town, Devikulam Taluk, Idukki District', '+91 94471 00108', 700, 10.0880, 77.0600, extensions.st_point(77.0600, 10.0880)::extensions.geography),
          ('Cheruthoni St. George Parish Hall Relief Hub', 'Idukki', 'Cheruthoni Downstream Periyar, Idukki District', '+91 94471 00109', 550, 9.8500, 76.9800, extensions.st_point(76.9800, 9.8500)::extensions.geography)
        ON CONFLICT DO NOTHING;
      `);
      console.log('Seeded initial Kerala shelters with PostGIS coordinates.');
    }

    // Check profiles count
    const profileRes = await db.query('SELECT COUNT(*) as count FROM public.profiles');
    const profileCount = parseInt(profileRes.rows[0].count, 10);

    if (profileCount < 5) {
      await db.query(`
        INSERT INTO public.profiles (full_name, phone_number, role, district, latitude, longitude, location)
        VALUES
          ('Arjun Nair & Family (Current User)', '+91 94470 12345', 'citizen', 'Wayanad', 11.5540, 76.1260, extensions.st_point(76.1260, 11.5540)::extensions.geography),
          ('Fathima Beevi & Family', '+91 94472 88901', 'citizen', 'Wayanad', 11.5490, 76.1280, extensions.st_point(76.1280, 11.5490)::extensions.geography),
          ('Mathew Thomas', '+91 98460 33412', 'citizen', 'Wayanad', 11.5580, 76.1190, extensions.st_point(76.1190, 11.5580)::extensions.geography),
          ('Sujatha Menon & Elderly Mother', '+91 94951 55670', 'citizen', 'Idukki', 9.8450, 76.9720, extensions.st_point(76.9720, 9.8450)::extensions.geography),
          ('Deepak Varma & 3 Relatives', '+91 98473 11223', 'citizen', 'Alappuzha', 9.4950, 76.3350, extensions.st_point(76.3350, 9.4950)::extensions.geography),
          ('Sunil Kumar (Farmer)', '+91 94470 44556', 'citizen', 'Wayanad', 11.5600, 76.1300, extensions.st_point(76.1300, 11.5600)::extensions.geography),
          ('Verified Field Evaluator', '+917907733921', 'citizen', 'Wayanad', 11.5540, 76.1260, extensions.st_point(76.1260, 11.5540)::extensions.geography),
          ('KSDMA SEOC Duty Officer', '+91 94470 99999', 'authority', 'Thiruvananthapuram', 8.5074, 76.9730, extensions.st_point(76.9730, 8.5074)::extensions.geography)
        ON CONFLICT DO NOTHING;
      `);
      console.log('Seeded initial citizen profiles with PostGIS coordinates.');
    }
  } catch (err) {
    console.error('Seed check error:', err);
  }
}
