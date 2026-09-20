// src/views/LettersView.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  QrCode, 
  CheckCircle, 
  Clock, 
  FileCheck2, 
  ShieldCheck, 
  XCircle,
  Eye
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { LetterStatusBadge } from '../components/StatusBadge';
import { LetterDetailModal } from '../components/LetterDetailModal';
import { LetterPrintModal } from '../components/LetterPrintModal';
import { QrVerifyModal } from '../components/QrVerifyModal';
import { LetterRequest, LetterStatus } from '../types';

export const LettersView: React.FC = () => {
  const { letters, profile } = useData();
  const [activeFilter, setActiveFilter] = useState<'all' | LetterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [selectedLetter, setSelectedLetter] = useState<LetterRequest | null>(null);
  const [printLetter, setPrintLetter] = useState<LetterRequest | null>(null);
  const [qrLetter, setQrLetter] = useState<LetterRequest | null>(null);

  // Filter logic
  const filteredLetters = letters.filter((l) => {
    const matchesStatus = activeFilter === 'all' ? true : l.status === activeFilter;
    const matchesSearch =
      (l.citizen_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.citizen_nik || '').includes(searchQuery) ||
      (l.tracking_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.letter_official_number && l.letter_official_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' ? true : (l.letter_name || '').includes(selectedType);

    return matchesStatus && matchesSearch && matchesType;
  });

  const filterTabs: { id: 'all' | LetterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Permohonan', count: letters.length },
    { id: 'submitted', label: 'Menunggu Verifikasi', count: letters.filter((l) => l.status === 'submitted').length },
    { id: 'in_verification', label: 'Pemeriksaan Berkas', count: letters.filter((l) => l.status === 'in_verification').length },
    { id: 'approved', label: 'Siap TTE Kades', count: letters.filter((l) => l.status === 'approved').length },
    { id: 'signed', label: 'TTE QR Terbit', count: letters.filter((l) => l.status === 'signed').length },
    { id: 'rejected', label: 'Ditolak', count: letters.filter((l) => l.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Layanan Administrasi E-Surat Desa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi berkas persyaratan permohonan surat warga, penerbitan nomor registrasi desa, dan pengesahan TTE QR Code.
          </p>
        </div>
      </div>

      {/* Filter Tabs (Horizontal Pill Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pemohon, NIK, atau No. Surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">Semua Jenis Surat</option>
            <option value="SKTM">SKTM (Tidak Mampu)</option>
            <option value="SKU">SKU (Usaha)</option>
            <option value="SKCK">Pengantar SKCK</option>
            <option value="Domisili">Keterangan Domisili</option>
          </select>
        </div>
      </div>

      {/* Letters List / Bento Table */}
      <div className="bento-card overflow-hidden">
        {filteredLetters.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Tidak ada permohonan surat yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5">No. Tracking / Surat</th>
                  <th className="py-3.5 px-4">Jenis Surat</th>
                  <th className="py-3.5 px-4">Nama Pemohon & NIK</th>
                  <th className="py-3.5 px-4">Keperluan</th>
                  <th className="py-3.5 px-4">Waktu Pengajuan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLetter(letter)}
                  >
                    <td className="py-4 px-5 font-mono">
                      <div className="font-bold text-slate-900">{letter.tracking_number}</div>
                      {letter.letter_official_number && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {letter.letter_official_number}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {letter.letter_name}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{letter.citizen_name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{letter.citizen_nik}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                      {letter.purpose}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {letter.created_at}
                    </td>
                    <td className="py-4 px-4">
                      <LetterStatusBadge status={letter.status} />
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLetter(letter)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Tinjau Detail Berkas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(letter.status === 'signed' || letter.status === 'approved' || letter.status === 'completed') && (
                          <>
                            <button
                              onClick={() => setPrintLetter(letter)}
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Cetak Kop Surat Resmi"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setQrLetter(letter)}
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Validasi QR TTE"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedLetter && (
        <LetterDetailModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}

      {printLetter && (
        <LetterPrintModal
          letter={printLetter}
          profile={profile}
          onClose={() => setPrintLetter(null)}
        />
      )}

      {qrLetter && (
        <QrVerifyModal
          letter={qrLetter}
          onClose={() => setQrLetter(null)}
        />
      )}
    </div>
  );
};
