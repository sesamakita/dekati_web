// src/types/index.ts

export type UserRole = 'superadmin' | 'kades' | 'lurah' | 'admin_desa' | 'sekdes' | 'kasi_layanan' | 'kaur_keuangan' | 'kaur_pembangunan' | 'satlinmas' | 'operator' | 'petugas_layanan' | 'ketua_rt_rw' | 'warga';

export type UserStatus = 'pending_verification' | 'active' | 'rejected' | 'suspended';

export interface VillageOfficial {
  id: string;
  user_id?: string;
  nik: string;
  nip?: string;
  nama_lengkap: string;
  email: string;
  role: 'kades' | 'lurah' | 'sekdes' | 'kasi_layanan' | 'kaur_keuangan' | 'kaur_pembangunan' | 'satlinmas' | 'operator' | 'admin_desa';
  village_id?: number;
  village_code: string;
  village_name: string;
  phone_number?: string;
  avatar_url?: string;
  can_sign_tte: boolean;
  status: 'active' | 'pending_approval' | 'suspended';
  last_login_at?: string;
  created_at?: string;
}

export type GenderType = 'L' | 'P';

export type LetterStatus =
  | 'submitted'        // Diajukan oleh warga
  | 'in_verification'  // Sedang diperiksa berkas oleh operator
  | 'needs_revision'   // Ada syarat yang kurang/salah
  | 'approved'         // Disetujui (siap TTE)
  | 'signed'           // Ditandatangani digital TTE QR
  | 'ready_for_pickup' // Siap diambil di balai desa
  | 'completed'        // Selesai
  | 'rejected';        // Ditolak

export type ComplaintStatus =
  | 'submitted'    // Laporan baru masuk
  | 'verified'     // Diverifikasi admin
  | 'in_progress'  // Sedang ditangani petugas lapangan
  | 'resolved'     // Selesai
  | 'rejected';    // Ditolak / bukan wewenang desa

export type TargetAudienceType = 'all' | 'dusun' | 'rw' | 'rt';

export type ApbdesType = 'pendapatan' | 'belanja' | 'pembiayaan';

export interface Citizen {
  id: string;
  user_id?: string;
  nik: string;
  no_kk: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: GenderType;
  agama: string;
  pekerjaan: string;
  status_perkawinan: string;
  status_dalam_keluarga: string;
  alamat_lengkap: string;
  rt: string;
  rw: string;
  dusun: string;
  phone_number?: string;
  email?: string;
  foto_ktp_path?: string;
  foto_kk_path?: string;
  foto_selfie_ktp_path?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface LetterType {
  id: number;
  code: string;
  name: string;
  description: string;
  estimated_days: number;
  icon: string;
  required_docs: string[];
}

export interface LetterTimelineStep {
  title: string;
  time: string;
  done: boolean;
  actor?: string;
}

export interface LetterRequest {
  id: string;
  tracking_number: string;
  letter_type_id: number;
  letter_name: string;
  applicant_user_id: string;
  applicant_name: string;
  applicant_phone?: string;
  citizen_id: string;
  citizen_name: string;
  citizen_nik: string;
  citizen_address?: string;
  status: LetterStatus;
  purpose: string;
  letter_official_number?: string;
  qr_verification_token?: string;
  qr_verification_url?: string;
  pdf_file_url?: string;
  signed_by_name?: string;
  signed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  attachments?: { name: string; url: string; verified?: boolean }[];
  timeline: LetterTimelineStep[];
}

export interface Complaint {
  id: string;
  ticket_number: string;
  category: string;
  title: string;
  description: string;
  location_address: string;
  rt: string;
  rw: string;
  dusun: string;
  reporter_name: string;
  reporter_phone?: string;
  is_anonymous: boolean;
  status: ComplaintStatus;
  photo_url?: string;
  resolution_proof?: string;
  resolution_notes?: string;
  assigned_department?: string;
  assigned_officer?: string;
  citizen_id?: string;
  citizen_nik?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Bansos' | 'Kesehatan' | 'Lingkungan' | 'Darurat' | 'Pemerintahan';
  summary: string;
  content: string;
  date: string;
  is_urgent: boolean;
  author: string;
  views: number;
  target_type: TargetAudienceType;
  target_value?: string;
}

export interface ApbdesItem {
  name: string;
  account_code: string;
  budget_amount: number;
  realized_amount: number;
  percentage: number;
}

export interface ApbdesData {
  fiscal_year: number;
  pendapatan: {
    total_budget: number;
    total_realized: number;
    items: ApbdesItem[];
  };
  belanja: {
    total_budget: number;
    total_realized: number;
    items: ApbdesItem[];
  };
  realisasi_persen: number;
}

export interface VillageProfile {
  name: string;
  code: string;
  district: string;
  regency: string;
  province: string;
  postal_code: string;
  office_address: string;
  office_phone: string;
  office_email: string;
  kades_name: string;
  sekdes_name: string;
  vision: string;
  mission: string[];
}
