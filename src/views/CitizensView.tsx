// src/views/CitizensView.tsx
import React, { useState } from 'react';
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
  Building
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { CitizenVerifyModal } from '../components/CitizenVerifyModal';
import { Citizen } from '../types';

export const CitizensView: React.FC = () => {
  const { citizens } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState<string>('all');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const unverifiedCount = citizens.filter((c) => !c.is_verified).length;

  const filteredCitizens = citizens.filter((c) => {
    const matchesTab = activeTab === 'all' ? true : !c.is_verified;
    const matchesSearch =
      c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nik.includes(searchQuery) ||
      c.no_kk.includes(searchQuery);
    const matchesDusun = selectedDusun === 'all' ? true : c.dusun === selectedDusun;

    return matchesTab && matchesSearch && matchesDusun;
  });

  const handleExportCsv = () => {
    const headers = 'ID,NIK,No_KK,Nama_Lengkap,Jenis_Kelamin,Status_Keluarga,Dusun,RT,RW,Terverifikasi\n';
    const rows = citizens
      .map(
        (c) =>
          `"${c.id}","${c.nik}","${c.no_kk}","${c.nama_lengkap}","${c.jenis_kelamin}","${c.status_dalam_keluarga}","${c.dusun}","${c.rt}","${c.rw}","${c.is_verified ? 'Ya' : 'Belum'}"`
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
            Basis data kependudukan desa terpadu, pencocokan data NIK/KK, dan verifikasi akun aplikasi warga.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV (Excel)
        </button>
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
          <span>Daftar Warga Terdaftar ({citizens.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <span>Antrean Validasi Akun Baru</span>
          {unverifiedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {unverifiedCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIK, Nama Lengkap, atau No KK..."
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
            <option value="Dusun Mekar">Dusun Mekar</option>
            <option value="Dusun Krajan">Dusun Krajan</option>
            <option value="Dusun Sukahening">Dusun Sukahening</option>
          </select>
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-5">Identitas NIK & KK</th>
                <th className="py-3.5 px-4">Nama Lengkap & Usia</th>
                <th className="py-3.5 px-4">Status Keluarga</th>
                <th className="py-3.5 px-4">Alamat Wilayah</th>
                <th className="py-3.5 px-4">Pekerjaan</th>
                <th className="py-3.5 px-4">Status Validasi</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    Belum ada data warga terdaftar.
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((citizen) => (
                  <tr
                    key={citizen.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCitizen(citizen)}
                  >
                  <td className="py-4 px-5 font-mono">
                    <div className="font-bold text-slate-900">{citizen.nik}</div>
                    <div className="text-[11px] text-slate-400">KK: {citizen.no_kk}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{citizen.nama_lengkap}</div>
                    <div className="text-[11px] text-slate-500">
                      {citizen.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {citizen.tempat_lahir}, {citizen.tanggal_lahir}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {citizen.status_dalam_keluarga}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{citizen.dusun}</div>
                    <div className="text-[11px] text-slate-500">RT {citizen.rt} / RW {citizen.rw}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {citizen.pekerjaan}
                  </td>
                  <td className="py-4 px-4">
                    {citizen.is_verified ? (
                      <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
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
                          ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {!citizen.is_verified ? 'Periksa KTP' : 'Detail'}
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

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
