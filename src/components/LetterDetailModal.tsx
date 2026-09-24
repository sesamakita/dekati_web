// src/components/LetterDetailModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  FileCheck2, 
  XCircle, 
  ExternalLink,
  Eye
} from 'lucide-react';
import { LetterRequest } from '../types';
import { LetterStatusBadge } from './StatusBadge';
import { useData } from '../hooks/useData';
import { LetterPrintModal } from './LetterPrintModal';
import { QrVerifyModal } from './QrVerifyModal';

interface LetterDetailModalProps {
  letter: LetterRequest;
  onClose: () => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ letter, onClose }) => {
  const { updateLetterStatus, activeRole, profile } = useData();
  const [officialNumber, setOfficialNumber] = useState(
    letter.letter_official_number ||
      `470/${Math.floor(10 + Math.random() * 90)}/${letter.letter_name.split('(')[1]?.replace(')', '') || 'SK'}/IX/2026`
  );
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<string | null>(null);

  const handleStartVerification = () => {
    updateLetterStatus(letter.id, 'in_verification');
  };

  const handleApprove = () => {
    updateLetterStatus(letter.id, 'approved', {
      official_number: officialNumber,
    });
  };

  const handleSignTte = () => {
    updateLetterStatus(letter.id, 'signed', {
      official_number: officialNumber,
      signed_by_name: profile.kades_name,
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan berkas.');
      return;
    }
    updateLetterStatus(letter.id, 'rejected', {
      rejection_reason: rejectReason,
    });
    setShowRejectBox(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        {/* Modal Container: Max-height with safe viewport distance up and down */}
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
          
          {/* Fixed Header Bar */}
          <div className="shrink-0 px-6 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {letter.tracking_number}
                </span>
                <LetterStatusBadge status={letter.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {letter.letter_name}
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
            {/* Citizen Bio Card (Bento Style) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              Data Pemohon & Warga Subjek
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Nama Subjek Surat:</span>
                <p className="font-bold text-slate-800 text-sm">{letter.citizen_name}</p>
              </div>
              <div>
                <span className="text-slate-400">NIK:</span>
                <p className="font-mono font-semibold text-slate-800">{letter.citizen_nik}</p>
              </div>
              <div>
                <span className="text-slate-400">Akun Pengaju:</span>
                <p className="font-medium text-slate-700">{letter.applicant_name} ({letter.applicant_phone || 'WhatsApp'})</p>
              </div>
              <div>
                <span className="text-slate-400">Alamat Kependudukan:</span>
                <p className="font-medium text-slate-700">{letter.citizen_address || 'Wilayah Desa'}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/70">
              <span className="text-slate-400 text-xs">Keperluan / Keterangan:</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 bg-white p-2.5 rounded-xl border border-slate-200/60">
                "{letter.purpose}"
              </p>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Lampiran Dokumen Persyaratan ({letter.attachments?.length || 0})</span>
              <span className="text-[11px] text-slate-400 font-normal">Klik untuk pratinjau</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {letter.attachments?.map((att, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPreviewDoc(att.url)}
                  className="group cursor-pointer p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-full h-16 rounded-lg bg-slate-200 overflow-hidden mb-1.5 relative">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate w-full">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Terlampir
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Numbering Field */}
          {(letter.status === 'in_verification' || letter.status === 'approved' || letter.status === 'signed' || letter.status === 'completed') && (
            <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                Nomor Surat Resmi Desa (Buku Registrasi Desa):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={officialNumber}
                  onChange={(e) => setOfficialNumber(e.target.value)}
                  disabled={letter.status === 'signed' || letter.status === 'completed'}
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Format penomoran standar Kementerian Dalam Negeri dan Pemerintah Desa.
              </p>
            </div>
          )}

          {/* Timeline Process */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Histori Alur Penerbitan
            </div>
            <div className="space-y-2 text-xs">
              {(Array.isArray(letter.timeline) ? letter.timeline : []).map((step, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-800">{step.title}</span>
                    {step.actor && (
                      <span className="text-[10px] text-slate-400">({step.actor})</span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Form Box */}
          {showRejectBox && (
            <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Alasan Penolakan Berkas:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Lampiran foto KTP buram dan tidak terbaca, mohon unggah ulang..."
                rows={2}
                className="w-full p-2.5 text-xs text-slate-800 bg-white rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Action Buttons Bar */}
          <div className="shrink-0 px-6 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {/* Print and QR buttons if approved or signed */}
              {(letter.status === 'signed' || letter.status === 'completed' || letter.status === 'approved') && (
                <>
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Surat Resmi
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Lihat Validasi QR
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {letter.status !== 'rejected' && letter.status !== 'completed' && !showRejectBox && (
                <button
                  onClick={() => setShowRejectBox(true)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  Tolak Berkas
                </button>
              )}

              {/* Step 1: Start Verification */}
              {letter.status === 'submitted' && (
                <button
                  onClick={handleStartVerification}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Mulai Verifikasi Berkas
                </button>
              )}

              {/* Step 2: Approve & Issue Number */}
              {letter.status === 'in_verification' && (
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Tetapkan No. & Siapkan TTE
                </button>
              )}

              {/* Step 3: Sign Digital TTE (Kades or Admin) */}
              {letter.status === 'approved' && (
                <button
                  onClick={handleSignTte}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sahkan TTE QR Kades
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Image Modal */}
      {selectedPreviewDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setSelectedPreviewDoc(null)}
        >
          <div className="max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
            <img
              src={selectedPreviewDoc}
              alt="Pratinjau Berkas"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Sub Modals */}
      {showPrintModal && (
        <LetterPrintModal
          letter={letter}
          profile={profile}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showQrModal && (
        <QrVerifyModal
          letter={letter}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
};
