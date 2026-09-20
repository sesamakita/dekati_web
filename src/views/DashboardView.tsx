// src/views/DashboardView.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquareWarning, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  Radio, 
  ShieldCheck, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { LetterStatusBadge, ComplaintStatusBadge } from '../components/StatusBadge';
import { LetterDetailModal } from '../components/LetterDetailModal';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { CitizenVerifyModal } from '../components/CitizenVerifyModal';
import { NewAnnouncementModal } from '../components/NewAnnouncementModal';
import { LetterRequest, Complaint, Citizen } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: 'letters' | 'complaints' | 'citizens' | 'announcements' | 'apbdes') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { letters, complaints, citizens, apbdes, profile, activeRole } = useData();

  const [selectedLetter, setSelectedLetter] = useState<LetterRequest | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Metrics
  const pendingLetters = letters.filter(
    (l) => l.status === 'submitted' || l.status === 'in_verification'
  );
  const readyToSignLetters = letters.filter((l) => l.status === 'approved');
  const activeComplaints = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'in_progress'
  );
  const unverifiedCitizens = citizens.filter((c) => !c.is_verified);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner Bento Card */}
      <div className="bento-card p-6 sm:p-7 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-emerald-200 mb-3 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Portal Administrasi Desa Terpadu • Sistem DEKATI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Bertugas, {activeRole === 'kades' ? profile.kades_name : profile.sekdes_name} 👋
          </h1>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Kelola permohonan surat warga, tanggapi laporan aduan fasilitas desa, dan pantau transparansi APBDes {profile.name} secara real-time.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all"
            >
              <Radio className="w-4 h-4" />
              Kirim Siaran Pengumuman
            </button>
            <button
              onClick={() => onNavigateTab('letters')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              Tinjau {pendingLetters.length} Permohonan Surat
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Bento Metric Cards (Airy & Spacious) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Permohonan Surat */}
        <div 
          onClick={() => onNavigateTab('letters')}
          className="bento-card p-5 cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              E-Surat Masuk
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {pendingLetters.length}
            </span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
              Perlu Tindakan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{readyToSignLetters.length} siap TTE Kades</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </p>
        </div>

        {/* Metric 2: Aduan Warga */}
        <div 
          onClick={() => onNavigateTab('complaints')}
          className="bento-card p-5 cursor-pointer group hover:border-rose-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aduan & Aspirasi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {activeComplaints.length}
            </span>
            <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
              Tiket Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Infrastruktur & Lingkungan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </p>
        </div>

        {/* Metric 3: Verifikasi Warga */}
        <div 
          onClick={() => onNavigateTab('citizens')}
          className="bento-card p-5 cursor-pointer group hover:border-sky-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Warga Terdaftar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {citizens.length}
            </span>
            <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md">
              {unverifiedCitizens.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Buku Induk Kependudukan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </p>
        </div>

        {/* Metric 4: APBDes Serapan */}
        <div 
          onClick={() => onNavigateTab('apbdes')}
          className="bento-card p-5 cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Serapan APBDes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {apbdes.realisasi_persen}%
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              TA {apbdes.fiscal_year}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Rp 1,56 M Realisasi</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </p>
        </div>
      </div>

      {/* Main Bento Grid: 2 Columns (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Letters & APBDes Visual (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bento Card: Antrean Layanan E-Surat Hari Ini */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Antrean Permohonan E-Surat Masuk
                </h3>
                <p className="text-xs text-slate-500">
                  Klik baris surat untuk memeriksa kelengkapan berkas & pengesahan TTE QR
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('letters')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Lihat Semua ({letters.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {letters.slice(0, 4).map((letter) => (
                <div
                  key={letter.id}
                  onClick={() => setSelectedLetter(letter)}
                  className="py-3.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {letter.letter_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          ({letter.tracking_number})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Pemohon: <span className="font-semibold text-slate-700">{letter.citizen_name}</span> • NIK: {letter.citizen_nik}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <LetterStatusBadge status={letter.status} />
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card: APBDes Serapan Visual Breakdown */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Realisasi Anggaran Pendapatan & Belanja Desa (APBDes 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Transparansi keuangan dana transfer pemerintah & pembangunan desa
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('apbdes')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Rincian Pos
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              {/* Pendapatan Progress */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-700">Total Pendapatan Desa</span>
                  <span className="text-emerald-700 font-mono">
                    Rp {(apbdes.pendapatan.total_realized / 1000000000).toFixed(2)} M / Rp {(apbdes.pendapatan.total_budget / 1000000000).toFixed(2)} M
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{
                      width: `${(apbdes.pendapatan.total_realized / apbdes.pendapatan.total_budget) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  {apbdes.pendapatan.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[180px]">{item.name}</span>
                      <span className="font-bold font-mono">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Belanja Progress */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-700">Total Belanja & Kegiatan</span>
                  <span className="text-blue-700 font-mono">
                    Rp {(apbdes.belanja.total_realized / 1000000000).toFixed(2)} M / Rp {(apbdes.belanja.total_budget / 1000000000).toFixed(2)} M
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{
                      width: `${(apbdes.belanja.total_realized / apbdes.belanja.total_budget) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  {apbdes.belanja.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[180px]">{item.name}</span>
                      <span className="font-bold font-mono">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Complaints & Citizens to Verify (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bento Card: Tiket Aduan Warga Lapangan */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquareWarning className="w-4 h-4 text-rose-600" />
                Laporan Aduan Lapangan
              </h3>
              <button
                onClick={() => onNavigateTab('complaints')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                Semua ({complaints.length})
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {complaints.slice(0, 3).map((cmp) => (
                <div
                  key={cmp.id}
                  onClick={() => setSelectedComplaint(cmp)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <ComplaintStatusBadge status={cmp.status} />
                    <span className="text-[10px] text-slate-400">{cmp.dusun}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                    {cmp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {cmp.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span className="truncate">{cmp.location_address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card: Verifikasi Akun Warga Baru */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                Verifikasi Warga Baru
              </h3>
              <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                {unverifiedCitizens.length} antrean
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {unverifiedCitizens.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Semua warga terdaftar sudah diverifikasi.
                </div>
              ) : (
                unverifiedCitizens.map((cit) => (
                  <div
                    key={cit.id}
                    onClick={() => setSelectedCitizen(cit)}
                    className="p-3 bg-sky-50/40 hover:bg-sky-50 rounded-2xl border border-sky-200/60 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {cit.nama_lengkap}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        NIK: {cit.nik}
                      </span>
                    </div>
                    <button className="px-2.5 py-1 text-[11px] font-bold text-white bg-sky-600 rounded-lg shadow-sm">
                      Validasi
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedLetter && (
        <LetterDetailModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}

      {selectedCitizen && (
        <CitizenVerifyModal
          citizen={selectedCitizen}
          onClose={() => setSelectedCitizen(null)}
        />
      )}

      {showAnnouncementModal && (
        <NewAnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
        />
      )}
    </div>
  );
};
