// src/components/ComplaintDetailModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Calendar, 
  Wrench, 
  CheckCircle2, 
  Share2, 
  Check, 
  Upload, 
  AlertTriangle 
} from 'lucide-react';
import { Complaint } from '../types';
import { ComplaintStatusBadge } from './StatusBadge';
import { useData } from '../hooks/useData';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({ complaint, onClose }) => {
  const { updateComplaintStatus } = useData();
  const [department, setDepartment] = useState(complaint.assigned_department || 'Seksi Kesejahteraan & Pembangunan Desa');
  const [officer, setOfficer] = useState(complaint.assigned_officer || 'Ir. Hendro Wijoyo');
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || '');
  const [showResolveBox, setShowResolveBox] = useState(false);

  const handleStartHandling = () => {
    updateComplaintStatus(complaint.id, 'in_progress', {
      assigned_department: department,
      assigned_officer: officer,
    });
  };

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      alert('Mohon masukkan catatan bukti penanganan untuk warga.');
      return;
    }
    updateComplaintStatus(complaint.id, 'resolved', {
      assigned_department: department,
      assigned_officer: officer,
      resolution_notes: resolutionNotes,
      resolution_proof: complaint.resolution_proof || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    });
    setShowResolveBox(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container: Max-height with safe viewport distance up and down */}
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Fixed Header Bar */}
        <div className="shrink-0 px-6 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {complaint.ticket_number}
              </span>
              <ComplaintStatusBadge status={complaint.status} />
              <span className="text-xs font-semibold text-slate-500">
                • {complaint.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4">
          {/* Location & Reporter Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Titik Lokasi Kejadian
            </div>
            <p className="text-xs font-bold text-slate-800">
              {complaint.location_address}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Wilayah: {complaint.dusun} (RT {complaint.rt} / RW {complaint.rw})
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Pelapor
            </div>
            <p className="text-xs font-bold text-slate-800">
              {complaint.reporter_name}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Waktu: {complaint.created_at}
            </p>
          </div>
        </div>

        {/* Description & Photo Evidence */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Uraian Masalah:
          </span>
          <p className="text-xs text-slate-800 leading-relaxed mt-1">
            "{complaint.description}"
          </p>

          {/* Photo Preview */}
          {complaint.photo_url && (
            <div className="mt-3">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                Foto Bukti Lapangan:
              </span>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={complaint.photo_url}
                  alt="Bukti Aduan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Handling Officer / Department */}
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            Disposisi Tim Penanganan Lapangan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Seksi / Departemen Penanggung Jawab:
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={complaint.status === 'resolved'}
                className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Seksi Kesejahteraan & Pembangunan Desa">Seksi Pembangunan Desa</option>
                <option value="Satuan Linmas & Ketenteraman Desa">Satlinmas / Ketenteraman</option>
                <option value="Seksi Kebersihan & Lingkungan Hidup">Kebersihan & Lingkungan</option>
                <option value="Pelayanan Aparatur Desa">Sekretariat Pelayanan</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Petugas Lapangan PIC:
              </label>
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                disabled={complaint.status === 'resolved'}
                className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Resolved notes if already resolved */}
        {complaint.status === 'resolved' && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Laporan Selesai Ditangani ({complaint.resolved_at})
            </div>
            <p className="text-xs text-emerald-800">
              {complaint.resolution_notes}
            </p>
            {complaint.resolution_proof && (
              <div className="mt-2.5">
                <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                  Foto Bukti Penyelesaian Lapangan:
                </span>
                <img
                  src={complaint.resolution_proof}
                  alt="Bukti Selesai"
                  className="w-32 h-20 object-cover rounded-lg border border-emerald-300"
                />
              </div>
            )}
          </div>
        )}

        {/* Resolve Input Box */}
        {showResolveBox && (
          <div className="mt-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300">
            <label className="block text-xs font-bold text-emerald-950 mb-1">
              Catatan Bukti Tindak Lanjut Penanganan:
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Contoh: Perbaikan aspal lubang telah selesai dikerjakan oleh Tim Pembangunan Desa pada 19 September..."
              rows={2}
              className="w-full p-2.5 text-xs text-slate-800 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowResolveBox(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleResolve}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Simpan & Selesaikan Laporan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer Bar */}
      <div className="shrink-0 px-6 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
        {complaint.status === 'submitted' && (
          <button
            onClick={handleStartHandling}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <Wrench className="w-4 h-4" />
            Disposisi & Mulai Penanganan
          </button>
        )}

        {complaint.status === 'in_progress' && !showResolveBox && (
          <button
            onClick={() => setShowResolveBox(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Selesaikan Tiket Aduan
          </button>
        )}

        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
  );
};
