// src/views/landing/HeroSection.tsx
import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  Award 
} from 'lucide-react';

interface HeroSectionProps {
  onEnterAdmin: () => void;
  onOpenDownloadModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterAdmin,
  onOpenDownloadModal,
}) => {
  return (
    <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Portal Resmi Pemerintahan Desa & Kelurahan Terpadu
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloud Database Supabase Real-Time
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Satu Platform Cerdas untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
              Kepala Desa, Lurah, & Seluruh Warganya
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Menghubungkan kantor pemerintahan desa dan warga tanpa batas birokrasi manual.
            Pengajuan E-Surat dari ponsel, tanda tangan elektronik <strong>TTE QR Kades/Lurah</strong>,
            penanganan aduan lapangan cepat tanggap, dan transparansi anggaran APBDes terbuka.
          </p>

          {/* Dual CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onEnterAdmin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Buka Dashboard Admin Desa / Lurah</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-200/90 shadow-sm hover:shadow transition-all"
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Unduh Aplikasi Mobile Warga</span>
            </button>

            <a
              href="#lacak-surat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-slate-600 hover:text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Lacak Surat Mandiri</span>
            </a>
          </div>

          {/* Mini Trust Points */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-200/60 mt-8">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Bebas Antrean</div>
                <div className="text-[11px] text-slate-500">Urus surat 100% daring</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">TTE QR Code</div>
                <div className="text-[11px] text-slate-500">Standar BSSN anti-palsu</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Real-Time Sync</div>
                <div className="text-[11px] text-slate-500">Sinkron detik ke detik</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Regulasi Kemendagri</div>
                <div className="text-[11px] text-slate-500">Tertib buku registrasi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
