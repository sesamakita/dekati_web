// src/services/occupationUtils.ts
import { Citizen } from '../types';

export const OCCUPATION_CATEGORIES = [
  'PNS / ASN / PPPK',
  'TNI / POLRI',
  'Pelajar / Mahasiswa',
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
  unemployedCount: number;
  homemakerCount: number;
  stats: OccupationStat[];
}

const CATEGORY_COLORS: Record<OccupationCategory, string> = {
  'PNS / ASN / PPPK': '#2563EB',          // Blue
  'TNI / POLRI': '#1E3A8A',              // Navy
  'Pelajar / Mahasiswa': '#0D9488',      // Teal
  'Petani / Pekebun / Peternak': '#16A34A', // Green
  'Nelayan / Perikanan': '#0284C7',      // Sky
  'Wiraswasta / Pedagang': '#D97706',    // Amber
  'Karyawan Swasta / BUMN': '#6366F1',   // Indigo
  'Buruh Harian Lepas': '#EA580C',       // Orange
  'Ibu Rumah Tangga': '#DB2777',         // Pink
  'Pensiunan': '#64748B',                // Slate
  'Belum / Tidak Bekerja': '#94A3B8',    // Light slate
  'Lainnya': '#A855F7',                  // Purple
};

/**
 * Menormalkan variasi teks pekerjaan warga ke salah satu dari kategori standar Kemendagri / BPS
 */
export function normalizeOccupation(raw?: string): OccupationCategory {
  if (!raw || !raw.trim()) return 'Belum / Tidak Bekerja';
  
  const text = raw.trim().toLowerCase();

  // 1. TNI / POLRI
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

  // 2. PNS / ASN / PPPK
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

  // 3. Pelajar / Mahasiswa
  if (
    text.includes('pelajar') ||
    text.includes('mahasiswa') ||
    text.includes('siswa') ||
    text.includes('santri') ||
    text.includes('sekolah') ||
    text.includes('kuliah')
  ) {
    return 'Pelajar / Mahasiswa';
  }

  // 4. Petani / Pekebun / Peternak
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

  // 5. Nelayan / Perikanan
  if (
    text.includes('nelayan') ||
    text.includes('perikanan') ||
    text.includes('tambak') ||
    text.includes('pelaut')
  ) {
    return 'Nelayan / Perikanan';
  }

  // 6. Ibu Rumah Tangga
  if (
    text.includes('ibu rumah tangga') ||
    text.includes('mengurus rumah tangga') ||
    text.includes('irt') ||
    text.includes('rumah tangga')
  ) {
    return 'Ibu Rumah Tangga';
  }

  // 7. Pensiunan
  if (text.includes('pensiun') || text.includes('purnawirawan')) {
    return 'Pensiunan';
  }

  // 8. Belum / Tidak Bekerja
  if (
    text.includes('belum') ||
    text.includes('tidak bekerja') ||
    text.includes('pengangguran') ||
    text.includes('belum/tidak') ||
    text.includes('balita') ||
    text.includes('anak')
  ) {
    return 'Belum / Tidak Bekerja';
  }

  // 9. Wiraswasta / Pedagang
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

  // 10. Buruh Harian Lepas
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

  // 11. Karyawan Swasta / BUMN
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
    const category = normalizeOccupation(c.pekerjaan);
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
  const unemployedCount = countMap['Belum / Tidak Bekerja'].total;
  const homemakerCount = countMap['Ibu Rumah Tangga'].total;

  return {
    totalCitizens: total,
    workingCount,
    studentCount,
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
  lines.push(`"RINGKASAN ANGKATAN KERJA"`);
  lines.push(`"Total Penduduk Bekerja Produktif: ${summary.workingCount} Jiwa"`);
  lines.push(`"Total Pelajar / Mahasiswa: ${summary.studentCount} Jiwa"`);
  lines.push(`"Total Pengurus Rumah Tangga: ${summary.homemakerCount} Jiwa"`);
  lines.push(`"Total Belum / Tidak Bekerja: ${summary.unemployedCount} Jiwa"`);

  return lines.join('\n');
}
