// src/components/QrVerifyModal.tsx
import React from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle, 
  ExternalLink, 
  Building2, 
  Calendar, 
  FileText, 
  User, 
  Copy, 
  Check 
} from 'lucide-react';
import { LetterRequest } from '../types';

interface QrVerifyModalProps {
  letter: LetterRequest;
  onClose: () => void;
}

export const QrVerifyModal: React.FC<QrVerifyModalProps> = ({ letter, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    if (letter.qr_verification_url) {
      navigator.clipboard.writeText(letter.qr_verification_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verification Emblem */}
        <div className="text-center pt-2 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner mb-3">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            TANDA TANGAN ELEKTRONIK SAH
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Verifikasi Keaslian Dokumen
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem E-Surat Resmi Pemerintah Desa Sukamaju
          </p>
        </div>

        {/* QR Code Graphic Simulator */}
        <div className="my-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                letter.qr_verification_url || letter.tracking_number
              )}`}
              alt="QR Code Verifikasi"
              className="w-36 h-36 object-contain"
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-md">
              TOKEN: {letter.qr_verification_token || 'TOKEN-BELUM-TERBIT'}
            </span>
          </div>
        </div>

        {/* Document Meta List */}
        <div className="space-y-2.5 py-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> No. Surat Resmi:
            </span>
            <span className="font-bold text-slate-800 text-right font-mono">
              {letter.letter_official_number || letter.tracking_number}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Pemohon / Warga:
            </span>
            <span className="font-bold text-slate-800 text-right">
              {letter.citizen_name} ({letter.citizen_nik})
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Penandatangan:
            </span>
            <span className="font-bold text-emerald-800 text-right">
              {letter.signed_by_name || 'Kepala Desa Sukamaju'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Pengesahan:
            </span>
            <span className="font-bold text-slate-800 text-right">
              {letter.signed_at || letter.created_at}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tautan Disalin!' : 'Salin URL Verifikasi'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
