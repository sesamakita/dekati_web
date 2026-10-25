// src/utils/rbac.ts
import { VillageOfficial, UserRole } from '../types';
import { NavTab } from '../components/Sidebar';

/**
 * Matriks Hak Akses Modul berdasarkan Jabatan Nomenklatur Permendagri 84/2015
 */
export const ROLE_PERMITTED_TABS: Record<string, NavTab[]> = {
  // Pimpinan Desa (Akses Penuh Seluruh Modul + Otoritas TTE QR)
  kades: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'],
  lurah: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'],
  sekdes: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'],
  superadmin: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'],
  admin_desa: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'],

  // Kasi Pelayanan & Kasi Pemerintahan (Fokus: E-Surat, Kependudukan, & Siaran Warga)
  kasi_layanan: ['dashboard', 'letters', 'citizens', 'announcements'],
  kasi_pemerintahan: ['dashboard', 'letters', 'citizens', 'announcements'],

  // Kaur Keuangan (Fokus: Transparansi APBDes & Realisasi Anggaran)
  kaur_keuangan: ['dashboard', 'apbdes'],

  // Kasi Kesra & Kaur Pembangunan (Fokus: Pengaduan Fasilitas & Agenda Kegiatan)
  kasi_kesra: ['dashboard', 'complaints', 'events'],
  kaur_pembangunan: ['dashboard', 'complaints', 'events'],
  kaur_perencanaan: ['dashboard', 'complaints', 'events', 'apbdes'],

  // Kaur TU & Umum / Operator Administrasi (Operasional Administrasi Harian)
  kaur_tu_umum: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events'],
  operator: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events'],
  petugas_layanan: ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events'],

  // Kepala Dusun / RT / RW / Satlinmas (Kewilayahan Lapangan)
  kadus: ['dashboard', 'complaints', 'announcements', 'events'],
  ketua_rt_rw: ['dashboard', 'complaints', 'announcements', 'events'],
  satlinmas: ['dashboard', 'complaints', 'events']
};

/**
 * Mendapatkan daftar tab yang diizinkan untuk aparatur tertentu
 */
export function getPermittedTabs(official: VillageOfficial | null | undefined): NavTab[] {
  if (!official || !official.role) {
    // Default fallback ke akses lengkap jika belum ada sesi spesifik
    return ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'];
  }

  const cleanRole = official.role.toLowerCase().trim();
  const tabs = ROLE_PERMITTED_TABS[cleanRole];
  if (tabs && tabs.length > 0) {
    return tabs;
  }

  // Fallback berdasarkan kata kunci peran
  if (cleanRole.includes('kades') || cleanRole.includes('lurah') || cleanRole.includes('sekdes')) {
    return ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events', 'apbdes'];
  }
  if (cleanRole.includes('keuangan')) {
    return ['dashboard', 'apbdes'];
  }
  if (cleanRole.includes('layanan') || cleanRole.includes('pemerintahan')) {
    return ['dashboard', 'letters', 'citizens', 'announcements'];
  }

  return ['dashboard', 'letters', 'complaints', 'citizens', 'announcements', 'events'];
}

/**
 * Memeriksa apakah aparatur memiliki kewenangan menandatangani TTE QR akhir
 */
export function canSignTte(official: VillageOfficial | null | undefined): boolean {
  if (!official) return false;
  if (official.can_sign_tte) return true;
  const role = (official.role || '').toLowerCase().trim();
  return role === 'kades' || role === 'lurah';
}

/**
 * Memeriksa apakah aparatur memiliki kewenangan mengelola aparatur lain & akun staf
 */
export function canManageOfficials(official: VillageOfficial | null | undefined): boolean {
  if (!official) return false;
  const role = (official.role || '').toLowerCase().trim();
  return role === 'kades' || role === 'lurah' || role === 'sekdes' || role === 'superadmin' || role === 'admin_desa';
}

/**
 * Nama gelar jabatan rapi untuk UI
 */
export function getRoleDisplayName(role: string, villageType: 'desa' | 'kelurahan' = 'desa'): string {
  const clean = (role || '').toLowerCase().trim();
  switch (clean) {
    case 'kades':
      return 'Kepala Desa';
    case 'lurah':
      return 'Lurah';
    case 'sekdes':
      return villageType === 'kelurahan' ? 'Sekretaris Kelurahan' : 'Sekretaris Desa (Carik)';
    case 'kasi_layanan':
      return 'Kasi Pelayanan';
    case 'kasi_pemerintahan':
      return 'Kasi Pemerintahan';
    case 'kasi_kesra':
      return 'Kasi Kesejahteraan (Kesra)';
    case 'kaur_keuangan':
      return 'Kaur Keuangan (Bendahara)';
    case 'kaur_pembangunan':
      return 'Kaur Pembangunan';
    case 'kaur_perencanaan':
      return 'Kaur Perencanaan';
    case 'kaur_tu_umum':
      return 'Kaur Tata Usaha & Umum';
    case 'kadus':
      return 'Kepala Dusun (Kadus)';
    case 'operator':
      return 'Operator Administrasi Desa';
    case 'satlinmas':
      return 'Komandan Satlinmas';
    default:
      return role.replace(/_/g, ' ').toUpperCase();
  }
}
