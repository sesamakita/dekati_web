// src/views/ApbdesView.tsx
import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Edit3, 
  Sparkles,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Compass,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Save
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { VillageProfileModal } from '../components/VillageProfileModal';
import { ApbdesManageModal } from '../components/ApbdesManageModal';

export const ApbdesView: React.FC = () => {
  const { apbdes, profile, deleteApbdesItem } = useData();

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isApbdesModalOpen, setIsApbdesModalOpen] = useState(false);
  const [apbdesModalTab, setApbdesModalTab] = useState<'pendapatan' | 'belanja'>('pendapatan');

  const openApbdesPortal = (tab: 'pendapatan' | 'belanja' = 'pendapatan') => {
    setApbdesModalTab(tab);
    setIsApbdesModalOpen(true);
  };

  const surplusDefisit = (apbdes.pendapatan?.total_realized || 0) - (apbdes.belanja?.total_realized || 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Title & Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-600" />
            Transparansi APBDes & Profil Pemerintahan Desa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Publikasi anggaran pendapatan & belanja desa tahun {apbdes.fiscal_year} serta identitas wilayah kerja {profile.name}.
          </p>
        </div>

        {/* Portal Trigger Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Kelola APBDes Button */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={() => openApbdesPortal('pendapatan')}
              aria-label="Kelola APBDes (Portal Anggaran)"
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white rounded-xl shadow-sm hover:shadow-violet-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <PieChart className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Kelola APBDes (Portal Anggaran)
              <div className="absolute bottom-full right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>

          {/* Kelola Profil Desa Button */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Kelola Profil Desa"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Building2 className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Kelola Profil Desa
              <div className="absolute bottom-full right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Visual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Pendapatan */}
        <div className="bento-card p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-200/80 relative overflow-visible">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Total Pendapatan Desa
            </span>
            {/* Ubah Target Button */}
            <div className="relative group/tooltip inline-block">
              <button
                type="button"
                onClick={() => openApbdesPortal('pendapatan')}
                aria-label="Ubah Target Pendapatan"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded-lg shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-0.5 transition-all duration-150 whitespace-nowrap z-50 border border-white/10">
                Ubah Target Pendapatan
                <div className="absolute top-full right-2 -mt-px border-4 border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono">
            Rp {(apbdes.pendapatan?.total_realized || 0).toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Target APBDes: Rp {(apbdes.pendapatan?.total_budget || 0).toLocaleString('id-ID')}
          </p>
          <div className="mt-3 w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(apbdes.pendapatan?.total_budget || 0) > 0 ? Math.min(((apbdes.pendapatan.total_realized / apbdes.pendapatan.total_budget) * 100), 100) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Belanja */}
        <div className="bento-card p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-200/80 relative overflow-visible">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Total Belanja & Kegiatan
            </span>
            {/* Ubah Plafon Button */}
            <div className="relative group/tooltip inline-block">
              <button
                type="button"
                onClick={() => openApbdesPortal('belanja')}
                aria-label="Ubah Plafon Belanja"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-100/80 hover:bg-blue-200 text-blue-800 transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded-lg shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-0.5 transition-all duration-150 whitespace-nowrap z-50 border border-white/10">
                Ubah Plafon Belanja
                <div className="absolute top-full right-2 -mt-px border-4 border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-950 font-mono">
            Rp {(apbdes.belanja?.total_realized || 0).toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Plafon Anggaran: Rp {(apbdes.belanja?.total_budget || 0).toLocaleString('id-ID')}
          </p>
          <div className="mt-3 w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(apbdes.belanja?.total_budget || 0) > 0 ? Math.min(((apbdes.belanja.total_realized / apbdes.belanja.total_budget) * 100), 100) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Serapan Realisasi */}
        <div className="bento-card p-5 bg-gradient-to-br from-violet-50/70 to-purple-50/40 border-violet-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-violet-800 uppercase tracking-wider block">
              Persentase Serapan
            </span>
            <span className={`text-[11px] font-bold font-mono ${surplusDefisit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {surplusDefisit >= 0 ? 'Surplus' : 'Defisit'}: Rp {Math.abs(surplusDefisit).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-violet-950 font-mono">
            {apbdes.realisasi_persen || 0}%
          </div>
          <p className="text-xs text-violet-700 mt-1">
            Tahun Anggaran {apbdes.fiscal_year} (Realisasi Aktif)
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kinerja Anggaran Desa Terkendali</span>
          </div>
        </div>
      </div>

      {/* Rincian Pos Pendapatan & Belanja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Pendapatan */}
        <div className="bento-card p-5 space-y-3 relative overflow-visible">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
              <span>Pos Pendapatan Desa (DDS, ADD, PADes)</span>
            </h3>
            {/* Kelola Pendapatan Button */}
            <div className="relative group/tooltip inline-block">
              <button
                type="button"
                onClick={() => openApbdesPortal('pendapatan')}
                aria-label="Kelola Pendapatan"
                className="w-7 h-7 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded-lg shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-0.5 transition-all duration-150 whitespace-nowrap z-50 border border-white/10">
                Kelola Pendapatan
                <div className="absolute top-full right-2 -mt-px border-4 border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(!apbdes.pendapatan?.items || apbdes.pendapatan.items.length === 0) ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 space-y-2">
                <p>Belum ada rincian pos pendapatan untuk TA {apbdes.fiscal_year}.</p>
                <button
                  type="button"
                  onClick={() => openApbdesPortal('pendapatan')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Buka Portal Tambah Pos
                </button>
              </div>
            ) : (
              apbdes.pendapatan.items.map((item) => (
                <div
                  key={item.account_code}
                  className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/80 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="font-mono text-[11px] font-semibold bg-slate-200/80 px-2 py-0.5 rounded-md text-slate-600">
                      {item.account_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Target: Rp {(item.budget_amount || 0).toLocaleString('id-ID')}</span>
                    <span className="font-bold text-emerald-700 font-mono">{item.percentage}%</span>
                  </div>

                  {/* Progress bar serapan item */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-700">
                    <span className="font-bold font-mono text-[11px]">
                      Realisasi: Rp {(item.realized_amount || 0).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openApbdesPortal('pendapatan')}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteApbdesItem('pendapatan', item.account_code)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Hapus pos pendapatan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table Belanja */}
        <div className="bento-card p-5 space-y-3 relative overflow-visible">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 text-blue-800">
              <DollarSign className="w-4 h-4" />
              <span>Pos Belanja Bidang Pembangunan & Layanan</span>
            </h3>
            {/* Kelola Belanja Button */}
            <div className="relative group/tooltip inline-block">
              <button
                type="button"
                onClick={() => openApbdesPortal('belanja')}
                aria-label="Kelola Belanja"
                className="w-7 h-7 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded-lg shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-0.5 transition-all duration-150 whitespace-nowrap z-50 border border-white/10">
                Kelola Belanja
                <div className="absolute top-full right-2 -mt-px border-4 border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(!apbdes.belanja?.items || apbdes.belanja.items.length === 0) ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 space-y-2">
                <p>Belum ada rincian pos belanja kegiatan untuk TA {apbdes.fiscal_year}.</p>
                <button
                  type="button"
                  onClick={() => openApbdesPortal('belanja')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Buka Portal Tambah Pos
                </button>
              </div>
            ) : (
              apbdes.belanja.items.map((item) => (
                <div
                  key={item.account_code}
                  className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/80 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="font-mono text-[11px] font-semibold bg-slate-200/80 px-2 py-0.5 rounded-md text-slate-600">
                      {item.account_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Plafon: Rp {(item.budget_amount || 0).toLocaleString('id-ID')}</span>
                    <span className="font-bold text-blue-700 font-mono">{item.percentage}%</span>
                  </div>

                  {/* Progress bar serapan item */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-700">
                    <span className="font-bold font-mono text-[11px]">
                      Realisasi: Rp {(item.realized_amount || 0).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openApbdesPortal('belanja')}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteApbdesItem('belanja', item.account_code)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Hapus pos belanja ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profil Lengkap Desa & Struktur Pemerintahan Bento Card */}
      <div className="bento-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{profile.name || 'Pemerintah Desa'}</span>
                {profile.code && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Kode: {profile.code}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {[profile.district, profile.regency, profile.province].filter(Boolean).join(' • ') || 'Identitas wilayah kerja pemerintahan desa'}
              </p>
            </div>
          </div>

          <div className="relative group/tooltip inline-block shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Kelola Profil Desa"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Kelola Profil Desa
              <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>
        </div>

        {/* Baris Identitas Wilayah & Pimpinan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kepala Desa / Lurah:</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">{profile.kades_name || '-'}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Penanggung Jawab Wilayah & Otoritas TTE</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Sekretaris Desa (Carik):</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">{profile.sekdes_name || '-'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pimpinan Tata Usaha & Verifikasi</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Kontak Kantor:</span>
            </div>
            <p className="font-bold text-slate-900">{profile.office_phone || '-'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile.office_email || '-'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Alamat Kantor Balai Desa:</span>
            </div>
            <p className="font-bold text-slate-900 line-clamp-2">{profile.office_address || '-'}</p>
            {profile.postal_code && (
              <p className="text-[11px] text-slate-500 mt-0.5">Kode Pos: {profile.postal_code}</p>
            )}
          </div>
        </div>

        {/* Visi Misi Pembangunan */}
        <div className="pt-4 border-t border-slate-100 text-xs space-y-3">
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
            <span className="font-bold text-emerald-950 block mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Visi Desa:</span>
            </span>
            <p className="italic text-emerald-900 leading-relaxed">
              "{profile.vision || 'Mewujudkan tata kelola desa yang transparan, maju, mandiri, dan berkeadilan melalui pelayanan digital terintegrasi.'}"
            </p>
          </div>

          {profile.mission && profile.mission.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="font-bold text-slate-800 block mb-2">Misi Pembangunan Desa:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                {profile.mission.map((m, idx) => (
                  <li key={idx} className="leading-relaxed">{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Portal Kelola APBDes Lengkap */}
      <ApbdesManageModal
        isOpen={isApbdesModalOpen}
        onClose={() => setIsApbdesModalOpen(false)}
        defaultTab={apbdesModalTab}
      />

      {/* Modal 2: Portal Kelola Profil & Identitas Desa */}
      <VillageProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
