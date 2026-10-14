// src/services/occupationUtils.ts
import { Citizen } from '../types';

export const OCCUPATION_CATEGORIES = [
  'PNS / ASN / PPPK',
  'TNI / POLRI',
  'Pelajar / Mahasiswa',
  'Anak Pra-Sekolah / PAUD',
  'Petani / Pekebun / Peternak',
  'Nelayan / Perikanan',
  'Wiraswasta / Pedagang',
  'Karyawan Swasta / BUMN',
  'Buruh Harian Lepas',
  'Ibu Rumah Tangga',
  'Pensiunan',
  'Belum / Tidak Bekerja',
  'Lainnya',
] as const;

export type OccupationCategory = typeof OCCUPATION_CATEGORIES[number];

export interface OccupationStat {
  category: OccupationCategory;
  count: number;
  maleCount: number;
  femaleCount: number;
  percentage: number;
  color: string;
}

export interface OccupationSummary {
  totalCitizens: number;
  workingCount: number;
  studentCount: number;
  preschoolCount: number;
  unemployedCount: number;
  homemakerCount: number;
  stats: OccupationStat[];
}

export const CATEGORY_COLORS: Record<OccupationCategory, string> = {
  'PNS / ASN / PPPK': '#2563EB',          // Blue
  'TNI / POLRI': '#1E3A8A',              // Navy
  'Pelajar / Mahasiswa': '#0D9488',      // Teal
  'Anak Pra-Sekolah / PAUD': '#F59E0B',  // Amber (Golden/Warm)
  'Petani / Pekebun / Peternak': '#16A34A', // Green
  'Nelayan / Perikanan': '#0284C7',      // Sky
  'Wiraswasta / Pedagang': '#D97706',    // Dark Amber
  'Karyawan Swasta / BUMN': '#6366F1',   // Indigo
  'Buruh Harian Lepas': '#EA580C',       // Orange
  'Ibu Rumah Tangga': '#DB2777',         // Pink
  'Pensiunan': '#64748B',                // Slate
  'Belum / Tidak Bekerja': '#94A3B8',    // Light slate
  'Lainnya': '#A855F7',                  // Purple
};

/**
 * Menghitung usia seseorang (tahun) berdasarkan tanggal lahir string atau 16-digit NIK
 */
export function calculateAge(birthDate?: string, nik?: string): number | null {
  const today = new Date();

  // 1. Ekstraksi dari birthDate
  if (birthDate && birthDate.trim()) {
    const parsed = new Date(birthDate);
    if (!isNaN(parsed.getTime())) {
      let age = today.getFullYear() - parsed.getFullYear();
      const m = today.getMonth() - parsed.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
        age--;
      }
      if (age >= 0 && age <= 130) return age;
    }

    // Format DD-MM-YYYY atau DD/MM/YYYY
    const parts = birthDate.split(/[-/]/);
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed2 = new Date(y, m, d);
      if (!isNaN(parsed2.getTime())) {
        let age = today.getFullYear() - parsed2.getFullYear();
        const mDiff = today.getMonth() - parsed2.getMonth();
        if (mDiff < 0 || (mDiff === 0 && today.getDate() < parsed2.getDate())) {
          age--;
        }
        if (age >= 0 && age <= 130) return age;
      }
    }
  }

  // 2. Ekstraksi cerdas dari NIK (16 digit)
  // Format: [prov:2][kab:2][kec:2][tgl:2][bln:2][thn:2][urut:4]
  // Catatan Kemendagri: Tanggal lahir wanita ditambah 40 (cth: tgl 21 -> 61)
  if (nik && /^\d{16}$/.test(nik.trim())) {
    const cleanNik = nik.trim();
    let day = parseInt(cleanNik.slice(6, 8), 10);
    if (day > 40) day -= 40;
    const month = parseInt(cleanNik.slice(8, 10), 10) - 1;
    const twoDigitYear = parseInt(cleanNik.slice(10, 12), 10);

    const currentYear = today.getFullYear();
    const currentTwoDigit = currentYear % 100;
    // Jika 2 digit <= tahun berjalan (misal 24 -> 2024, 18 -> 2018), anggap abad 21
    const year = twoDigitYear <= currentTwoDigit ? 2000 + twoDigitYear : 1900 + twoDigitYear;

    const parsedNik = new Date(year, month, day);
    if (!isNaN(parsedNik.getTime())) {
      let age = today.getFullYear() - parsedNik.getFullYear();
      const mDiff = today.getMonth() - parsedNik.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < parsedNik.getDate())) {
        age--;
      }
      if (age >= 0 && age <= 130) return age;
    }
  }

  return null;
}

/**
 * Menormalkan variasi teks pekerjaan warga ke salah satu dari kategori standar Kemendagri / BPS.
 * Mendukung auto-detection pra-sekolah / balita berbasis usia (< 7 tahun).
 */
export function normalizeOccupation(
  raw?: string,
  birthDate?: string,
  nik?: string
): OccupationCategory {
  const age = calculateAge(birthDate, nik);

  // Jika input kosong
  if (!raw || !raw.trim()) {
    if (age !== null && age < 7) {
      return 'Anak Pra-Sekolah / PAUD';
    }
    return 'Belum / Tidak Bekerja';
  }
  
  const text = raw.trim().toLowerCase();

  // 1. Deteksi Eksplisit Anak Pra-Sekolah / PAUD / TK / Balita
  if (
    text.includes('paud') ||
    text.includes('pra sekolah') ||
    text.includes('prasekolah') ||
    text.includes('pra-sekolah') ||
    text.includes('belum sekolah') ||
    text.includes('taman kanak') ||
    text.includes('balita') ||
    text.includes('playgroup') ||
    text.includes('kelompok bermain') ||
    text === 'tk' ||
    text.startsWith('tk ') ||
    text.endsWith(' tk') ||
    text.includes(' tk ')
  ) {
    return 'Anak Pra-Sekolah / PAUD';
  }

  // 2. TNI / POLRI
  if (
    text.includes('tni') ||
    text.includes('polri') ||
    text.includes('polisi') ||
    text.includes('tentara') ||
    text.includes('babinsa') ||
    text.includes('bhabinkamtibmas')
  ) {
    return 'TNI / POLRI';
  }

  // 3. PNS / ASN / PPPK
  if (
    text.includes('pns') ||
    text.includes('asn') ||
    text.includes('pppk') ||
    text.includes('pegawai negeri') ||
    text.includes('aparatur sipil') ||
    text.includes('guru pns') ||
    text.includes('dosen pns')
  ) {
    return 'PNS / ASN / PPPK';
  }

  // 4. Pelajar / Mahasiswa
  if (
    text.includes('pelajar') ||
    text.includes('mahasiswa') ||
    text.includes('siswa') ||
    text.includes('santri') ||
    text.includes('sekolah') ||
    text.includes('kuliah')
  ) {
    // Jika usia di bawah 7 tahun, arahkan ke Pra-Sekolah / PAUD
    if (age !== null && age < 7) {
      return 'Anak Pra-Sekolah / PAUD';
    }
    return 'Pelajar / Mahasiswa';
  }

  // 5. Petani / Pekebun / Peternak
  if (
    text.includes('petani') ||
    text.includes('pekebun') ||
    text.includes('ternak') ||
    text.includes('peternak') ||
    text.includes('kebun') ||
    text.includes('tani')
  ) {
    return 'Petani / Pekebun / Peternak';
  }

  // 6. Nelayan / Perikanan
  if (
    text.includes('nelayan') ||
    text.includes('perikanan') ||
    text.includes('tambak') ||
    text.includes('pelaut')
  ) {
    return 'Nelayan / Perikanan';
  }

  // 7. Ibu Rumah Tangga
  if (
    text.includes('ibu rumah tangga') ||
    text.includes('mengurus rumah tangga') ||
    text.includes('irt') ||
    text.includes('rumah tangga')
  ) {
    return 'Ibu Rumah Tangga';
  }

  // 8. Pensiunan
  if (text.includes('pensiun') || text.includes('purnawirawan')) {
    return 'Pensiunan';
  }

  // 9. Belum / Tidak Bekerja (jika anak/balita < 7 tahun, kategorikan pra-sekolah)
  if (
    text.includes('belum') ||
    text.includes('tidak bekerja') ||
    text.includes('pengangguran') ||
    text.includes('belum/tidak') ||
    text.includes('anak')
  ) {
    if (age !== null && age < 7) {
      return 'Anak Pra-Sekolah / PAUD';
    }
    return 'Belum / Tidak Bekerja';
  }

  // 10. Wiraswasta / Pedagang
  if (
    text.includes('wiraswasta') ||
    text.includes('pedagang') ||
    text.includes('dagang') ||
    text.includes('pengusaha') ||
    text.includes('toko') ||
    text.includes('warung') ||
    text.includes('umkm') ||
    text.includes('bisnis') ||
    text.includes('wirausaha')
  ) {
    return 'Wiraswasta / Pedagang';
  }

  // 11. Buruh Harian Lepas
  if (
    text.includes('buruh') ||
    text.includes('kuli') ||
    text.includes('tukang') ||
    text.includes('asisten rumah tangga') ||
    text.includes('art') ||
    text.includes('harian lepas')
  ) {
    return 'Buruh Harian Lepas';
  }

  // 12. Karyawan Swasta / BUMN
  if (
    text.includes('karyawan') ||
    text.includes('swasta') ||
    text.includes('bumn') ||
    text.includes('pegawai') ||
    text.includes('staf') ||
    text.includes('satpam') ||
    text.includes('security')
  ) {
    return 'Karyawan Swasta / BUMN';
  }

  // Jika tidak cocok apa pun tapi usia < 7 tahun
  if (age !== null && age < 7) {
    return 'Anak Pra-Sekolah / PAUD';
  }

  return 'Lainnya';
}

/**
 * Menghitung agregat demografi profesi dari sekumpulan warga
 */
export function aggregateOccupations(citizens: Citizen[]): OccupationSummary {
  const total = citizens.length;
  const countMap: Record<OccupationCategory, { total: number; male: number; female: number }> = {
    'PNS / ASN / PPPK': { total: 0, male: 0, female: 0 },
    'TNI / POLRI': { total: 0, male: 0, female: 0 },
    'Pelajar / Mahasiswa': { total: 0, male: 0, female: 0 },
    'Anak Pra-Sekolah / PAUD': { total: 0, male: 0, female: 0 },
    'Petani / Pekebun / Peternak': { total: 0, male: 0, female: 0 },
    'Nelayan / Perikanan': { total: 0, male: 0, female: 0 },
    'Wiraswasta / Pedagang': { total: 0, male: 0, female: 0 },
    'Karyawan Swasta / BUMN': { total: 0, male: 0, female: 0 },
    'Buruh Harian Lepas': { total: 0, male: 0, female: 0 },
    'Ibu Rumah Tangga': { total: 0, male: 0, female: 0 },
    'Pensiunan': { total: 0, male: 0, female: 0 },
    'Belum / Tidak Bekerja': { total: 0, male: 0, female: 0 },
    'Lainnya': { total: 0, male: 0, female: 0 },
  };

  citizens.forEach((c) => {
    const category = normalizeOccupation(c.pekerjaan, c.tanggal_lahir, c.nik);
    countMap[category].total += 1;
    if (c.jenis_kelamin === 'L') {
      countMap[category].male += 1;
    } else if (c.jenis_kelamin === 'P') {
      countMap[category].female += 1;
    }
  });

  const stats: OccupationStat[] = OCCUPATION_CATEGORIES.map((cat) => {
    const item = countMap[cat];
    return {
      category: cat,
      count: item.total,
      maleCount: item.male,
      femaleCount: item.female,
      percentage: total > 0 ? Number(((item.total / total) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[cat],
    };
  }).sort((a, b) => b.count - a.count);

  const workingCategories: OccupationCategory[] = [
    'PNS / ASN / PPPK',
    'TNI / POLRI',
    'Petani / Pekebun / Peternak',
    'Nelayan / Perikanan',
    'Wiraswasta / Pedagang',
    'Karyawan Swasta / BUMN',
    'Buruh Harian Lepas',
  ];

  const workingCount = stats
    .filter((s) => workingCategories.includes(s.category))
    .reduce((acc, curr) => acc + curr.count, 0);

  const studentCount = countMap['Pelajar / Mahasiswa'].total;
  const preschoolCount = countMap['Anak Pra-Sekolah / PAUD'].total;
  const unemployedCount = countMap['Belum / Tidak Bekerja'].total;
  const homemakerCount = countMap['Ibu Rumah Tangga'].total;

  return {
    totalCitizens: total,
    workingCount,
    studentCount,
    preschoolCount,
    unemployedCount,
    homemakerCount,
    stats,
  };
}

/**
 * Menghasilkan data CSV Rekapitulasi Monografi Profesi siap diserahkan ke Dinas/Kecamatan
 */
export function generateOccupationReportCsv(citizens: Citizen[], villageName: string = 'Desa'): string {
  const summary = aggregateOccupations(citizens);
  const nowStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const lines: string[] = [
    `"LAPORAN REKAPITULASI MONOGRAFI MATA PENCAHARIAN / PROFESI PENDUDUK"`,
    `"PEMERINTAH ${villageName.toUpperCase()}"`,
    `"Tanggal Laporan: ${nowStr}"`,
    `""`,
    `"No","Kategori Profesi / Pekerjaan","Laki-Laki (Jiwa)","Perempuan (Jiwa)","Total (Jiwa)","Persentase (%)"`,
  ];

  summary.stats.forEach((st, idx) => {
    lines.push(
      `"${idx + 1}","${st.category}","${st.maleCount}","${st.femaleCount}","${st.count}","${st.percentage}%"`
    );
  });

  lines.push(`""`);
  lines.push(
    `"TOTAL","PENDUDUK TERDATA","${citizens.filter((c) => c.jenis_kelamin === 'L').length}","${citizens.filter((c) => c.jenis_kelamin === 'P').length}","${summary.totalCitizens}","100.0%"`
  );
  lines.push(`""`);
  lines.push(`"RINGKASAN DEMOGRAFI & ANGKATAN KERJA"`);
  lines.push(`"Total Penduduk Bekerja Produktif: ${summary.workingCount} Jiwa"`);
  lines.push(`"Total Pelajar / Mahasiswa: ${summary.studentCount} Jiwa"`);
  lines.push(`"Total Anak Usia Dini / Pra-Sekolah (PAUD): ${summary.preschoolCount} Jiwa"`);
  lines.push(`"Total Pengurus Rumah Tangga: ${summary.homemakerCount} Jiwa"`);
  lines.push(`"Total Belum / Tidak Bekerja (Usia Kerja): ${summary.unemployedCount} Jiwa"`);

  return lines.join('\n');
}
