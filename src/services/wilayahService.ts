// src/services/wilayahService.ts
// Service tangguh untuk mengambil data resmi wilayah administrasi Indonesia (Kemendagri)
// Mendukung klasifikasi otomatis Desa vs Kelurahan secara presisi berdasarkan standar Kemendagri & hierarki daerah.

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

// Helper Title Case (misal: "KABUPATEN BANGGAI LAUT" -> "Kabupaten Banggai Laut")
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export type VillageType = 'desa' | 'kelurahan';

export interface VillageTypeDetectionResult {
  type: VillageType;
  prefix: 'Desa' | 'Kelurahan';
  leaderRole: 'kades' | 'lurah';
  leaderTitle: 'Kepala Desa' | 'Lurah';
  secretaryTitle: 'Sekretaris Desa' | 'Sekretaris Kelurahan';
  institutionName: string;
  cleanName: string;
  fullName: string;
}

// Set kelurahan umum / terdata di kabupaten yang sering kali tidak memiliki awalan "Kelurahan" pada basis data BPS
const KNOWN_KELURAHAN_SET = new Set([
  'DODUNG',
  'LOMPIO',
  'TANO BONUNUNGAN',
  'TANO BUNUNUNGAN',
  'TINAKIN LAUT', // jika berstatus kelurahan pada periode tertentu
]);

// Set kode BPS yang diketahui bertipe Kelurahan di Kemendagri
const KNOWN_BPS_KELURAHAN_CODES = new Set([
  '7211040003', // Lompio
  '7211040004', // Tano Bonunungan
  '7211040005', // Dodung
]);

/**
 * Deteksi otomatis apakah data wilayah bertipe DESA atau KELURAHAN
 * Berdasarkan standar Kemendagri (digit 1XXX = Kelurahan, 2XXX = Desa),
 * hierarki Kota Otonom vs Kabupaten, dan nomenklatur nama.
 */
export function detectVillageType(params: {
  villageCode?: string;
  villageName?: string;
  regencyName?: string;
  districtName?: string;
}): VillageTypeDetectionResult {
  const { villageCode = '', villageName = '', regencyName = '' } = params;
  const upperName = villageName.toUpperCase().trim();
  const upperReg = regencyName.toUpperCase().trim();
  const cleanCode = villageCode.replace(/\D/g, '');

  const cleanName = upperName
    .replace(/^(PEMERINTAH\s+)?(KELURAHAN|DESA|KAMPUNG|GAMPONG|NAGARI|PEKON|LEMBANG)\s+/i, '')
    .trim();

  // 1. Cek dari nama eksplisit
  if (upperName.startsWith('KELURAHAN ') || upperName.includes('KELURAHAN')) {
    return createResult('kelurahan', cleanName);
  }

  if (
    upperName.startsWith('DESA ') ||
    upperName.includes('DESA') ||
    upperName.startsWith('GAMPONG ') ||
    upperName.startsWith('KAMPUNG ') ||
    upperName.startsWith('NAGARI ')
  ) {
    return createResult('desa', cleanName);
  }

  // 2. Cek apakah berada di wilayah Kota Otonom (KOTA ...) atau DKI Jakarta
  // Catatan: Pastikan tidak salah mendeteksi "KABUPATEN KOTAWARINGIN" atau "KABUPATEN KOTABARU"
  const isCity =
    cleanCode.startsWith('31') ||
    upperReg.startsWith('KOTA ') ||
    upperReg.startsWith('KODYA ') ||
    upperReg === 'KOTA';

  if (isCity) {
    return createResult('kelurahan', cleanName);
  }

  // 3. Cek standar digit Kemendagri
  // Standar Kemendagri:
  // - Kode berpemisah titik (PP.KK.CC.1XXX = Kelurahan, PP.KK.CC.2XXX = Desa)
  // - Kode 10 digit tanpa titik (PPKKCC1XXX = Kelurahan, PPKKCC2XXX = Desa)
  let isKelurahanByCode: boolean | null = null;

  if (villageCode.includes('.')) {
    const parts = villageCode.split('.');
    if (parts.length >= 4) {
      const vilPart = parts[3];
      if (vilPart.startsWith('1')) isKelurahanByCode = true;
      else if (vilPart.startsWith('2')) isKelurahanByCode = false;
    }
  } else if (cleanCode.length === 10) {
    // Digit ke-7 (index 6): '1' = Kelurahan (1001-1999), '2' = Desa (2001-2999)
    const vilIndicator = cleanCode.charAt(6);
    if (vilIndicator === '1') isKelurahanByCode = true;
    else if (vilIndicator === '2') isKelurahanByCode = false;
  }

  if (isKelurahanByCode !== null) {
    return createResult(isKelurahanByCode ? 'kelurahan' : 'desa', cleanName);
  }

  // 4. Fallback jika kode yang masuk adalah format BPS (misal 7211040005) atau nama terdaftar
  if (KNOWN_BPS_KELURAHAN_CODES.has(cleanCode) || KNOWN_KELURAHAN_SET.has(upperName)) {
    return createResult('kelurahan', cleanName);
  }

  // Default di Kabupaten adalah Desa (otonom)
  return createResult('desa', cleanName);
}

function createResult(type: VillageType, cleanName: string): VillageTypeDetectionResult {
  const isKelurahan = type === 'kelurahan';
  const titleName = toTitleCase(cleanName);
  const prefix = isKelurahan ? 'Kelurahan' : 'Desa';

  return {
    type,
    prefix,
    leaderRole: isKelurahan ? 'lurah' : 'kades',
    leaderTitle: isKelurahan ? 'Lurah' : 'Kepala Desa',
    secretaryTitle: isKelurahan ? 'Sekretaris Kelurahan' : 'Sekretaris Desa',
    institutionName: `Pemerintah ${prefix} ${titleName}`,
    cleanName: titleName,
    fullName: `${prefix} ${titleName}`,
  };
}

// 38 Provinsi Resmi Indonesia (Kemendagri) sebagai data awal & fallback terjamin
export const ALL_INDONESIA_PROVINCES: Province[] = [
  { id: '11', name: 'Aceh' },
  { id: '12', name: 'Sumatera Utara' },
  { id: '13', name: 'Sumatera Barat' },
  { id: '14', name: 'Riau' },
  { id: '15', name: 'Jambi' },
  { id: '16', name: 'Sumatera Selatan' },
  { id: '17', name: 'Bengkulu' },
  { id: '18', name: 'Lampung' },
  { id: '19', name: 'Kepulauan Bangka Belitung' },
  { id: '21', name: 'Kepulauan Riau' },
  { id: '31', name: 'DKI Jakarta' },
  { id: '32', name: 'Jawa Barat' },
  { id: '33', name: 'Jawa Tengah' },
  { id: '34', name: 'DI Yogyakarta' },
  { id: '35', name: 'Jawa Timur' },
  { id: '36', name: 'Banten' },
  { id: '51', name: 'Bali' },
  { id: '52', name: 'Nusa Tenggara Barat' },
  { id: '53', name: 'Nusa Tenggara Timur' },
  { id: '61', name: 'Kalimantan Barat' },
  { id: '62', name: 'Kalimantan Tengah' },
  { id: '63', name: 'Kalimantan Selatan' },
  { id: '64', name: 'Kalimantan Timur' },
  { id: '65', name: 'Kalimantan Utara' },
  { id: '71', name: 'Sulawesi Utara' },
  { id: '72', name: 'Sulawesi Tengah' },
  { id: '73', name: 'Sulawesi Selatan' },
  { id: '74', name: 'Sulawesi Tenggara' },
  { id: '75', name: 'Gorontalo' },
  { id: '76', name: 'Sulawesi Barat' },
  { id: '81', name: 'Maluku' },
  { id: '82', name: 'Maluku Utara' },
  { id: '91', name: 'Papua Barat' },
  { id: '92', name: 'Papua Barat Daya' },
  { id: '93', name: 'Papua Selatan' },
  { id: '94', name: 'Papua' },
  { id: '95', name: 'Papua Tengah' },
  { id: '96', name: 'Papua Pegunungan' },
];

// In-Memory Cache
const cache = {
  provinces: null as Province[] | null,
  regencies: new Map<string, Regency[]>(),
  districts: new Map<string, District[]>(),
  villages: new Map<string, Village[]>(),
};

interface RawItem {
  id: string | number;
  name?: string;
  nama?: string;
  province_id?: string | number;
  regency_id?: string | number;
  district_id?: string | number;
}

// Fetch helper dengan timeout dan multi-mirror
async function fetchFromUrl<T>(url: string, timeoutMs = 5000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as T;
      }
    }
  } catch {
    // Coba endpoint selanjutnya
  }
  return null;
}

export const wilayahService = {
  // 1. Ambil Semua Provinsi (38 Provinsi Kemendagri)
  async getProvinces(): Promise<Province[]> {
    if (cache.provinces && cache.provinces.length > 0) {
      return cache.provinces;
    }

    const storageKey = 'dekati_kemendagri_provinces_v2';
    try {
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          cache.provinces = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Mirror 1 & 2: Kemendagri data (ibnux) via jsDelivr CDN & GitHub raw
    const urls = [
      'https://cdn.jsdelivr.net/gh/ibnux/data-indonesia/provinsi.json',
      'https://raw.githubusercontent.com/ibnux/data-indonesia/master/provinsi.json',
      '/api-wilayah/provinces.json',
      'https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json',
    ];

    for (const url of urls) {
      const raw = await fetchFromUrl<RawItem[]>(url);
      if (raw && raw.length > 0) {
        const normalized: Province[] = raw.map((item) => ({
          id: String(item.id),
          name: toTitleCase(item.nama || item.name || ''),
        }));

        cache.provinces = normalized;
        try {
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        } catch {
          // ignore
        }
        return normalized;
      }
    }

    // Fallback default
    cache.provinces = ALL_INDONESIA_PROVINCES;
    return ALL_INDONESIA_PROVINCES;
  },

  // 2. Ambil Kabupaten/Kota berdasarkan Province ID
  async getRegencies(provinceId: string): Promise<Regency[]> {
    if (!provinceId) return [];
    if (cache.regencies.has(provinceId)) {
      return cache.regencies.get(provinceId)!;
    }

    const storageKey = `dekati_kemendagri_reg_v2_${provinceId}`;
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

    const urls = [
      `https://cdn.jsdelivr.net/gh/ibnux/data-indonesia/kabupaten/${provinceId}.json`,
      `https://raw.githubusercontent.com/ibnux/data-indonesia/master/kabupaten/${provinceId}.json`,
      `/api-wilayah/regencies/${provinceId}.json`,
      `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
    ];

    for (const url of urls) {
      const raw = await fetchFromUrl<RawItem[]>(url);
      if (raw && raw.length > 0) {
        const normalized: Regency[] = raw.map((item) => ({
          id: String(item.id),
          province_id: provinceId,
          name: toTitleCase(item.nama || item.name || ''),
        }));

        cache.regencies.set(provinceId, normalized);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(normalized));
        } catch {
          // ignore
        }
        return normalized;
      }
    }

    return [];
  },

  // 3. Ambil Kecamatan berdasarkan Regency ID
  async getDistricts(regencyId: string): Promise<District[]> {
    if (!regencyId) return [];
    if (cache.districts.has(regencyId)) {
      return cache.districts.get(regencyId)!;
    }

    const storageKey = `dekati_kemendagri_dist_v2_${regencyId}`;
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

    const urls = [
      `https://cdn.jsdelivr.net/gh/ibnux/data-indonesia/kecamatan/${regencyId}.json`,
      `https://raw.githubusercontent.com/ibnux/data-indonesia/master/kecamatan/${regencyId}.json`,
      `/api-wilayah/districts/${regencyId}.json`,
      `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`,
    ];

    for (const url of urls) {
      const raw = await fetchFromUrl<RawItem[]>(url);
      if (raw && raw.length > 0) {
        const normalized: District[] = raw.map((item) => ({
          id: String(item.id),
          regency_id: regencyId,
          name: toTitleCase(item.nama || item.name || ''),
        }));

        cache.districts.set(regencyId, normalized);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(normalized));
        } catch {
          // ignore
        }
        return normalized;
      }
    }

    return [];
  },

  // 4. Ambil Desa/Kelurahan berdasarkan District ID
  async getVillages(districtId: string): Promise<Village[]> {
    if (!districtId) return [];
    if (cache.villages.has(districtId)) {
      return cache.villages.get(districtId)!;
    }

    const storageKey = `dekati_kemendagri_vil_v2_${districtId}`;
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

    const urls = [
      `https://cdn.jsdelivr.net/gh/ibnux/data-indonesia/kelurahan/${districtId}.json`,
      `https://raw.githubusercontent.com/ibnux/data-indonesia/master/kelurahan/${districtId}.json`,
      `/api-wilayah/villages/${districtId}.json`,
      `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`,
    ];

    for (const url of urls) {
      const raw = await fetchFromUrl<RawItem[]>(url);
      if (raw && raw.length > 0) {
        const normalized: Village[] = raw.map((item) => ({
          id: String(item.id),
          district_id: districtId,
          name: toTitleCase(item.nama || item.name || ''),
        }));

        cache.villages.set(districtId, normalized);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(normalized));
        } catch {
          // ignore
        }
        return normalized;
      }
    }

    return [];
  },
};
