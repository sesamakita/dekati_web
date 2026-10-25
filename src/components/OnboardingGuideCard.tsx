// src/components/OnboardingGuideCard.tsx
// Komponen Panduan Langkah Awal (Onboarding Setup Checklist) untuk pengguna/pamong yang baru pertama kali mendaftar.
// Didesain khusus selaras dengan ekosistem Web Admin (dekati_web) dan APK Mobile Warga (dekatip_app).

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Network, 
  UserCheck, 
  Smartphone, 
  Users, 
  ArrowRight, 
  Sparkles,
  PartyPopper,
  X
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { NavTab } from './Sidebar';
import { VillageProfileModal } from './VillageProfileModal';
import { NeighborhoodUnitsManageModal } from './NeighborhoodUnitsManageModal';
import { VillageOfficialsManageModal } from './VillageOfficialsManageModal';
import { MobileDownloadModal } from './MobileDownloadModal';

interface OnboardingGuideCardProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const OnboardingGuideCard: React.FC<OnboardingGuideCardProps> = ({ onNavigateTab }) => {
  const { 
    profile, 
    citizens, 
    officials, 
    neighborhoodUnits, 
    currentOfficial, 
    activeRole 
  } = useData();

  const villageCode = (profile.code || currentOfficial?.village_code || 'default').replace(/\D/g, '') || 'default';
  const isKelurahan = profile.village_type === 'kelurahan';

  // Modal open states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRtModalOpen, setIsRtModalOpen] = useState(false);
  const [isOfficialsModalOpen, setIsOfficialsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Storage key for dismissed & collapsed state per village
  const dismissedStorageKey = `dekati_onboarding_dismissed_${villageCode}`;
  const collapsedStorageKey = `dekati_onboarding_collapsed_${villageCode}`;
  const apkSharedStorageKey = `dekati_onboarding_apk_shared_${villageCode}`;

  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(dismissedStorageKey) === 'true';
    } catch {
      return false;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(collapsedStorageKey) === 'true';
    } catch {
      return false;
    }
  });

  const [isApkShared, setIsApkShared] = useState(() => {
    try {
      return localStorage.getItem(apkSharedStorageKey) === 'true';
    } catch {
      return false;
    }
  });

  // Evaluasi status penyelesaian 5 langkah emas secara dinamis
  // Langkah 1: KOP & Identitas (Sudah isi logo desa/kabupaten atau alamat kantor)
  const isStep1Done = Boolean(
    (profile.logo_desa_url || profile.logo_kabupaten_url) && 
    profile.office_address && 
    profile.office_address.trim().length > 5
  );

  // Langkah 2: Struktur RT / RW & Dusun (Minimal ada 1 RT/RW)
  const isStep2Done = Boolean(neighborhoodUnits && neighborhoodUnits.length > 0);

  // Langkah 3: Aparatur Penandatangan TTE (Nama & NIP untuk Lurah, atau Nama Kades)
  const isStep3Done = Boolean(
    profile.kades_name &&
    profile.kades_name.trim().length > 2 &&
    (!isKelurahan || Boolean(profile.kades_nip && profile.kades_nip.trim().length > 5))
  );

  // Langkah 4: Sosialisasi & Bagikan QR APK
  const isStep4Done = isApkShared;

  // Langkah 5: Verifikasi Warga Pertama (Warga mulai mendaftar dari APK)
  const isStep5Done = Boolean(citizens && citizens.length > 0);

  // Hitung jumlah langkah selesai & persentase progres
  const completedCount = [
    isStep1Done, 
    isStep2Done, 
    isStep3Done, 
    isStep4Done, 
    isStep5Done
  ].filter(Boolean).length;

  const totalSteps = 5;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const isAllComplete = completedCount === totalSteps;

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(collapsedStorageKey, String(next));
    } catch {}
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(dismissedStorageKey, 'true');
    } catch {}
  };

  const handleOpenDownloadApk = () => {
    setIsDownloadModalOpen(true);
    setIsApkShared(true);
    try {
      localStorage.setItem(apkSharedStorageKey, 'true');
    } catch {}
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/30 to-white rounded-3xl border-2 border-indigo-200/90 shadow-xl shadow-indigo-500/10 overflow-hidden transition-all duration-300 animate-fade-in relative ring-4 ring-indigo-50/60">
        {/* Vibrant decorative background glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-gradient-to-br from-indigo-200/40 via-sky-200/30 to-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header & Summary Bar */}
        <div className="p-5 sm:p-6 pb-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>PANDUAN AKTIVASI SISTEM</span>
                </span>
                <span className="text-xs font-bold text-indigo-900/80 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  {profile.name}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                <span>Siapkan Pelayanan Digital dalam 5 Langkah Praktis</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                Selesaikan 5 langkah ini agar permohonan surat digital, validasi RT/RW, dan pendaftaran mandiri warga dari aplikasi mobile HP berjalan sempurna.
              </p>
            </div>

            {/* Progress Badge & Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <div className="text-right hidden sm:block bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-indigo-100 shadow-xs">
                <div className="text-xs font-black text-slate-900">
                  {completedCount} dari {totalSteps} Selesai
                </div>
                <div className="text-[11px] font-extrabold text-indigo-600">
                  {progressPercent}% Siap Operasional
                </div>
              </div>

              {/* Toggle Collapse Button */}
              <button
                type="button"
                onClick={toggleCollapse}
                title={isCollapsed ? 'Buka rincian panduan' : 'Ciutkan panduan'}
                className="w-9 h-9 rounded-xl border border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Close/Dismiss Button (Bisa ditutup jika sudah 100% atau atas kehendak pengguna) */}
              {isAllComplete && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="Sembunyikan panduan (karena sudah selesai)"
                  className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-4 pt-1">
            <div className="w-full h-3 bg-indigo-100/70 rounded-full overflow-hidden p-0.5 border border-indigo-200/80 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-1.5 sm:hidden">
              <span>{completedCount} dari {totalSteps} Langkah Selesai</span>
              <span className="font-extrabold text-indigo-700">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Content Section (Expandable / Collapsible) */}
        {!isCollapsed && (
          <div className="px-5 sm:px-6 pb-6 pt-2 relative z-10">
            {/* If 100% Completed Celebration Banner */}
            {isAllComplete ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/20 animate-scale-up">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <PartyPopper className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base">Luar Biasa! Sistem Siap 100%</h4>
                    <p className="text-xs text-indigo-100 mt-0.5 leading-relaxed">
                      Seluruh langkah kesiapan sistem telah lengkap. Warga kini dapat mengakses layanan digital {profile.name} dengan prima.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-extrabold text-xs shadow-md hover:bg-indigo-50 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  Tutup Panduan Ini
                </button>
              </div>
            ) : (
              /* Steps Grid: Semua 5 langkah seragam (1 kolom masing-masing) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
                {/* ---------------------------------------------------- */}
                {/* LANGKAH 1: KOP SURAT & IDENTITAS                    */}
                {/* ---------------------------------------------------- */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col h-full ${
                  isStep1Done 
                    ? 'bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white border-2 border-indigo-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10'
                }`}>
                  {/* Bilah 1 (Atas): Ikon & Status Langkah */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStep1Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    {isStep1Done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Langkah 1</span>
                      </span>
                    )}
                  </div>

                  {/* Bilah 2 (Tengah): Judul & Deskripsi Penjelasan */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      1. KOP Surat &amp; Identitas
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Unggah logo daerah, logo {isKelurahan ? 'kelurahan' : 'desa'}, dan alamat kantor agar KOP dinas tercetak sempurna.
                    </p>
                  </div>

                  {/* Bilah 3 (Bawah): Tombol Aksi Seragam Penuh */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isStep1Done 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:translate-y-[-1px]'
                      }`}
                    >
                      <span>{isStep1Done ? 'Ubah Pengaturan' : 'Atur KOP Sekarang'}</span>
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* LANGKAH 2: STRUKTUR WILAYAH RT/RW                   */}
                {/* ---------------------------------------------------- */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col h-full ${
                  isStep2Done 
                    ? 'bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white border-2 border-indigo-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10'
                }`}>
                  {/* Bilah 1 (Atas): Ikon & Status Langkah */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStep2Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    }`}>
                      <Network className="w-4 h-4" />
                    </div>
                    {isStep2Done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Langkah 2</span>
                      </span>
                    )}
                  </div>

                  {/* Bilah 2 (Tengah): Judul & Deskripsi Penjelasan */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      2. Struktur Wilayah RT/RW
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Daftarkan nomor RT, RW, dan Dusun/Lingkungan agar warga dapat memilih domisili saat mendaftar di APK.
                    </p>
                  </div>

                  {/* Bilah 3 (Bawah): Tombol Aksi Seragam Penuh */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRtModalOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isStep2Done 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:translate-y-[-1px]'
                      }`}
                    >
                      <span>{isStep2Done ? 'Kelola RT/RW' : 'Buat RT/RW Baru'}</span>
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* LANGKAH 3: APARATUR PENANDATANGAN TTE                */}
                {/* ---------------------------------------------------- */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col h-full ${
                  isStep3Done 
                    ? 'bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white border-2 border-indigo-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10'
                }`}>
                  {/* Bilah 1 (Atas): Ikon & Status Langkah */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStep3Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    }`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    {isStep3Done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Langkah 3</span>
                      </span>
                    )}
                  </div>

                  {/* Bilah 2 (Tengah): Judul & Deskripsi Penjelasan */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      3. Pejabat Penandatangan TTE
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Pastikan NIP &amp; nama {isKelurahan ? 'Lurah' : 'Kepala Desa'} terdaftar untuk barcode TTE otomatis surat digital.
                    </p>
                  </div>

                  {/* Bilah 3 (Bawah): Tombol Aksi Seragam Penuh */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsOfficialsModalOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isStep3Done 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:translate-y-[-1px]'
                      }`}
                    >
                      <span>{isStep3Done ? 'Periksa Pamong' : 'Cek Pejabat TTE'}</span>
                    
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* LANGKAH 4: SOSIALISASI & BAGIKAN QR APK              */}
                {/* ---------------------------------------------------- */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col h-full ${
                  isStep4Done 
                    ? 'bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white border-2 border-indigo-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10'
                }`}>
                  {/* Bilah 1 (Atas): Ikon & Status Langkah */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStep4Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    }`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    {isStep4Done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Langkah 4</span>
                      </span>
                    )}
                  </div>

                  {/* Bilah 2 (Tengah): Judul & Deskripsi Penjelasan */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      4. Bagikan QR Code APK
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Unduh poster QR atau salin tautan APK untuk disebarkan ke grup WhatsApp warga agar mendaftar mandiri.
                    </p>
                  </div>

                  {/* Bilah 3 (Bawah): Tombol Aksi Seragam Penuh */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleOpenDownloadApk}
                      className={`w-full py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isStep4Done
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:translate-y-[-1px]'
                      }`}
                    >
                      <span>{isStep4Done ? 'Buka Poster QR' : 'Unduh Poster & QR'}</span>
                      
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* LANGKAH 5: VERIFIKASI WARGA PERDANA DARI APK        */}
                {/* ---------------------------------------------------- */}
                <div className={`p-4 rounded-2xl border transition-all flex flex-col h-full ${
                  isStep5Done 
                    ? 'bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white border-2 border-indigo-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10'
                }`}>
                  {/* Bilah 1 (Atas): Ikon & Status Langkah */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStep5Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    {isStep5Done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Langkah 5</span>
                      </span>
                    )}
                  </div>

                  {/* Bilah 2 (Tengah): Judul & Deskripsi Penjelasan + Status Pill */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      5. Verifikasi Warga Perdana
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Data pendaftaran KTP &amp; KK warga dari APK akan masuk ke antrean verifikasi untuk disetujui.
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200/80 rounded-lg px-2 py-1 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        citizens.filter(c => !c.is_verified).length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`} />
                      <span className="truncate">
                        {citizens.length > 0 
                          ? `${citizens.filter(c => !c.is_verified).length} antrean verifikasi` 
                          : 'Belum ada pendaftaran APK'}
                      </span>
                    </div>
                  </div>

                  {/* Bilah 3 (Bawah): Tombol Aksi Seragam Penuh */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('citizens')}
                      className={`w-full py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isStep5Done
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:translate-y-[-1px]'
                      }`}
                    >
                      <span>Buka Antrean Warga</span>
                      
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Render modals controlled directly by the onboarding guide */}
      <VillageProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <NeighborhoodUnitsManageModal
        isOpen={isRtModalOpen}
        onClose={() => setIsRtModalOpen(false)}
      />

      <VillageOfficialsManageModal
        isOpen={isOfficialsModalOpen}
        onClose={() => setIsOfficialsModalOpen(false)}
      />

      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </>
  );
};
