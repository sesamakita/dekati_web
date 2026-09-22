// src/views/LandingPageView.tsx
import React, { useState } from 'react';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  FileText, 
  MessageSquareWarning, 
  Users, 
  Radio, 
  PieChart, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Sparkles, 
  QrCode, 
  Check, 
  HelpCircle, 
  Lock, 
  BarChart3, 
  Award, 
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useData } from '../hooks/useData';
import { LetterRequest } from '../types';
import { LetterStatusBadge } from '../components/StatusBadge';
import { QrVerifyModal } from '../components/QrVerifyModal';
import { MobileDownloadModal } from '../components/MobileDownloadModal';

interface LandingPageViewProps {
  onEnterAdmin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterAdmin }) => {
  const { letters, announcements, apbdes, profile } = useData();
  
  // State for Letter Tracking Widget
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedLetter, setTrackedLetter] = useState<LetterRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedQrLetter, setSelectedQrLetter] = useState<LetterRequest | null>(null);

  // State for Mobile Download Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // State for Platform Comparison Tabs
  const [activeTab, setActiveTab] = useState<'kades' | 'warga'>('kades');

  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Pencarian Surat Mandiri Warga (Cek memori lokal lalu fallback langsung ke Supabase Cloud)
  const searchLetter = async (queryStr: string) => {
    const q = queryStr.trim();
    if (!q) return;

    setHasSearched(true);
    const found = letters.find(
      (l) =>
        l.tracking_number.toLowerCase() === q.toLowerCase() ||
        (l.letter_official_number &&
          l.letter_official_number.toLowerCase().includes(q.toLowerCase()))
    );

    if (found) {
      setTrackedLetter(found);
      return;
    }

    // Direct Supabase lookup jika belum ada di memori lokal
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
      let query = supabase.from('letter_requests').select('*');
      if (isUuid) {
        query = query.or(`id.eq.${q},tracking_number.eq.${q}`);
      } else {
        query = query.eq('tracking_number', q);
      }
      const { data } = await query.maybeSingle();
      if (data) {
        setTrackedLetter(data as LetterRequest);
      } else {
        setTrackedLetter(null);
      }
    } catch {
      setTrackedLetter(null);
    }
  };

  const handleTrackLetter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    searchLetter(trackingQuery);
  };

  const handleQuickTrack = (num: string) => {
    setTrackingQuery(num);
    searchLetter(num);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION BAR                                             */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Dekati</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Desa & Kelurahan Terpadu
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile.name} • {profile.district}, {profile.regency}
              </p>
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
            <a
              href="#lacak-surat"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/70 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Lacak Surat</span>
            </a>

            {/* Buka Mobile App Modal */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>App Warga</span>
            </button>

            {/* MASUK DASHBOARD ADMIN DESA / LURAH */}
            <button
              onClick={onEnterAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Portal Admin</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                          */}
      {/* ========================================================================= */}
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
                onClick={() => setIsDownloadModalOpen(true)}
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

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE WIDGET: LACAK PERMOHONAN E-SURAT MANDIRI                   */}
      {/* ========================================================================= */}
      <section id="lacak-surat" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              Layanan Pelacakan Mandiri Warga
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lacak Status Surat Anda Tanpa Perlu Login
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Ketikkan nomor resi/tracking pelacakan surat Anda (didapatkan saat mengajukan permohonan melalui aplikasi mobile warga).
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleTrackLetter} className="relative mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  placeholder="Contoh: SRT-202609-0012 atau SRT-202609-5522..."
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                Lacak Status Sekarang
              </button>
            </div>
          </form>

          {/* Quick Demo Resi Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Coba Resi Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickTrack('SRT-202609-0012')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
            >
              SRT-202609-0012 (SKTM - Sudah TTE QR)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTrack('SRT-202609-5522')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
            >
              SRT-202609-5522 (SKU - Menunggu Verifikasi)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTrack('SRT-202609-0005')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
            >
              SRT-202609-0005 (Pemeriksaan Berkas)
            </button>
          </div>

          {/* Tracking Result Card */}
          {hasSearched && (
            <div className="animate-fade-in">
              {trackedLetter ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-md space-y-6">
                  {/* Top Bar of Result */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. Pelacakan</span>
                        <span className="text-sm font-extrabold text-slate-900 font-mono">{trackedLetter.tracking_number}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{trackedLetter.letter_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Pemohon: <strong>{trackedLetter.citizen_name}</strong> (NIK: {trackedLetter.citizen_nik})
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <LetterStatusBadge status={trackedLetter.status} />
                      {trackedLetter.letter_official_number && (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Reg: {trackedLetter.letter_official_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Keperluan */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/70">
                    <span className="text-xs font-bold text-slate-500 block mb-1">Keperluan Permohonan:</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{trackedLetter.purpose}</p>
                  </div>

                  {/* Timeline Alur Pengerjaan */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Alur Pengerjaan Berkas:
                    </span>
                    <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-3">
                      {trackedLetter.timeline?.map((step, idx) => (
                        <div key={idx} className="relative pl-6">
                          <div
                            className={`absolute -left-[17px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              step.done
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div className="text-xs font-bold text-slate-800">{step.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{step.time}</span>
                            {step.actor && <span>• Ditangani oleh: <strong>{step.actor}</strong></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification CTA if Signed */}
                  {(trackedLetter.status === 'signed' || trackedLetter.qr_verification_token) && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950">Surat Sah Bertanda Tangan Elektronik (TTE QR)</div>
                          <div className="text-[11px] text-emerald-700">Disahkan secara sah oleh {trackedLetter.signed_by_name || 'Kepala Desa Sukamaju'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedQrLetter(trackedLetter)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap"
                      >
                        Lihat Sertifikat TTE QR
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500 mb-2">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Nomor Pelacakan Tidak Ditemukan</h4>
                  <p className="text-xs max-w-md mx-auto leading-relaxed">
                    Pastikan nomor resi surat yang Anda masukkan benar (contoh: <code>SRT-202609-0012</code>).
                    Jika baru mengajukan dari aplikasi mobile, mohon tunggu beberapa saat untuk sinkronisasi cloud.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SHOWCASE DUA PLATFORM: WEB ADMIN VS MOBILE APP WARGA                   */}
      {/* ========================================================================= */}
      <section id="dua-platform" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Ekosistem Terintegrasi 1:1
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dua Platform Saling Melengkapi dalam Satu Basis Data
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Aparatur desa menggunakan Web Admin untuk manajemen birokrasi & pengesahan,
            sedangkan warga menikmati kemudahan pelayanan langsung dari ponsel genggam.
          </p>

          {/* Tab Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('kades')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'kades'
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Web Admin (Kades & Pamong)</span>
              </button>

              <button
                onClick={() => setActiveTab('warga')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'warga'
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Aplikasi Mobile (Seluruh Warga)</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: WEB ADMIN (KADES & PAMONG) */}
        {activeTab === 'kades' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Pengesahan E-Surat & TTE QR Kades</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemeriksaan berkas pemohon, penetapan Nomor Surat Resmi Desa sesuai registrasi Kemendagri,
                dan pengesahan Tanda Tangan Elektronik QR Code instan tanpa tanda tangan basah.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Pratinjau berkas KTP, KK, & Surat Pengantar
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Cetak Kop Surat Resmi Pemerintah Kabupaten
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  QR Code keabsahan berkas terenkripsi
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Helpdesk Aduan Warga Cepat Tanggap</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Menampung laporan jalan rusak, PJU padam, dan tumpukan sampah liar.
                Admin mendisposisikan tugas ke Satlinmas atau Kaur Pembangunan, lalu mengunggah foto bukti penyelesaian.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Foto kondisi lapangan & koordinat GPS warga
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Disposisi per aparat desa terkait
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Unggah bukti perbaikan selesai
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-teal-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Siaran Informasi & Broadcast Darurat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Publikasikan jadwal bansos, posyandu, kerja bakti, atau pengumuman darurat bencana
                yang langsung memicu notifikasi peringatan di layar kunci smartphone warga.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" />
                  Segmentasi sasaran per Dusun / RW / Seluruh Warga
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" />
                  Tandai "Prioritas Darurat" untuk notifikasi mendesak
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" />
                  Mockup pratinjau ponsel cerdas secara real-time
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: MOBILE APP (SELURUH WARGA) */}
        {activeTab === 'warga' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Urus Surat dari Rumah (Bebas Antre)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Warga cukup membuka aplikasi, memilih jenis surat (SKTM, SKU, Domisili, SKCK),
                mengisi keperluan, dan memilih anggota keluarga yang diajukan tanpa fotokopi berulang.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Otomatis terhubung dengan Kartu Keluarga digital
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Lacak status surat detik per detik
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Simpan file surat resmi PDF siap cetak
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Lapor Fasilitas Rusak (Foto + GPS)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Temukan jalan berlubang atau lampu padam? Foto langsung dari kamera ponsel,
                GPS akan menandai koordinat lokasi secara otomatis, lalu kirim ke tim reaksi cepat desa.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Pilihan mode laporan Anonim (identitas terlindungi)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Lihat foto bukti pengerjaan saat aduan selesai
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-600" />
                  Dukungan nomor tiket pelacakan unik
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Buku Keluarga & Kontak Darurat 24 Jam</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akses profil kependudukan mandiri, jadwal pembagian BLT Dana Desa,
                dan tombol panggilan cepat ke Ambulans Desa, Babinsa, serta Bhabinkamtibmas.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  Panggilan darurat ambulans & pamong 1-klik
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  Banner merah peringatan siaga bencana
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  Jadwal Posyandu & Imunisasi Balita rutin
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Dual CTA inside Platform section */}
        <div className="text-center pt-4">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onEnterAdmin}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Akses Portal Admin Desa</span>
            </button>
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Dapatkan Aplikasi Mobile Warga</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRANSPARANSI ANGGARAN APBDES TERBUKA                                  */}
      {/* ========================================================================= */}
      <section id="transparansi" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <PieChart className="w-3.5 h-3.5" />
              Akuntabilitas Publik Terbuka
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Transparansi Anggaran Pendapatan & Belanja Desa (APBDes)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pemerintah Desa Sukamaju membuka data serapan dana desa secara berkala
              sebagai komitmen tata kelola pemerintahan yang bersih dan bebas korupsi.
            </p>
          </div>

          {/* APBDes Bento Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Realisasi Card */}
            <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Realisasi Anggaran</span>
                <span className="text-emerald-400 font-extrabold text-base">{apbdes.realisasi_persen}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${apbdes.realisasi_persen}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tahun Anggaran 2026 berjalan secara transparan dan akuntabel berdasarkan Keputusan BPD & Musrenbangdes.
              </p>
            </div>

            {/* Pendapatan Card */}
            <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Total Pendapatan Desa
              </span>
              <div className="text-2xl font-black text-white">
                Rp {apbdes.pendapatan.total_budget.toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span>Terealisasi:</span>
                <span className="font-bold text-emerald-300">
                  Rp {apbdes.pendapatan.total_realized.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Belanja Card */}
            <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Total Belanja Desa
              </span>
              <div className="text-2xl font-black text-white">
                Rp {apbdes.belanja.total_budget.toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span>Terealisasi:</span>
                <span className="font-bold text-teal-300">
                  Rp {apbdes.belanja.total_realized.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Inline breakdown items */}
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Dana Desa (DDS) APBN:</div>
              <div className="font-bold text-white">Rp 1.200.000.000</div>
              <div className="text-emerald-400 text-[11px]">81.6% Terserap</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Alokasi Dana Desa (ADD) APBD:</div>
              <div className="font-bold text-white">Rp 650.000.000</div>
              <div className="text-emerald-400 text-[11px]">78.4% Terserap</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Pembangunan Infrastruktur:</div>
              <div className="font-bold text-white">Rp 950.000.000</div>
              <div className="text-teal-400 text-[11px]">77.8% Fisik Selesai</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Penyelenggaraan Siltap:</div>
              <div className="font-bold text-white">Rp 550.000.000</div>
              <div className="text-teal-400 text-[11px]">78.1% Terserap</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SIARAN & PENGUMUMAN DESA TERKINI (DARI SUPABASE)                       */}
      {/* ========================================================================= */}
      <section id="pengumuman" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <Radio className="w-3.5 h-3.5 text-teal-600" />
              Kanal Berita & Pengumuman
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Siaran Resmi Balai Desa Terkini
            </h2>
          </div>
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Dapatkan notifikasi di aplikasi mobile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.slice(0, 3).map((announcement) => (
            <div
              key={announcement.id}
              className={`p-6 rounded-3xl bg-white border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                announcement.is_urgent ? 'border-rose-200 ring-1 ring-rose-200/60' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      announcement.category === 'Bansos'
                        ? 'bg-amber-100 text-amber-800'
                        : announcement.category === 'Kesehatan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : announcement.category === 'Darurat'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {announcement.category}
                  </span>
                  {announcement.is_urgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                      Penting
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {announcement.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {announcement.summary || announcement.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                <span>{announcement.date}</span>
                <span>Oleh: {announcement.author?.split(' ')[0] || 'Sekretariat'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ / TANYA JAWAB UMUM                                                */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              Pertanyaan yang Sering Diajukan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tanya Jawab untuk Pamong & Warga
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Informasi hukum, teknis, dan regulasi pemanfaatan platform Dekati.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Bagaimana kekuatan hukum Tanda Tangan Elektronik (TTE QR Code) Kepala Desa / Lurah?',
                a: 'Tanda Tangan Elektronik (TTE) pada platform Dekati mengacu pada UU No. 11/2008 jo UU No. 1/2024 tentang ITE serta regulasi Kementerian Dalam Negeri dan BSSN. Dokumen PDF yang diterbitkan memuat kode hash unik dan QR Code validator publik yang dapat diverifikasi keasliannya oleh instansi perbankan, kepolisian, dinas pendidikan, atau rumah sakit.'
              },
              {
                q: 'Apakah warga dikenakan biaya saat menggunakan aplikasi mobile atau mengurus surat?',
                a: 'Tidak ada biaya sepeser pun. Seluruh layanan E-Surat, pengaduan fasilitas, dan pengumuman balai desa dapat diakses secara gratis oleh warga yang terdata secara sah pada Buku Induk Kependudukan Desa Sukamaju.'
              },
              {
                q: 'Bagaimana keamanan data NIK dan dokumen Kartu Keluarga warga?',
                a: 'Platform Dekati mematuhi standar UU No. 27/2022 tentang Perlindungan Data Pribadi (UU PDP). Database disimpan pada cloud terenkripsi, berkas hanya dapat diakses oleh operator berwenang dan warga bersangkutan melalui verifikasi NIK sah.'
              },
              {
                q: 'Apakah platform ini dapat diadopsi oleh Desa atau Kelurahan lain di Indonesia?',
                a: 'Sangat bisa. Arsitektur Dekati dirancang modular dan multi-tenant. Pengaturan profil desa, nama kepala desa, batas wilayah RT/RW/Dusun, jenis surat master, serta skema database cloud dapat disesuaikan untuk kebutuhan setiap desa maupun kelurahan.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER RESMI                                                          */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 py-14 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold text-slate-900">Dekati</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Desa Kita Dekat di Hati
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Platform Tata Kelola Pemerintahan Desa & Kelurahan Digital Terpadu.
                Mendekatkan pelayanan birokrasi, mempercepat penerbitan surat ber-TTE QR, dan menjaga akuntabilitas publik.
              </p>
              <div className="text-[11px] text-slate-400">
                {profile.office_address} • Telepon: {profile.office_phone} • Email: {profile.office_email}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Akses Portal</h5>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={onEnterAdmin} className="hover:text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Masuk Dashboard Admin Desa
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDownloadModalOpen(true)} className="hover:text-emerald-600 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Unduh Aplikasi Mobile Warga
                  </button>
                </li>
                <li>
                  <a href="#lacak-surat" className="hover:text-emerald-600">Lacak Status Surat Mandiri</a>
                </li>
                <li>
                  <a href="#transparansi" className="hover:text-emerald-600">Transparansi APBDes 2026</a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Kepatuhan Standar</h5>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>• Standar E-Government Kemendagri RI</li>
                <li>• Keabsahan TTE Sesuai Regulasi BSSN</li>
                <li>• Perlindungan Data Pribadi (UU PDP)</li>
                <li>• Sistem Terbuka PostgreSQL Supabase</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 Pemerintahan {profile.name}, {profile.district}, {profile.regency}. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Platform Dekati v1.0.0 (Web Admin & Mobile App)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. MODALS                                                                */}
      {/* ========================================================================= */}
      {selectedQrLetter && (
        <QrVerifyModal
          letter={selectedQrLetter}
          onClose={() => setSelectedQrLetter(null)}
        />
      )}

      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};
