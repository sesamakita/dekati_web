// src/views/landing/LandingNavbar.tsx
import React from 'react';
import { Building2, Smartphone, ShieldCheck, Search } from 'lucide-react';

interface LandingNavbarProps {
  onEnterAdmin: () => void;
  onOpenDownloadModal: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onEnterAdmin,
  onOpenDownloadModal,
}) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Portal Identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Dekati</span>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#hero" className="hover:text-emerald-600 transition-colors">Beranda</a>
          <a href="#lacak-surat" className="hover:text-emerald-600 transition-colors">Lacak Surat</a>
          <a href="#dua-platform" className="hover:text-emerald-600 transition-colors">Fitur Pamong & Warga</a>
          <a href="#transparansi" className="hover:text-emerald-600 transition-colors">APBDes Publik</a>
          <a href="#pengumuman" className="hover:text-emerald-600 transition-colors">Siaran Desa</a>
          <a href="#faq" className="hover:text-emerald-600 transition-colors">Tanya Jawab</a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Lacak Surat Button (Quick Jump) */}
          <div className="relative group/tooltip inline-block">
            <a
              href="#lacak-surat"
              aria-label="Lacak Status Surat Mandiri"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/70 transition-all shadow-xs hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4 text-slate-600" />
            </a>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Lacak Status Surat Mandiri
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>

          {/* Buka Mobile App Modal */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={onOpenDownloadModal}
              aria-label="Aplikasi Mobile Warga"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 transition-all shadow-xs hover:scale-105 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Aplikasi Mobile Warga
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>

          {/* MASUK DASHBOARD ADMIN DESA / LURAH */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={onEnterAdmin}
              aria-label="Masuk Portal Admin Desa"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Masuk Portal Admin Desa
              <div className="absolute bottom-full right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
