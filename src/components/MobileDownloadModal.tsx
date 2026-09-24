// src/components/MobileDownloadModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://dekati.desa.id/download/dekatip_app.apk');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex items-center justify-center animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Aplikasi Mobile Warga</h3>
              <p className="text-xs text-slate-500 font-medium">Dekati (Desa Kita Dekat di Hati) untuk Android & iOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 border border-transparent hover:border-slate-200/60 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* QR Code Scan Area */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
              {/* Simulated QR Code Canvas */}
              <div className="w-32 h-32 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white relative overflow-hidden group">
                <QrCode className="w-24 h-24 text-white opacity-95" />
                <div className="absolute inset-0 bg-emerald-600/90 text-white flex flex-col items-center justify-center p-2 text-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Pindai dengan Kamera HP Anda</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Gratis & Aman (Bebas Iklan)
              </span>
              <h4 className="text-sm font-bold text-slate-900">Pindai QR untuk Buka di Ponsel</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Arahkan kamera smartphone Anda ke QR code untuk langsung mengunduh file APK resmi atau membuka versi Web App mandiri.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href="#unduh-apk"
              onClick={(e) => {
                e.preventDefault();
                alert('Mengunduh paket APK instalasi "Dekati Warga v1.0.0" (Simulasi).');
              }}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all transform active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Langsung File APK Android (24 MB)</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Unduhan'}</span>
              </button>

              <button
                onClick={() => {
                  alert('Aplikasi warga dapat diakses via Expo Go atau PWA di peramban seluler Anda.');
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200/60"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Web App</span>
              </button>
            </div>
          </div>

          {/* 3 Easy Steps */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">3 Langkah Mudah Penggunaan Warga:</h5>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Unduh & instal aplikasi <strong>Dekati</strong> di smartphone Anda.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Masuk dengan Nomor Induk Kependudukan (NIK) Anda yang terdaftar di Buku Induk Kependudukan Desa.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Langsung nikmati layanan E-Surat TTE QR, lapor fasilitas desa, dan info bansos dari genggaman.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Terhubung Real-Time ke Server Desa
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
