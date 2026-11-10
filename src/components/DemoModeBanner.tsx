// src/components/DemoModeBanner.tsx
// Banner pita mengambang untuk Mode Simulasi / Demo Interaktif.
// Membantu calon pengguna mengetahui bahwa mereka sedang menjelajahi data percontohan lengkap,
// serta memfasilitasi beralih antara Versi Desa & Kelurahan, Reset Data, dan Pendaftaran Wilayah Baru.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  RefreshCw,
  X
} from 'lucide-react';
import { useData } from '../hooks/useData';

export const DemoModeBanner: React.FC = () => {
  const navigate = useNavigate();
  const { demoMode, loadDemoAccount, resetDemoData, profile, logoutOfficial } = useData();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  if (!demoMode) {
    return null;
  }

  const isKelurahan = demoMode === 'kelurahan' || profile.village_type === 'kelurahan';

  const handleSwitchMode = (targetMode: 'desa' | 'kelurahan') => {
    loadDemoAccount(targetMode);
  };

  const handleResetData = () => {
    setIsResetting(true);
    resetDemoData(demoMode);
    setTimeout(() => {
      setIsResetting(false);
      setShowResetNotice(true);
      setTimeout(() => setShowResetNotice(false), 3000);
    }, 400);
  };

  const handleRegisterNewVillage = () => {
    logoutOfficial();
    navigate('/login?mode=register');
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 shadow-md relative z-30 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Demo Indicator & Current Profile */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Mode Simulasi Demo Aktif</span>
          </div>

          <span className="text-slate-300 font-medium hidden sm:inline">•</span>

          <span className="text-slate-200 font-semibold">
            {isKelurahan ? '🏛️ Percontohan Kelurahan' : '🌾 Percontohan Desa'}: <strong className="text-white">{profile.name}</strong>
          </span>

          {/* Quick Switcher Button between Desa and Kelurahan */}
          <button
            type="button"
            onClick={() => handleSwitchMode(isKelurahan ? 'desa' : 'kelurahan')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white border border-white/15 transition-all cursor-pointer font-bold"
            title={isKelurahan ? 'Beralih ke Demo Versi Desa Sukamaju' : 'Beralih ke Demo Versi Kelurahan Menteng Asri'}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isKelurahan ? 'Beralih ke Versi Desa' : 'Beralih ke Versi Kelurahan'}</span>
          </button>
        </div>

        {/* Right: Actions (Reset & Call-to-Action Register) */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center md:justify-end">
          {showResetNotice && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 animate-fade-in bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Data demo direset ke awal</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 transition-all cursor-pointer font-bold disabled:opacity-50"
            title="Kembalikan seluruh data simulasi ke kondisi awal"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-300 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Data</span>
          </button>

          <button
            type="button"
            onClick={handleRegisterNewVillage}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold shadow-sm shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Daftarkan Wilayah Anda (Gratis)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
