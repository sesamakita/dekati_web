// src/components/CitizenVerifyModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Eye, 
  CreditCard, 
  Camera 
} from 'lucide-react';
import { Citizen } from '../types';
import { useData } from '../hooks/useData';

interface CitizenVerifyModalProps {
  citizen: Citizen;
  onClose: () => void;
}

export const CitizenVerifyModal: React.FC<CitizenVerifyModalProps> = ({ citizen, onClose }) => {
  const { verifyCitizen } = useData();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const handleApprove = () => {
    verifyCitizen(citizen.id, true);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon tulis alasan penolakan verifikasi.');
      return;
    }
    verifyCitizen(citizen.id, false, rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container: Max-height with safe viewport distance up and down */}
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Fixed Header Bar */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                NIK: {citizen.nik}
              </span>
              <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
                Menunggu Verifikasi
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Validasi Akun Warga: {citizen.nama_lengkap}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Data Kependudukan Terdaftar:
            </span>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-slate-400">Nomor Kartu Keluarga:</span>
                <p className="font-mono font-semibold text-slate-800">{citizen.no_kk}</p>
              </div>
              <div>
                <span className="text-slate-400">Tempat, Tanggal Lahir:</span>
                <p className="font-semibold text-slate-800">{citizen.tempat_lahir}, {citizen.tanggal_lahir}</p>
              </div>
              <div>
                <span className="text-slate-400">Wilayah:</span>
                <p className="font-semibold text-slate-800">{citizen.dusun} (RT {citizen.rt}/RW {citizen.rw})</p>
              </div>
              <div>
                <span className="text-slate-400">Status Keluarga:</span>
                <p className="font-semibold text-slate-800">{citizen.status_dalam_keluarga}</p>
              </div>
            </div>
          </div>

          {/* Photo verification grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-500" /> Foto KTP
              </span>
              <div className="h-32 bg-slate-200 rounded-xl overflow-hidden">
                <img
                  src={citizen.foto_ktp_path || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                  alt="KTP"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-center gap-1">
                <Camera className="w-3 h-3 text-slate-500" /> Swafoto Pegang KTP
              </span>
              <div className="h-32 bg-slate-200 rounded-xl overflow-hidden">
                <img
                  src={citizen.foto_selfie_ktp_path || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'}
                  alt="Selfie"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Reject box */}
          {showRejectBox && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Alasan Penolakan Akun:
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Foto KTP buram, NIK tidak cocok dengan Disdukcapil"
                className="w-full p-2 text-xs bg-white rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Tolak Akun
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Action Bar */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          {!showRejectBox && (
            <button
              onClick={() => setShowRejectBox(true)}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              Tolak Validasi
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Setujui & Verifikasi Warga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
