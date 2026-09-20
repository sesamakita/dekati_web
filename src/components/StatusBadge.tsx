// src/components/StatusBadge.tsx
import React from 'react';
import { LetterStatus, ComplaintStatus } from '../types';
import { 
  Clock, 
  Search, 
  FileCheck2, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Wrench 
} from 'lucide-react';

interface LetterStatusBadgeProps {
  status: LetterStatus;
}

export const LetterStatusBadge: React.FC<LetterStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'submitted':
      return (
        <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3 h-3 text-amber-600" />
          Menunggu Verifikasi
        </span>
      );
    case 'in_verification':
      return (
        <span className="badge-pill bg-sky-50 text-sky-700 border border-sky-200/80">
          <Search className="w-3 h-3 text-sky-600" />
          Pemeriksaan Berkas
        </span>
      );
    case 'approved':
      return (
        <span className="badge-pill bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <FileCheck2 className="w-3 h-3 text-indigo-600" />
          Disetujui • Siap TTE
        </span>
      );
    case 'signed':
      return (
        <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <QrCode className="w-3 h-3 text-emerald-600" />
          TTE QR Terbit
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span className="badge-pill bg-teal-50 text-teal-700 border border-teal-200/80">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          Siap Diambil
        </span>
      );
    case 'completed':
      return (
        <span className="badge-pill bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          Selesai
        </span>
      );
    case 'rejected':
      return (
        <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200/80">
          <XCircle className="w-3 h-3 text-rose-600" />
          Ditolak
        </span>
      );
    case 'needs_revision':
      return (
        <span className="badge-pill bg-orange-50 text-orange-700 border border-orange-200/80">
          <AlertCircle className="w-3 h-3 text-orange-600" />
          Perlu Revisi
        </span>
      );
    default:
      return null;
  }
};

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
}

export const ComplaintStatusBadge: React.FC<ComplaintStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'submitted':
      return (
        <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3 h-3 text-amber-600" />
          Laporan Masuk
        </span>
      );
    case 'verified':
      return (
        <span className="badge-pill bg-sky-50 text-sky-700 border border-sky-200/80">
          <Search className="w-3 h-3 text-sky-600" />
          Diverifikasi
        </span>
      );
    case 'in_progress':
      return (
        <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200/80">
          <Wrench className="w-3 h-3 text-blue-600 animate-pulse" />
          Dalam Penanganan
        </span>
      );
    case 'resolved':
      return (
        <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Selesai Ditangani
        </span>
      );
    case 'rejected':
      return (
        <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200/80">
          <XCircle className="w-3 h-3 text-rose-600" />
          Ditolak / Non-Kewenangan
        </span>
      );
    default:
      return null;
  }
};
