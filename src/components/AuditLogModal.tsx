import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Download, 
  FileCheck2, 
  Users, 
  Coins, 
  Clock, 
  Filter, 
  History,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AuditLog, AuditLogCategory } from '../types';
import { useData } from '../hooks/useData';
import { getRoleDisplayName } from '../utils/rbac';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, profile } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AuditLogCategory | 'all'>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        log.user_name.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        (log.target_name && log.target_name.toLowerCase().includes(q)) ||
        (log.target_id && log.target_id.toLowerCase().includes(q)) ||
        log.action.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: auditLogs.length,
      tte: auditLogs.filter((l) => l.action === 'TTE_SIGN').length,
      surat: auditLogs.filter((l) => l.category === 'surat').length,
      citizens: auditLogs.filter((l) => l.category === 'kependudukan').length,
    };
  }, [auditLogs]);

  const handleExportCsv = () => {
    const headers = 'ID,Waktu,Petugas,Peran_Jabatan,Kategori,Aksi,Deskripsi_Aktivitas,Target_Terkait\n';
    const rows = filteredLogs
      .map((log) => {
        const dateStr = new Date(log.timestamp).toLocaleString('id-ID');
        const roleStr = getRoleDisplayName(log.user_role, profile.village_type);
        return `"${log.id}","${dateStr}","${log.user_name}","${roleStr}","${log.category}","${log.action}","${log.description.replace(/"/g, '""')}","${(log.target_name || log.target_id || '-').replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_trail_aktivitas_${(profile?.name || 'Desa').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'TTE_SIGN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/90 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            TTE QR Sah
          </span>
        );
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200/90 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200/90 shadow-xs">
            <X className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      case 'REVISE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/90 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perbaikan
          </span>
        );
      case 'CITIZEN_VERIFY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200/90 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            Verifikasi Warga
          </span>
        );
      case 'OFFICIAL_CREATE':
      case 'OFFICIAL_UPDATE':
      case 'OFFICIAL_DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200/90 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            Aparatur
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            {action}
          </span>
        );
    }
  };

  const getCategoryIcon = (category: AuditLogCategory) => {
    switch (category) {
      case 'surat':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'kependudukan':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'keuangan':
        return <Coins className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[88vh] my-auto flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                Audit Trail & Buku Rekam Jejak Sistem
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Legalitas pengesahan TTE QR Code & aktivitas kepatuhan aparatur {profile?.name || 'Pemerintah Desa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={handleExportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Unduh seluruh rekam jejak dalam format Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Aktivitas</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">{stats.total}</div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">TTE QR Disahkan</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5">{stats.tte}</div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Layanan Surat</span>
            <div className="text-lg font-black text-sky-700 mt-0.5">{stats.surat}</div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Kependudukan</span>
            <div className="text-lg font-black text-indigo-700 mt-0.5">{stats.citizens}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 bg-white shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama aparatur, nomor surat, NIK, atau tindakan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200/80 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Semua ({auditLogs.length})
            </button>
            <button
              onClick={() => setSelectedCategory('surat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'surat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Surat & TTE
            </button>
            <button
              onClick={() => setSelectedCategory('kependudukan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'kependudukan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Kependudukan
            </button>
            <button
              onClick={() => setSelectedCategory('perangkat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'perangkat'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Aparatur
            </button>
          </div>
        </div>

        {/* Scrollable Audit List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100/90">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum Ada Rekam Aktivitas</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tidak ada log aktivitas yang cocok dengan kata kunci atau filter yang dipilih.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={log.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4 hover:bg-slate-50/60 p-2 sm:p-2.5 rounded-2xl transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80">
                      {getCategoryIcon(log.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900">{log.user_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {getRoleDisplayName(log.user_role, profile?.village_type)}
                        </span>
                        {getActionBadge(log.action)}
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {log.description}
                      </p>
                      {log.target_name && (
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg w-fit max-w-full">
                          <span className="font-semibold text-slate-600 shrink-0">Subjek:</span>
                          <span className="font-medium text-slate-700 truncate">{log.target_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 sm:pl-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedTime} WIB</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{formattedDate}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Menampilkan {filteredLogs.length} dari {auditLogs.length} catatan aktivitas</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Ekspor CSV
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
