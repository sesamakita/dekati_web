// src/data/mockData.ts
import {
  Citizen,
  LetterType,
  LetterRequest,
  Complaint,
  Announcement,
  ApbdesData,
  VillageProfile,
  EmergencyContact,
  VillageEvent
} from '../types';

export const initialVillageProfile: VillageProfile = {
  name: 'Pemerintah Desa',
  code: '',
  district: '',
  regency: '',
  province: '',
  postal_code: '',
  office_address: '',
  office_phone: '',
  office_email: '',
  kades_name: 'Kepala Desa',
  sekdes_name: 'Sekretaris Desa',
  vision: '',
  mission: []
};

export const initialCitizens: Citizen[] = [];

export const initialLetterTypes: LetterType[] = [
  {
    id: 1,
    code: 'SKTM',
    name: 'Surat Keterangan Tidak Mampu (SKTM)',
    description: 'Keperluan beasiswa kuliah, permohonan keringanan RS, atau bantuan pendidikan.',
    estimated_days: 1,
    icon: 'GraduationCap',
    required_docs: ['Foto KTP Pemohon', 'Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW']
  },
  {
    id: 2,
    code: 'SKU',
    name: 'Surat Keterangan Usaha (SKU)',
    description: 'Persyaratan pengajuan pinjaman modal usaha/KUR perbankan dan legalitas tempat usaha.',
    estimated_days: 1,
    icon: 'Store',
    required_docs: ['Foto KTP Pemilik Usaha', 'Foto Kartu Keluarga (KK)', 'Foto Tempat/Kegiatan Usaha']
  },
  {
    id: 3,
    code: 'SKCK_PENGANTAR',
    name: 'Surat Pengantar SKCK Kepolisian',
    description: 'Surat pengantar resmi ke Polsek untuk pembuatan SKCK melamar kerja / CPNS.',
    estimated_days: 1,
    icon: 'ShieldCheck',
    required_docs: ['Foto KTP', 'Foto Kartu Keluarga (KK)', 'Pas Foto Berwarna 4x6']
  },
  {
    id: 4,
    code: 'SK_DOMISILI',
    name: 'Surat Keterangan Domisili',
    description: 'Keterangan tempat tinggal sah bagi warga atau perorangan.',
    estimated_days: 1,
    icon: 'Home',
    required_docs: ['Foto KTP', 'Foto Kartu Keluarga', 'Bukti Pengantar RT/RW']
  }
];

export const initialLetterRequests: LetterRequest[] = [];

export const initialComplaints: Complaint[] = [];

export const initialAnnouncements: Announcement[] = [];

export const initialApbdes: ApbdesData = {
  fiscal_year: new Date().getFullYear(),
  pendapatan: {
    total_budget: 0,
    total_realized: 0,
    items: []
  },
  belanja: {
    total_budget: 0,
    total_realized: 0,
    items: []
  },
  realisasi_persen: 0
};

export const initialEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emg-1',
    title: 'Ambulans Desa 24 Jam',
    phone: '0812-3456-7890',
    icon: 'car',
    description: 'Layanan antar rujukan medis & persalinan darurat gratis warga',
    order_index: 1,
    is_active: true
  },
  {
    id: 'emg-2',
    title: 'Bhabinkamtibmas Polsek',
    phone: '0813-9876-5432',
    icon: 'shield',
    description: 'Petugas kepolisian pembina kamtibmas & keamanan wilayah desa',
    order_index: 2,
    is_active: true
  },
  {
    id: 'emg-3',
    title: 'Babinsa Koramil',
    phone: '0811-2233-4455',
    icon: 'shield-checkmark',
    description: 'Bintara pembina ketahanan wilayah & penanggulangan bencana',
    order_index: 3,
    is_active: true
  },
  {
    id: 'emg-4',
    title: 'Puskesmas / Bidan Desa',
    phone: '0821-5566-7788',
    icon: 'medkit',
    description: 'Pemeriksaan darurat medis, posyandu & layanan ibu-anak',
    order_index: 4,
    is_active: true
  },
  {
    id: 'emg-5',
    title: 'Sekretariat Kantor Desa',
    phone: '0251-876543',
    icon: 'business',
    description: 'Layanan informasi umum & pengaduan administrasi kantor desa',
    order_index: 5,
    is_active: true
  }
];

export const initialVillageEvents: VillageEvent[] = [
  {
    id: 'evt-1',
    title: 'Posyandu Balita & Lansia Dusun Mekar',
    category: 'Kesehatan',
    event_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    event_time: '08.30 - 11.30 WIB',
    location: 'Pos RW 01 Kp. Sukamaju',
    organizer: 'Kader Posyandu Melati',
    description: 'Pemeriksaan rutin tumbuh kembang balita, imunisasi dasar lengkap, serta cek tensi dan gula darah gratis bagi warga lansia.',
    is_active: true
  },
  {
    id: 'evt-2',
    title: 'Kerja Bakti Lingkungan & Normalisasi Drainase',
    category: 'Lingkungan',
    event_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    event_time: '07.00 - 10.00 WIB',
    location: 'Saluran Drainase RT 01 - RT 04',
    organizer: 'Karang Taruna & Satlinmas Desa',
    description: 'Gotong royong warga membersihkan sedimentasi saluran air untuk mengantisipasi genangan air di musim penghujan.',
    is_active: true
  },
  {
    id: 'evt-3',
    title: 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
    category: 'Pemerintahan',
    event_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    event_time: '09.00 - 12.30 WIB',
    location: 'Aula Balai Desa',
    organizer: 'BPD & Pemerintah Desa',
    description: 'Penyusunan usulan prioritas program kerja pembangunan desa bersama ketua RT, RW, dan tokoh masyarakat.',
    is_active: true
  }
];
