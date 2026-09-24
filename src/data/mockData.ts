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

export const initialEmergencyContacts: EmergencyContact[] = [];

export const initialVillageEvents: VillageEvent[] = [];
