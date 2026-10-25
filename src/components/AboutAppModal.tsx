import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Info, 
  ShieldCheck, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  Award, 
  Lock, 
  ExternalLink,
  Sparkles,
  Layers,
  Calendar,
  Check,
  Smartphone,
  Server,
  FileCheck2,
  Clock,
  ArrowRight,
  MessageSquare,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useData } from '../hooks/useData';

const REFERRAL_STORAGE_KEY = 'dekati_referral_code_v1';

export interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({ isOpen, onClose }) => {
  const { profile, citizens, letters, complaints, villageEvents } = useData();
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'paket' | 'keamanan'>('paket');
  const [simulatedPlan, setSimulatedPlan] = useState<'tahunan' | 'bulanan' | 'trial'>('tahunan');

  // Kalkulasi penggunaan penyimpanan riil berbasis data desa
  const citizenStorageMb = citizens.length * 0.65; // ~650 KB per arsip KTP/KK
  const letterStorageMb = letters.length * 0.45; // ~450 KB per arsip surat & lampiran
  const complaintStorageMb = complaints.length * 0.8; // ~800 KB per foto bukti aduan
  const eventStorageMb = villageEvents.length * 0.6;
  const baseDbMb = 48.5; // Struktur basis data PostgreSQL, indeks, dan audit log
  const totalUsedMb = baseDbMb + citizenStorageMb + letterStorageMb + complaintStorageMb + eventStorageMb;
  const totalUsedGb = totalUsedMb / 1024;
  const quotaGb = 10; // Kuota bawaan paket
  const usedPercentage = Math.max(1, Math.min(Math.round((totalUsedGb / quotaGb) * 100), 100));
  const remainingFilesEstimate = Math.max(0, Math.floor(((quotaGb * 1024) - totalUsedMb) / 0.45));

  // Affiliation / Referral State
  const [referralCode, setReferralCode] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.split('?')[1] || '';
      const hashParams = new URLSearchParams(hashQuery);
      const detectedRef = urlParams.get('ref') || hashParams.get('ref');
      if (detectedRef) {
        const clean = detectedRef.trim().toUpperCase();
        localStorage.setItem(REFERRAL_STORAGE_KEY, clean);
        return clean;
      }
      return localStorage.getItem(REFERRAL_STORAGE_KEY) || profile?.referral_code || '';
    } catch {
      return profile?.referral_code || '';
    }
  });

  const [inputRefCode, setInputRefCode] = useState('');
  const [showRefInput, setShowRefInput] = useState(false);

  // Sync if URL changes while mounted or profile loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashQuery);
    const detectedRef = urlParams.get('ref') || hashParams.get('ref');
    if (detectedRef) {
      const clean = detectedRef.trim().toUpperCase();
      localStorage.setItem(REFERRAL_STORAGE_KEY, clean);
      setReferralCode(clean);
    } else if (profile?.referral_code && !referralCode) {
      setReferralCode(profile.referral_code);
    }
  }, [isOpen, profile?.referral_code]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const isAffiliateMode = Boolean(referralCode.trim());

  const handleOpenWhatsAppSales = (planName: string, priceDisplay: string) => {
    const phoneNumber = '6281234567800'; // Hotline Kemitraan & Sales DN Apps
    const affiliateText = isAffiliateMode
      ? `\n• *Kode Referensi Mitra / Pendamping Daerah*: ${referralCode}`
      : '';

    const textMessage = 
`🏛️ *PERMOHONAN PENAWARAN & AKTIVASI DEKATI*
Halo Tim Sales & Kemitraan DN Apps (PT Berdikari Bangun Bangsa),

Kami dari instansi:
• Nama Pemerintah: *${profile.name}*
• Kecamatan: ${profile.district || '-'}
• Kabupaten/Kota: ${profile.regency || '-'}${affiliateText}

Bermaksud mengajukan aktivasi / perpanjangan / proposal pengadaan:
• *Paket Dipilih*: ${planName} (${priceDisplay})

Mohon informasi tata cara penawaran resmi, kelengkapan berkas faktur/kwitansi SPJ APBDes, serta koordinasi dengan perwakilan mitra daerah kami. Terima kasih.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  const handleOpenWhatsAppAddon = (addonName: string, price: string) => {
    const phoneNumber = '6281234567800'; // Hotline Kemitraan & Sales DN Apps
    const affiliateText = isAffiliateMode
      ? `\n• *Kode Referensi Mitra*: ${referralCode}`
      : '';

    const textMessage = 
`🏛️ *PERMINTAAN ADD-ON STORAGE CLOUD DEKATI*
Halo Tim Sales & Kemitraan DN Apps (PT Berdikari Bangun Bangsa),

Kami dari instansi:
• Nama Pemerintah: *${profile.name}*
• Kecamatan: ${profile.district || '-'}
• Kabupaten/Kota: ${profile.regency || '-'}${affiliateText}

Bermaksud mengajukan penambahan kuota penyimpanan cloud:
• *Add-on Dipilih*: ${addonName} (${price})

Mohon bantuan aktivasi kapasitas penyimpanan tambahan dan prosedur faktur/kwitansi resminya. Terima kasih.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  const handleApplyReferral = () => {
    const clean = inputRefCode.trim().toUpperCase();
    if (clean) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, clean);
      setReferralCode(clean);
      setInputRefCode('');
      setShowRefInput(false);
    }
  };

  const handleClearReferral = () => {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    setReferralCode('');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[90vh] my-auto flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Section */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white shrink-0 overflow-hidden">
          {/* Background Decorative Rings */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-teal-400/10 pointer-events-none blur-xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white p-2 shadow-lg shadow-emerald-950/30 flex items-center justify-center shrink-0 border border-white/20">
                <img 
                  src="/logo_dekati.png" 
                  alt="DEKATI Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-emerald-700 font-black text-xl tracking-tighter">DK</span>';
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white">DEKATI</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {simulatedPlan === 'trial' ? 'Trial Edition' : 'Enterprise Edition'}
                  </span>
                  {isAffiliateMode && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      Mitra Daerah
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                  Desa Komunikasi Administrasi Terintegrasi • DN Apps
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                  <span>Versi Build 2.4.0-lts</span>
                  <span>•</span>
                  <span>Rilis 2026</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab('paket')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paket'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Paket Berlangganan (3 Opsi)
            </button>
            <button
              onClick={() => setActiveTab('ringkasan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ringkasan'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Profil & Pengembang
            </button>
            <button
              onClick={() => setActiveTab('keamanan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'keamanan'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Keamanan & Legalitas
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* TAB 1: PAKET BERLANGGANAN */}
          {activeTab === 'paket' && (
            <div className="space-y-5 animate-fade-in">
              {/* Affiliate / Referral Alert Bar */}
              {isAffiliateMode ? (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-purple-950 flex items-center gap-2">
                        <span>Didampingi Mitra Resmi:</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-200/90 text-purple-900 font-mono text-[11px] font-black border border-purple-300">
                          {referralCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Mode Penawaran Kemitraan Aktif. Nominal publik disesuaikan dengan proposal pengadaan daerah, bundling perangkat/tablet, dan bimtek tatap muka.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearReferral}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-purple-700 hover:text-purple-950 hover:bg-purple-100 border border-purple-300 w-fit shrink-0 cursor-pointer transition-colors"
                    title="Lepas kode mitra untuk melihat tarif standar publik"
                  >
                    Lepas Kode Mitra
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  {!showRefInput ? (
                    <button
                      onClick={() => setShowRefInput(true)}
                      className="text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-200"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Punya Kode Referensi Mitra / Pendamping Daerah?</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto animate-fade-in">
                      <span className="text-[10px] font-bold text-slate-500 pl-1">Kode:</span>
                      <input
                        type="text"
                        placeholder="Contoh: MITRA-JABAR"
                        value={inputRefCode}
                        onChange={(e) => setInputRefCode(e.target.value.toUpperCase())}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
                      />
                      <button
                        onClick={handleApplyReferral}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Terapkan
                      </button>
                      <button
                        onClick={() => setShowRefInput(false)}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Plan Status Banner & Switcher */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status Lisensi Desa Saat Ini:
                    </span>
                    {simulatedPlan === 'tahunan' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                        PAKET TAHUNAN AKTIF
                      </span>
                    )}
                    {simulatedPlan === 'bulanan' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-600 text-white shadow-xs">
                        PAKET BULANAN AKTIF
                      </span>
                    )}
                    {simulatedPlan === 'trial' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs animate-pulse">
                        UJI COBA 14 HARI (HARI KE-4)
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    {profile.name} — {simulatedPlan === 'trial' ? 'Akses Penuh Uji Coba Gratis' : 'Desa Digital Mandiri Terverifikasi'}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {simulatedPlan === 'trial'
                      ? 'Seluruh modul aktif 100%. Setelah hari ke-14, sistem beralih ke mode hanya-baca (read-only) sampai paket diaktifkan.'
                      : 'Lisensi resmi berbayar aktif hingga 31 Desember 2026. Kuota pelayanan surat, TTE, dan WhatsApp tanpa batas.'}
                  </p>
                </div>

                {/* Simulation Switcher */}
                <div className="shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">Simulasikan Tampilan Paket:</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSimulatedPlan('tahunan')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        simulatedPlan === 'tahunan'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tahunan
                    </button>
                    <button
                      onClick={() => setSimulatedPlan('bulanan')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        simulatedPlan === 'bulanan'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Bulanan
                    </button>
                    <button
                      onClick={() => setSimulatedPlan('trial')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        simulatedPlan === 'trial'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Gratis 14 Hari
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Subscription Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {/* 1. Paket Gratis (Trial 14 Hari) */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  simulatedPlan === 'trial'
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Uji Coba Lengkap
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                        14 HARI
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">Paket Gratis</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">Rp 0</span>
                      <span className="text-xs text-slate-500 font-medium">/ 14 Hari</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      Eksplorasi penuh seluruh fitur unggulan DEKATI tanpa komitmen biaya awal.
                    </p>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-semibold">100% Fitur Aktif Penuh</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Surat & TTE QR Code Resmi</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Notifikasi WhatsApp WAHA</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Monografi & Transparansi APBDes</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="italic">Setelah 14 hari: mode hanya-baca (read-only)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSimulatedPlan('trial')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        simulatedPlan === 'trial'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {simulatedPlan === 'trial' ? 'Sedang Digunakan' : 'Simulasikan Trial'}
                    </button>
                  </div>
                </div>

                {/* 2. Paket Bulanan */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  simulatedPlan === 'bulanan'
                    ? 'bg-sky-50/40 border-sky-300 ring-2 ring-sky-400/30 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                        {isAffiliateMode ? 'Penawaran Mitra' : 'Fleksibel Bulanan'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800">
                        REGULER
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">Paket Bulanan</h3>
                    
                    {/* Dynamic Pricing / Nominal Mode */}
                    {isAffiliateMode ? (
                      <div className="mt-2 mb-2">
                        <div className="text-lg font-black text-purple-950 leading-tight">
                          Penawaran Khusus
                        </div>
                        <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
                          Disesuaikan Anggaran Desa
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 mb-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">Rp 300.000</span>
                        <span className="text-xs text-slate-500 font-medium">/ bulan</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      {isAffiliateMode
                        ? `Paket langganan operasional melalui rekomendasi mitra resmi ${referralCode}.`
                        : 'Sesuai untuk operasional rutin bulanan tanpa komitmen jangka panjang.'}
                    </p>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-800 font-semibold">Seluruh Modul Aktif Tanpa Batas</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Penerbitan Surat & TTE Unlimited</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Gateway WhatsApp WAHA Aktif</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Database Cloud Realtime PostgreSQL</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Bantuan Teknis Tim DN Apps & Mitra</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenWhatsAppSales(
                        'Paket Bulanan', 
                        isAffiliateMode ? 'Penawaran Khusus Mitra' : 'Rp 300.000/bln'
                      )}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAffiliateMode ? 'Konsultasi Penawaran Resmi' : 'Aktivasi via WhatsApp'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Paket Tahunan (REKOMENDASI & PALING HEMAT) */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all relative overflow-hidden ${
                  simulatedPlan === 'tahunan'
                    ? 'bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-emerald-400 shadow-sm'
                }`}>
                  {/* Popular Badge */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{isAffiliateMode ? 'Kerjasama Daerah' : 'Hemat 2 Bulan'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        {isAffiliateMode ? 'Bundling BIMTEK & Pendampingan' : 'Paling Hemat & Populer'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">Paket Tahunan</h3>

                    {/* Dynamic Pricing / Nominal Mode */}
                    {isAffiliateMode ? (
                      <div className="mt-2 mb-2">
                        <div className="text-lg font-black text-emerald-950 leading-tight">
                          Paket Kerjasama Daerah
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                          Termasuk Pendampingan & Bimtek SPJ
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="mt-2 mb-0.5 flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-emerald-700">Rp 3.000.000</span>
                          <span className="text-xs text-slate-500 font-medium">/ tahun</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="line-through text-slate-400 text-xs">Rp 3.600.000</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            Hemat Rp 600.000
                          </span>
                        </div>
                      </>
                    )}

                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      {isAffiliateMode
                        ? `Pengadaan resmi sesuai siklus APBDes/DPA dengan pendampingan langsung oleh perwakilan mitra ${referralCode}.`
                        : 'Solusi definitif penganggaran APBDes/DPA tahunan dengan keuntungan setara 2 bulan gratis.'}
                    </p>

                    <div className="space-y-2 border-t border-emerald-100 pt-3 text-[11px]">
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-bold">Semua Fasilitas Paket Bulanan</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-emerald-800 font-bold">Prioritas Pelayanan & Gateway Tercepat</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Pendampingan & Pelatihan Aparatur / RT</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Opsi Bundling Perangkat Tablet / Komputer</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Faktur Pajak & Kwitansi Resmi SPJ APBDes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-emerald-100">
                    <button
                      onClick={() => handleOpenWhatsAppSales(
                        'Paket Tahunan (Kerjasama Daerah)', 
                        isAffiliateMode ? 'Paket Kerjasama Daerah' : 'Rp 3.000.000/thn'
                      )}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAffiliateMode ? 'Minta Proposal SPJ APBDes' : 'Aktivasi Tahunan via WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cloud Storage Capacity & Policy Box */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Kapasitas Penyimpanan Cloud Terpakai</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {usedPercentage}% Terpakai
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alokasi kuota bawaan paket: <strong>{quotaGb} GB</strong> (Tersedia ruang aman untuk estimasi ±{remainingFilesEstimate.toLocaleString('id-ID')} arsip berkas surat baru).
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-slate-800">
                      {totalUsedGb.toFixed(2)} GB
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> / {quotaGb} GB</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      usedPercentage > 85 ? 'bg-rose-500' : usedPercentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>

                {/* Policy Notice & Add-on Top-Up Options */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      Kebijakan Peningkatan Data & Add-on Kapasitas:
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Biaya langganan pokok desa <strong>TIDAK AKAN dinaikkan secara sepihak</strong> jika data bertambah. Jika kuota 10 GB penuh setelah pemakaian bertahun-tahun, desa cukup memilih paket penambahan kapasitas fleksibel berikut:
                    </p>
                  </div>

                  {/* 2 Add-on Storage Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">+10 GB Ekstra Storage</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-bold text-emerald-700">Rp 50.000</span>/bln atau <span className="font-bold text-emerald-700">Rp 500.000</span>/thn
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Kapasitas ±25.000 arsip berkas baru</div>
                      </div>
                      <button
                        onClick={() => handleOpenWhatsAppAddon('Add-on Storage +10 GB', 'Rp 50.000/bln atau Rp 500.000/thn')}
                        className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold shrink-0 transition-all shadow-2xs cursor-pointer"
                      >
                        Pesan via WA
                      </button>
                    </div>

                    <div className="p-3 bg-emerald-50/40 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>+25 GB Storage Pro</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">Hemat</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-bold text-emerald-700">Rp 100.000</span>/bln atau <span className="font-bold text-emerald-700">Rp 1.000.000</span>/thn
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Kapasitas ±60.000 arsip (Gratis 2 Bulan)</div>
                      </div>
                      <button
                        onClick={() => handleOpenWhatsAppAddon('Add-on Storage Pro +25 GB', 'Rp 100.000/bln atau Rp 1.000.000/thn')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-all shadow-2xs cursor-pointer"
                      >
                        Pesan via WA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal SPJ & Payment Note */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Dukungan Kelengkapan Administrasi: Diterbitkan Faktur / Kwitansi Resmi bermaterai atas nama <strong>PT Berdikari Bangun Bangsa (DN Apps)</strong> untuk pertanggungjawaban SPJ keuangan desa{isAffiliateMode ? ` berkoordinasi dengan perwakilan mitra ${referralCode}` : ''}.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL & PENGEMBANG */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Mengenai Platform DEKATI:</span>
                DEKATI adalah platform ekosistem tata kelola pemerintahan desa dan kelurahan terpadu di Indonesia. Menghubungkan secara real-time pelayanan administrasi e-surat, pengesahan TTE QR Code resmi kepala desa/lurah, rekomendasi kewilayahan RT/RW berbasis WhatsApp otomatis, transparansi monografi kependudukan, dan pengelolaan APBDes/DPA.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Perusahaan Pembuat</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">PT Berdikari Bangun Bangsa</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Badan Usaha Resmi Teknologi & Tata Kelola Publik</div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Nama Bisnis / Brand</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">DN Apps</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Brand Solusi Digital & Pengembangan Sistem Pintar</div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pengembang Sistem</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">Deni Indrayana & Tim</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Riset & Rekayasa Perangkat Lunak Terintegrasi</div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Instalasi Wilayah</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">{profile.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{profile.district} • {profile.regency}</div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Status Lisensi</span>
                  </div>
                  <div className="text-sm font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resmi & Berlisensi Aktif</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Terkonfirmasi untuk instansi {profile.name}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEAMANAN & LEGALITAS */}
          {activeTab === 'keamanan' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">Standar Keamanan & Perlindungan Hukum</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem DEKATI dirancang mematuhi regulasi perundang-undangan Republik Indonesia, menjamin keabsahan dokumen pemerintahan desa secara digital.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Perlindungan Data Pribadi (UU PDP No. 27/2022)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      NIK dan No. KK warga dilindungi fitur proteksi PIN sesi 15 menit, penyembunyian tampilan (*masking*), dan enkripsi transmisi TLS 1.3 / SSL 256-bit.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Keabsahan Tanda Tangan Elektronik (UU ITE No. 1/2024)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Barcode QR Code TTE yang diterbitkan memuat token unik kriptografis yang tertaut langsung ke basis data otentikasi publik desa untuk uji keaslian instan.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Audit Trail & Rekam Jejak Hukum Digital</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Seluruh mutasi status surat, pengesahan TTE, dan pengelolaan akun aparatur dicatat dengan stempel waktu (*timestamp*) yang tidak dapat dimanipulasi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px] font-medium">
            Hak Cipta © 2026 PT Berdikari Bangun Bangsa (DN Apps). Seluruh hak cipta dilindungi undang-undang.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
