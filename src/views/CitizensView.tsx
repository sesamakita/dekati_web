// src/views/CitizensView.tsx
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  ShieldAlert, 
  Download, 
  CheckCircle, 
  XCircle,
  Eye,
  Building,
  RefreshCw,
  Home,
  FileText,
  User,
  CreditCard
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { CitizenVerifyModal } from '../components/CitizenVerifyModal';
import { Citizen } from '../types';

export const CitizensView: React.FC = () => {
  const { citizens, syncFromSupabase } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'kk'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState<string>('all');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const unverifiedCount = citizens.filter((c) => !c.is_verified).length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncFromSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  // Group citizens by Kartu Keluarga (KK)
  const kkGroups = useMemo(() => {
    const map = new Map<string, Citizen[]>();
    citizens.forEach((c) => {
      const key = c.no_kk && c.no_kk.trim() ? c.no_kk.trim() : `NON_KK_${c.nik}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });

    return Array.from(map.entries()).map(([noKk, members]) => {
      const head = members.find((m) => (m.status_dalam_keluarga || '').toLowerCase().includes('kepala')) || members[0];
      return {
        noKk: noKk.startsWith('NON_KK_') ? 'Belum Ada No. KK' : noKk,
        head,
        members,
        unverifiedCount: members.filter((m) => !m.is_verified).length,
      };
    });
  }, [citizens]);

  const filteredCitizens = citizens.filter((c) => {
    const matchesTab = activeTab === 'all' ? true : activeTab === 'pending' ? !c.is_verified : true;
    const matchesSearch =
      (c.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nik || '').includes(searchQuery) ||
      (c.no_kk || '').includes(searchQuery) ||
      (c.phone_number || '').includes(searchQuery);
    const matchesDusun = selectedDusun === 'all' ? true : c.dusun === selectedDusun;

    return matchesTab && matchesSearch && matchesDusun;
  });

  const filteredKkGroups = kkGroups.filter((group) => {
    const matchesSearch =
      (group.head?.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.noKk.includes(searchQuery) ||
      group.members.some((m) => (m.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) || (m.nik || '').includes(searchQuery));
    const matchesDusun = selectedDusun === 'all' ? true : (group.head?.dusun === selectedDusun || group.members.some(m => m.dusun === selectedDusun));
    return matchesSearch && matchesDusun;
  });

  const handleExportCsv = () => {
    const headers = 'ID,NIK,No_KK,Nama_Lengkap,Jenis_Kelamin,Status_Keluarga,Dusun,RT,RW,No_Telepon,Terverifikasi\n';
    const rows = citizens
      .map(
        (c) =>
          `"${c.id}","${c.nik || ''}","${c.no_kk || ''}","${c.nama_lengkap || ''}","${c.jenis_kelamin || ''}","${c.status_dalam_keluarga || ''}","${c.dusun || ''}","${c.rt || ''}","${c.rw || ''}","${c.phone_number || ''}","${c.is_verified ? 'Ya' : 'Belum'}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `buku_induk_kependudukan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Buku Induk Kependudukan & Validasi Warga
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Basis data kependudukan desa terpadu, pencocokan data NIK/KK, dan verifikasi akun serta anggota keluarga dari aplikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all disabled:opacity-50"
            title="Muat data terbaru dari database Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <span>Semua Jiwa / Warga ({citizens.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <span>Antrean Validasi Akun & Anggota Baru</span>
          {unverifiedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {unverifiedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kk'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Buku Kartu Keluarga ({kkGroups.length} KK)</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIK, Nama, No. KK, atau Telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDusun}
            onChange={(e) => setSelectedDusun(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">Semua Dusun</option>
            {Array.from(new Set(citizens.map((c) => c.dusun).filter(Boolean))).map((dusun) => (
              <option key={dusun} value={dusun}>
                {dusun}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: TABEL SEMUA WARGA / ANTREAN VALIDASI */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <div className="bento-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5">Identitas NIK & KK</th>
                  <th className="py-3.5 px-4">Nama Lengkap & Telepon</th>
                  <th className="py-3.5 px-4">Peran Keluarga</th>
                  <th className="py-3.5 px-4">Alamat Wilayah</th>
                  <th className="py-3.5 px-4">Berkas Terlampir</th>
                  <th className="py-3.5 px-4">Status Validasi</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                      {activeTab === 'pending'
                        ? 'Tidak ada antrean validasi akun atau anggota keluarga baru saat ini.'
                        : 'Belum ada data warga terdaftar.'}
                    </td>
                  </tr>
                ) : (
                  filteredCitizens.map((citizen) => {
                    const isHead = (citizen.status_dalam_keluarga || '').toLowerCase().includes('kepala') || citizen.status_dalam_keluarga === 'Kepala Keluarga';
                    const hasDoc = Boolean(citizen.foto_ktp_path || citizen.foto_kk_path || citizen.foto_selfie_ktp_path);

                    return (
                      <tr
                        key={citizen.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedCitizen(citizen)}
                      >
                        <td className="py-4 px-5 font-mono">
                          <div className="font-bold text-slate-900">{citizen.nik}</div>
                          <div className="text-[11px] text-slate-400">KK: {citizen.no_kk || '-'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {citizen.nama_lengkap}
                            {isHead ? (
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                                Akun Utama
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                Anggota
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {citizen.jenis_kelamin === 'L' ? 'Laki-laki' : citizen.jenis_kelamin === 'P' ? 'Perempuan' : '-'} • {[citizen.tempat_lahir, citizen.tanggal_lahir].filter(Boolean).join(', ') || '-'}
                          </div>
                          {citizen.phone_number && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Telp/WA: {citizen.phone_number}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {citizen.status_dalam_keluarga || 'Kepala Keluarga'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {citizen.pekerjaan || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="font-semibold text-slate-800">{citizen.dusun || '-'}</div>
                          <div className="text-[11px] text-slate-500">
                            {(citizen.rt || citizen.rw) ? `RT ${citizen.rt || '-'}/RW ${citizen.rw || '-'}` : '-'}
                            {citizen.village_name ? ` • ${citizen.village_name}` : ''}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {hasDoc ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              <FileText className="w-3 h-3 text-emerald-600" />
                              {citizen.foto_ktp_path ? 'e-KTP' : citizen.foto_kk_path ? 'Akta/KK' : 'Ada Berkas'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                              Belum Ada
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {citizen.is_verified ? (
                            <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Terverifikasi
                            </span>
                          ) : citizen.verified_by?.startsWith('revisi:') ? (
                            <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Perlu Revisi
                            </span>
                          ) : (
                            <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Perlu Validasi
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedCitizen(citizen)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              !citizen.is_verified
                                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {!citizen.is_verified ? 'Validasi Berkas' : 'Detail'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: BUKU KARTU KELUARGA (GROUPED BY NO_KK) */}
      {activeTab === 'kk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKkGroups.length === 0 ? (
            <div className="col-span-2 bento-card p-12 text-center text-slate-400">
              <Home className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              Tidak ditemukan data Kartu Keluarga.
            </div>
          ) : (
            filteredKkGroups.map((group) => (
              <div 
                key={group.noKk}
                className="bento-card p-5 space-y-3 hover:shadow-md transition-shadow border border-slate-200/80"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block font-mono">
                      No. KK: {group.noKk}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Keluarga: {group.head?.nama_lengkap || 'Belum Tercatat'}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      {group.head?.dusun || '-'} 
                      {(group.head?.rt || group.head?.rw) ? ` • RT ${group.head?.rt || '-'}/RW ${group.head?.rw || '-'}` : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 block">
                      {group.members.length} Jiwa
                    </span>
                    {group.unverifiedCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-1">
                        {group.unverifiedCount} Perlu Validasi
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Anggota Keluarga Terdaftar:
                  </span>
                  <div className="divide-y divide-slate-100 text-xs">
                    {group.members.map((member) => (
                      <div 
                        key={member.id}
                        className="py-2 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                        onClick={() => setSelectedCitizen(member)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.is_verified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          <div>
                            <span className="font-semibold text-slate-900">{member.nama_lengkap}</span>
                            <span className="text-[11px] text-slate-500 ml-1.5">
                              ({member.status_dalam_keluarga || 'Anggota'})
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              NIK: {member.nik}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {member.is_verified ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Validasi
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Verification Modal */}
      {selectedCitizen && (
        <CitizenVerifyModal
          citizen={selectedCitizen}
          onClose={() => setSelectedCitizen(null)}
        />
      )}
    </div>
  );
};
