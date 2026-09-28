// src/services/wilayahService.ts
// Service tangguh untuk mengambil data resmi wilayah administrasi Indonesia (Kemendagri)

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

// Helper Title Case (misal: "KABUPATEN BOGOR" -> "Kabupaten Bogor")
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 34 Provinsi Resmi Indonesia (Kemendagri / BPS) sebagai data awal & fallback terjamin
export const ALL_INDONESIA_PROVINCES: Province[] = [
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '94', name: 'PAPUA' }
];

// Daftar mirror endpoint
const BASE_ENDPOINTS = [
  '/api-wilayah', // 1. Local Vite Proxy (bebas CORS & bebas blokir AdBlock)
  'https://emsifa.github.io/api-wilayah-indonesia/api', // 2. Primary CDN GitHub Pages
  'https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/gh-pages/api', // 3. Raw GitHub Content
  'https://kanglerian.github.io/api-wilayah-indonesia/api' // 4. Mirror CDN
];

// In-Memory Cache
const cache = {
  provinces: null as Province[] | null,
  regencies: new Map<string, Regency[]>(),
  districts: new Map<string, District[]>(),
  villages: new Map<string, Village[]>(),
};

// Generic multi-mirror fetch helper dengan timeout
async function fetchFromMirrors<T>(relativePath: string): Promise<T | null> {
  for (const base of BASE_ENDPOINTS) {
    try {
      const url = `${base}/${relativePath}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as T;
        }
      }
    } catch {
      // Coba mirror berikutnya
      continue;
    }
  }
  return null;
}

export const wilayahService = {
  // 1. Ambil Semua Provinsi (Selalu menyajikan 34 provinsi lengkap)
  async getProvinces(): Promise<Province[]> {
    if (cache.provinces && cache.provinces.length > 0) {
      return cache.provinces;
    }

    try {
      // Coba load dari localStorage terlebih dahulu
      const localStored = localStorage.getItem('dekati_cached_provinces');
      if (localStored) {
        const parsed = JSON.parse(localStored);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          cache.provinces = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const remoteData = await fetchFromMirrors<Province[]>('provinces.json');
    if (remoteData && remoteData.length > 0) {
      cache.provinces = remoteData;
      try {
        localStorage.setItem('dekati_cached_provinces', JSON.stringify(remoteData));
      } catch {
        // ignore
      }
      return remoteData;
    }

    // Default ke seluruh 34 provinsi Indonesia
    cache.provinces = ALL_INDONESIA_PROVINCES;
    return ALL_INDONESIA_PROVINCES;
  },

  // 2. Ambil Kabupaten/Kota berdasarkan Province ID
  async getRegencies(provinceId: string): Promise<Regency[]> {
    if (!provinceId) return [];
    if (cache.regencies.has(provinceId)) {
      return cache.regencies.get(provinceId)!;
    }

    // Coba cache lokal
    const storageKey = `dekati_reg_${provinceId}`;
    try {
      const local = sessionStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cache.regencies.set(provinceId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const data = await fetchFromMirrors<Regency[]>(`regencies/${provinceId}.json`);
    if (data && data.length > 0) {
      cache.regencies.set(provinceId, data);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }

    return [];
  },

  // 3. Ambil Kecamatan berdasarkan Regency ID
  async getDistricts(regencyId: string): Promise<District[]> {
    if (!regencyId) return [];
    if (cache.districts.has(regencyId)) {
      return cache.districts.get(regencyId)!;
    }

    const storageKey = `dekati_dist_${regencyId}`;
    try {
      const local = sessionStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cache.districts.set(regencyId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const data = await fetchFromMirrors<District[]>(`districts/${regencyId}.json`);
    if (data && data.length > 0) {
      cache.districts.set(regencyId, data);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }

    return [];
  },

  // 4. Ambil Desa/Kelurahan berdasarkan District ID
  async getVillages(districtId: string): Promise<Village[]> {
    if (!districtId) return [];
    if (cache.villages.has(districtId)) {
      return cache.villages.get(districtId)!;
    }

    const storageKey = `dekati_vil_${districtId}`;
    try {
      const local = sessionStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cache.villages.set(districtId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const data = await fetchFromMirrors<Village[]>(`villages/${districtId}.json`);
    if (data && data.length > 0) {
      cache.villages.set(districtId, data);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }

    return [];
  },
};
