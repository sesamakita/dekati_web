// src/components/VillageQrModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  QrCode, 
  Printer, 
  Copy, 
  Check, 
  Building2, 
  Sparkles, 
  Download,
  Info,
  Smartphone,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../hooks/useData';

interface VillageQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VillageQrModal: React.FC<VillageQrModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useData();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const villageCode = profile.code || '6471011003';
  const qrPayload = JSON.stringify({
    app: 'dekati',
    code: villageCode,
    name: profile.name,
    district: profile.district,
    regency: profile.regency,
    province: profile.province,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(villageCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col overflow-hidden border border-slate-200/80 relative print:shadow-none print:border-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Hidden on Print) */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/40 print:hidden">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 leading-tight">QR & Kode Pendaftaran Warga</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">Brosur sosialisasi & kunjungan door-to-door</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0 ml-3"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Printable Card */}
        <div className="p-6 overflow-y-auto space-y-5 print:p-8">
          {/* Printable Flyer Container */}
          <div className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-6 bg-gradient-to-b from-emerald-50/40 to-white text-center print:border-2 print:border-slate-800 print:rounded-2xl">
            {/* Header Instansi */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-100/90 text-emerald-800 text-[11px] font-bold uppercase tracking-wider rounded-full mb-3 print:bg-slate-100 print:text-slate-900">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>PEMERINTAH {profile.name.toUpperCase()}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Pendaftaran Layanan Desa Digital
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-semibold flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{profile.district}, {profile.regency}, {profile.province}</span>
            </p>

            {/* Large QR Code */}
            <div className="my-5 inline-block p-4 bg-white rounded-2xl shadow-lg shadow-emerald-900/5 border border-slate-200/80 print:shadow-none print:border-2 print:border-slate-900">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Kode Registrasi Box */}
            <div className="max-w-xs mx-auto bg-slate-900 text-white rounded-2xl p-3 shadow-md print:bg-white print:text-black print:border-2 print:border-black">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5 print:text-slate-600">
                KODE REGISTRASI RESMI DESA:
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-black tracking-widest text-emerald-400 print:text-black">
                  {villageCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors print:hidden"
                  title="Salin Kode Desa"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1 animate-fade-in print:hidden">
                  ✓ Kode tersalin ke clipboard!
                </span>
              )}
            </div>

            {/* 3 Langkah Mudah */}
            <div className="mt-5 pt-4 border-t border-slate-200/70 text-left">
              <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Petunjuk Pendaftaran Akun Warga:</span>
              </p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
                <li>Buka aplikasi <strong>Dekati</strong> di smartphone warga.</li>
                <li>Pada halaman daftar, klik menu <strong>"Punya Kode Petugas Desa"</strong>.</li>
                <li>Scan QR Code di atas atau ketikkan kode <strong>{villageCode}</strong>. Data desa akan langsung terisi otomatis!</li>
              </ol>
            </div>
          </div>

          {/* Info Banner for Officers (Hidden on Print) */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs print:hidden">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Tips Petugas / Aparat Desa:</strong>
              <p className="text-amber-800 mt-0.5">
                Cetak brosur ini dan bawa saat kunjungan rumah warga (*door-to-door*). Warga lansia atau yang kesulitan mencari wilayah dapat langsung dibimbing dengan memasukkan kode desa ini.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print Brosur</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
