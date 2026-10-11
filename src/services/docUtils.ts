// src/services/docUtils.ts
import { Citizen } from '../types';

export interface DocInfo {
  label: string;
  type: 'ktp' | 'akta' | 'kia' | 'kk' | 'ijazah' | 'nikah' | 'other' | 'none';
  ktpUrl?: string | null;
  otherDocUrl?: string | null;
  hasDoc: boolean;
}

export function resolveCitizenDocInfo(citizen: Partial<Citizen> | null | undefined): DocInfo {
  if (!citizen) {
    return { label: 'Belum Ada', type: 'none', hasDoc: false };
  }

  const ktpPath = citizen.foto_ktp_path || null;
  const kkPath = citizen.foto_kk_path || null;

  // 1. If explicit foto_ktp_path exists, it is definitely e-KTP
  if (ktpPath) {
    return {
      label: 'e-KTP',
      type: 'ktp',
      ktpUrl: ktpPath,
      otherDocUrl: kkPath && kkPath !== ktpPath ? kkPath : null,
      hasDoc: true,
    };
  }

  // 2. If foto_kk_path exists, inspect doctype query parameter or filename keywords
  if (kkPath) {
    const lower = kkPath.toLowerCase();

    // Check doctype query parameter
    const docParamMatch = kkPath.match(/[?&]doctype=([^&]+)/i);
    if (docParamMatch) {
      const decoded = decodeURIComponent(docParamMatch[1]).trim();
      const decLower = decoded.toLowerCase();
      if (decLower.includes('ktp')) {
        return { label: 'e-KTP', type: 'ktp', ktpUrl: kkPath, otherDocUrl: null, hasDoc: true };
      }
      if (decLower.includes('akta')) {
        return { label: 'Akta Kelahiran', type: 'akta', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
      }
      if (decLower.includes('kia')) {
        return { label: 'KIA', type: 'kia', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
      }
      if (decLower.includes('ijazah')) {
        return { label: 'Ijazah', type: 'ijazah', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
      }
      if (decLower.includes('nikah')) {
        return { label: 'Surat Nikah', type: 'nikah', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
      }
      if (decLower.includes('kk') || decLower.includes('keluarga')) {
        return { label: 'Kartu Keluarga (KK)', type: 'kk', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
      }
      return { label: decoded, type: 'other', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }

    // Check filename prefix or keyword
    if (lower.includes('/ktp_') || lower.includes('_ktp_') || lower.includes('ktp-el') || lower.includes('e-ktp')) {
      return { label: 'e-KTP', type: 'ktp', ktpUrl: kkPath, otherDocUrl: null, hasDoc: true };
    }
    if (lower.includes('/akta_') || lower.includes('_akta_')) {
      return { label: 'Akta Kelahiran', type: 'akta', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }
    if (lower.includes('/kia_') || lower.includes('_kia_')) {
      return { label: 'KIA', type: 'kia', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }
    if (lower.includes('/ijazah_') || lower.includes('_ijazah_')) {
      return { label: 'Ijazah', type: 'ijazah', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }
    if (lower.includes('/surat_nikah_') || lower.includes('_nikah_')) {
      return { label: 'Surat Nikah', type: 'nikah', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }
    if (lower.includes('/kartu_keluarga_') || lower.includes('_kk_')) {
      return { label: 'Kartu Keluarga (KK)', type: 'kk', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
    }

    // Heuristic fallback: if the citizen is Kepala Keluarga, Istri, or adult, single attached doc is e-KTP
    const status = (citizen.status_dalam_keluarga || '').toLowerCase();
    if (status.includes('kepala') || status.includes('istri') || status.includes('suami') || status.includes('orang tua') || status.includes('mertua')) {
      return { label: 'e-KTP', type: 'ktp', ktpUrl: kkPath, otherDocUrl: null, hasDoc: true };
    }

    return { label: 'Dokumen Fisik', type: 'other', ktpUrl: null, otherDocUrl: kkPath, hasDoc: true };
  }

  // 3. If foto_selfie_ktp_path exists alone
  if (citizen.foto_selfie_ktp_path) {
    return { label: 'Swafoto KTP', type: 'ktp', ktpUrl: null, otherDocUrl: null, hasDoc: true };
  }

  return { label: 'Belum Ada', type: 'none', hasDoc: false };
}
