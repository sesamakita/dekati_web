import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle, 
  AlertTriangle,
  Printer, 
  QrCode, 
  ShieldCheck, 
  FileCheck2, 
  XCircle, 
  ExternalLink,
  Eye,
  Check,
  Hash,
  Copy,
  Inbox,
  ArrowRight,
  Clock,
  Info,
  Sparkles,
  Phone,
  MapPin,
  FileSpreadsheet,
  Building2,
  MessageSquare,
  Users
} from 'lucide-react';
import { LetterRequest } from '../types';
import { LetterStatusBadge } from './StatusBadge';
import { useData } from '../hooks/useData';
import { LetterPrintModal } from './LetterPrintModal';
import { QrVerifyModal } from './QrVerifyModal';
import { wahaService } from '../services/wahaService';

interface LetterDetailModalProps {
  letter: LetterRequest;
  onClose: () => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ letter: propLetter, onClose }) => {
  const { 
    letters, 
    citizens,
    neighborhoodUnits,
    updateLetterStatus, 
    updateRtApprovalStatus, 
    assignLetterNeighborhoodUnit,
    getNeighborhoodLeader, 
    activeRole, 
    profile, 
    letterTemplates 
  } = useData();
  
  // Realtime reactive letter object: prioritaskan data terkini dari global letters store
  const liveLetter = letters.find((l) => l.id === propLetter.id) || propLetter;
  
  // State lokal agar alur tahapan bergerak instan (0ms) otomatis di dalam modal tanpa perlu tutup/buka
  const [letter, setLetter] = useState<LetterRequest>(liveLetter);

  // Selalu sinkronkan saat data letters di store diperbarui
  useEffect(() => {
    const fresh = letters.find((l) => l.id === propLetter.id);
    if (fresh) {
      setLetter(fresh);
      if (fresh.letter_official_number) {
        setOfficialNumber(fresh.letter_official_number);
      }
    }
  }, [letters, propLetter.id]);

  // Deteksi nomor RT dan RW secara cerdas dari data warga / alamat pemohon jika kosong
  const resolvedRtNumber = useMemo(() => {
    if (letter.rt_number) return letter.rt_number;
    const citizen = citizens.find((c) => c.nik === letter.citizen_nik);
    if (citizen?.rt) return citizen.rt;
    const match = letter.citizen_address?.match(/RT\s*(\d+)/i);
    return match ? match[1].padStart(2, '0') : '';
  }, [letter.rt_number, letter.citizen_nik, letter.citizen_address, citizens]);

  const resolvedRwNumber = useMemo(() => {
    if (letter.rw_number) return letter.rw_number;
    const citizen = citizens.find((c) => c.nik === letter.citizen_nik);
    if (citizen?.rw) return citizen.rw;
    const match = letter.citizen_address?.match(/RW\s*(\d+)/i);
    return match ? match[1].padStart(2, '0') : '';
  }, [letter.rw_number, letter.citizen_nik, letter.citizen_address, citizens]);

  const matchedLeader = useMemo(() => {
    return (
      getNeighborhoodLeader(resolvedRtNumber, resolvedRwNumber) ||
      getNeighborhoodLeader(letter.rt_number, letter.rw_number)
    );
  }, [getNeighborhoodLeader, resolvedRtNumber, resolvedRwNumber, letter.rt_number, letter.rw_number]);

  const currentRtLeaderName = letter.rt_leader_name || matchedLeader?.rt_leader_name || 'Ketua RT Setempat';
  const currentRtLeaderPhone = matchedLeader?.rt_leader_phone || letter.rt_leader_phone || '';

  const [isChangingRt, setIsChangingRt] = useState(false);

  const handleSelectRtUnit = async (unitId: string) => {
    const unit = neighborhoodUnits.find((u) => u.id === unitId);
    if (!unit) return;
    const updated = await assignLetterNeighborhoodUnit(letter.id, unit);
    if (updated) {
      setLetter(updated);
      setIsChangingRt(false);
      setWaSuccessBanner(`Wilayah RT berhasil dihubungkan ke RT ${unit.rt_number} / RW ${unit.rw_number} (${unit.rt_leader_name})`);
      setTimeout(() => setWaSuccessBanner(null), 5000);
    }
  };
  
  // Nomor registrasi surat resmi desa
  const [officialNumber, setOfficialNumber] = useState(
    letter.letter_official_number ||
      `470/${Math.floor(10 + Math.random() * 90)}/${letter.letter_name.split('(')[1]?.replace(')', '') || 'SK'}/X/2026`
  );
  
  // Rejection states
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Revision states (Minta Revisi Dokumen ke Warga)
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionError, setRevisionError] = useState('');
  const [showRevisionBox, setShowRevisionBox] = useState(false);

  // Interactive document verification checklist state (dokumen -> 'valid' | 'needs_fix')
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, 'valid' | 'needs_fix'>>({});
  
  // Sub-modal states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
  const [waSuccessBanner, setWaSuccessBanner] = useState<string | null>(null);

  // Quick revision templates
  const revisionTemplates = [
    'Foto KTP buram / tidak terbaca jelas, mohon unggah ulang.',
    'Surat Pengantar RT/RW belum distempel / bertandatangan basah.',
    'Kartu Keluarga (KK) tidak sesuai dengan nama pemohon.',
    'Foto tempat usaha kurang jelas atau belum melampirkan tampak depan.'
  ];

  // Helper kalkulasi status langkah (Tahap 1 s/d 4)
  const getStepProgress = () => {
    switch (letter.status) {
      case 'pending_rt':
        return { step: 0, percent: 15, label: 'Menunggu Rekomendasi RT' };
      case 'submitted':
        return { step: 1, percent: 25, label: 'Menunggu Pemeriksaan' };
      case 'in_verification':
      case 'needs_revision':
        return { step: 2, percent: 50, label: letter.status === 'needs_revision' ? 'Menunggu Revisi Warga' : 'Pemeriksaan Syarat' };
      case 'approved':
        return { step: 3, percent: 75, label: 'Nomor Siap & Menunggu TTE' };
      case 'signed':
      case 'ready_for_pickup':
      case 'completed':
        return { step: 4, percent: 100, label: 'TTE Sah & Siap Diterbitkan' };
      case 'rejected':
        return { step: 2, percent: 50, label: 'Pengajuan Ditolak' };
      default:
        return { step: 1, percent: 25, label: 'Pengajuan Baru' };
    }
  };

  const progress = getStepProgress();

  // Workflow Handlers: Menggerakkan alur tahapan secara instan otomatis di dalam modal
  const handleManualRtApprove = async () => {
    const updated = await updateRtApprovalStatus(letter.id, 'approved_by_rt', {
      notes: 'Divalidasi manual oleh Admin/Petugas Kantor Desa (Rekomendasi RT Disetujui)',
    });
    if (updated) setLetter(updated);
  };

  const handleManualRtReject = async () => {
    const reason = window.prompt('Masukkan alasan penolakan rekomendasi RT:') || 'Permohonan ditolak oleh Ketua RT / verifikasi kewilayahan tidak memenuhi syarat.';
    const updated = await updateRtApprovalStatus(letter.id, 'rejected_by_rt', {
      rejection_reason: reason,
    });
    if (updated) setLetter(updated);
  };

  const handleSendWaNotification = async () => {
    setSendingWa(true);
    setWaSuccessBanner(null);
    try {
      const leader = matchedLeader || getNeighborhoodLeader(resolvedRtNumber, resolvedRwNumber);
      const targetLetter: LetterRequest = {
        ...letter,
        rt_number: resolvedRtNumber || letter.rt_number,
        rw_number: resolvedRwNumber || letter.rw_number,
        rt_leader_name: currentRtLeaderName,
        rt_leader_phone: currentRtLeaderPhone,
      };
      const res = await wahaService.sendRtApprovalRequest(targetLetter, leader);
      if (res.success) {
        setWaSuccessBanner(`Pesan permohonan berhasil dikirim ke WhatsApp Ketua RT (${currentRtLeaderPhone || 'RT'})`);
        setTimeout(() => setWaSuccessBanner(null), 7000);
      } else {
        alert(`Gagal mengirim WhatsApp: ${res.error || 'Server WAHA tidak merespon'}`);
      }
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setSendingWa(false);
    }
  };

  const handleStartVerification = async () => {
    const updated = await updateLetterStatus(letter.id, 'in_verification');
    if (updated) setLetter(updated);
  };

  const handleApprove = async () => {
    const updated = await updateLetterStatus(letter.id, 'approved', {
      official_number: officialNumber,
    });
    if (updated) setLetter(updated);
  };

  const handleSignTte = async () => {
    const updated = await updateLetterStatus(letter.id, 'signed', {
      official_number: officialNumber,
      signed_by_name: profile.kades_name,
    });
    if (updated) setLetter(updated);
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      setRevisionError('Mohon tuliskan rincian dokumen yang perlu diperbaiki oleh pemohon.');
      return;
    }
    const updated = await updateLetterStatus(letter.id, 'needs_revision', {
      notes: revisionNote,
    });
    if (updated) setLetter(updated);
    setShowRevisionBox(false);
    setRevisionError('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Mohon masukkan alasan penolakan berkas untuk pemohon.');
      return;
    }
    const updated = await updateLetterStatus(letter.id, 'rejected', {
      rejection_reason: rejectReason,
    });
    if (updated) setLetter(updated);
    setShowRejectBox(false);
    setRejectError('');
  };

  const toggleDocVerification = (docName: string, status: 'valid' | 'needs_fix') => {
    setVerifiedDocs((prev) => ({
      ...prev,
      [docName]: prev[docName] === status ? undefined as any : status,
    }));
  };

  const handleCopyNumber = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(officialNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  // Hitung jumlah berkas terverifikasi
  const totalAttachments = letter.attachments?.length || 0;
  const verifiedCount = Object.values(verifiedDocs).filter((v) => v === 'valid').length;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Container: Bento Design Max-W-4XL for spacious reading & inspecting */}
        <div 
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[calc(100vh-2.5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative my-auto animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========================================================================= */}
          {/* 1. FIXED HEADER BAR                                                       */}
          {/* ========================================================================= */}
          <div className="shrink-0 px-6 sm:px-8 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
            <div className="min-w-0 pr-4">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                  {letter.tracking_number}
                </span>
                <LetterStatusBadge status={letter.status} />
                {letter.letter_official_number && (
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    <Hash className="w-3 h-3 text-slate-500" />
                    Reg: {letter.letter_official_number}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">
                {letter.letter_name}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. PILIHAN 1: TOP HORIZONTAL STEPPER (BENTO PROGRESS CARD)                 */}
          {/* ========================================================================= */}
          <div className="shrink-0 px-6 sm:px-8 py-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/70">
            {/* Stepper Header Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Alur Tahapan Layanan:
                </span>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  letter.status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : letter.status === 'needs_revision'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : letter.status === 'pending_rt'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : progress.percent === 100
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {letter.status === 'rejected'
                    ? 'Pengajuan Ditolak'
                    : letter.status === 'needs_revision'
                      ? 'Perlu Revisi Warga'
                      : letter.status === 'pending_rt'
                        ? 'Tahap Awal • Menunggu Rekomendasi RT'
                        : `Tahap ${progress.step} dari 4 • ${progress.percent}% Selesai`}
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
                Status Terkini: <strong className="text-emerald-800">{progress.label}</strong>
              </span>
            </div>

            {/* Stepper Steps Row */}
            <div className="relative">
              {/* Background Connecting Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    letter.status === 'rejected' ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${letter.status === 'rejected' ? 45 : (progress.step - 1) * 33.33}%` }}
                />
              </div>

              {/* 4 Step Items */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                {/* Step 1: Pengajuan Masuk */}
                <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 text-left sm:text-center p-2 sm:p-0 rounded-xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    progress.step > 1
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                      : progress.step === 1
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {progress.step > 1 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Inbox className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11.5px] font-bold text-slate-800 block leading-tight">
                      1. Pengajuan
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Diajukan Warga
                    </span>
                  </div>
                </div>

                {/* Step 2: Verifikasi Dokumen */}
                <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 text-left sm:text-center p-2 sm:p-0 rounded-xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    letter.status === 'rejected'
                      ? 'bg-rose-600 text-white ring-4 ring-rose-200'
                      : letter.status === 'needs_revision'
                        ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                        : progress.step > 2
                          ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                          : progress.step === 2
                            ? 'bg-sky-600 text-white ring-4 ring-sky-200 animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {letter.status === 'rejected' ? (
                      <XCircle className="w-5 h-5" />
                    ) : letter.status === 'needs_revision' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : progress.step > 2 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <FileCheck2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className={`text-[11.5px] font-bold block leading-tight ${
                      letter.status === 'rejected' 
                        ? 'text-rose-700' 
                        : letter.status === 'needs_revision' 
                          ? 'text-amber-800' 
                          : progress.step === 2 
                            ? 'text-sky-800 font-extrabold' 
                            : 'text-slate-800'
                    }`}>
                      2. Verifikasi
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {letter.status === 'needs_revision' ? 'Minta Revisi' : 'Pemeriksaan Syarat'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Nomor Agenda & Draf */}
                <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 text-left sm:text-center p-2 sm:p-0 rounded-xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    progress.step > 3
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                      : progress.step === 3
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {progress.step > 3 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className={`text-[11.5px] font-bold block leading-tight ${
                      progress.step === 3 ? 'text-indigo-800 font-extrabold' : 'text-slate-800'
                    }`}>
                      3. Penomoran
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Buku Agenda Desa
                    </span>
                  </div>
                </div>

                {/* Step 4: TTE QR & Selesai */}
                <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 text-left sm:text-center p-2 sm:p-0 rounded-xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    progress.step === 4 && letter.status !== 'rejected'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {progress.step === 4 && letter.status !== 'rejected' ? (
                      <ShieldCheck className="w-5 h-5 text-white" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className={`text-[11.5px] font-bold block leading-tight ${
                      progress.step === 4 && letter.status !== 'rejected' ? 'text-emerald-800 font-extrabold' : 'text-slate-800'
                    }`}>
                      4. TTE Kades
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Surat Digital Terbit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. SCROLLABLE BODY                                                        */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-5 bg-[#F8FAFC]">
            
            {/* Status Alert Banners if Rejected or Needs Revision */}
            {letter.status === 'rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-rose-900 block">Pengajuan Surat Ini Telah Ditolak</span>
                  <p className="text-rose-700 mt-0.5">Alasan: {letter.rejection_reason || 'Persyaratan administrasi tidak memenuhi ketentuan.'}</p>
                </div>
              </div>
            )}

            {letter.status === 'needs_revision' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block">Status: Menunggu Perbaikan / Revisi Berkas oleh Pemohon</span>
                  <p className="text-amber-800 mt-0.5">
                    Catatan untuk warga: "{letter.rejection_reason || 'Mohon melengkapi berkas persyaratan yang kurang atau buram.'}"
                  </p>
                </div>
              </div>
            )}

            {/* RT RECOMMENDATION BENTO SECTION */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
              letter.rt_status === 'approved_by_rt'
                ? 'bg-emerald-50/50 border-emerald-200'
                : letter.rt_status === 'rejected_by_rt'
                  ? 'bg-rose-50/50 border-rose-200'
                  : letter.rt_status === 'pending_rt' || letter.status === 'pending_rt'
                    ? 'bg-purple-50/50 border-purple-200 ring-2 ring-purple-100'
                    : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    letter.rt_status === 'approved_by_rt'
                      ? 'bg-emerald-600 text-white'
                      : letter.rt_status === 'rejected_by_rt'
                        ? 'bg-rose-600 text-white'
                        : 'bg-purple-600 text-white'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Rekomendasi / Pengantar Ketua RT
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>Kewilayahan:</span>
                      <strong className="text-slate-800">
                        RT {resolvedRtNumber || letter.rt_number || '-'} / RW {resolvedRwNumber || letter.rw_number || '-'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setIsChangingRt(!isChangingRt)}
                        className="text-[10.5px] font-bold text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer"
                      >
                        {isChangingRt ? 'Tutup Pilihan' : 'Ubah / Hubungkan RT'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={sendingWa || !currentRtLeaderPhone}
                    onClick={handleSendWaNotification}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                    title={currentRtLeaderPhone ? `Kirim permohonan ke WhatsApp ${currentRtLeaderPhone}` : 'Pilih unit RT terlebih dahulu'}
                  >
                    <Phone className="w-3 h-3 text-white" />
                    <span>{sendingWa ? 'Mengirim...' : 'Kirim WA ke RT'}</span>
                  </button>

                  {letter.rt_status === 'approved_by_rt' ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Disetujui Ketua RT
                    </span>
                  ) : letter.rt_status === 'rejected_by_rt' ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Ditolak Ketua RT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      Menunggu Balasan RT (WAHA)
                    </span>
                  )}
                </div>
              </div>

              {/* DROPDOWN SELECTOR KETIKA ADMIN INGIN UBAH ATAU HUBUNGKAN RT */}
              {isChangingRt && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 shadow-xs space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Pilih Wilayah RT Pemohon (Data dari Master RT Desa):
                  </label>
                  <select
                    className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                    defaultValue=""
                    onChange={(e) => handleSelectRtUnit(e.target.value)}
                  >
                    <option value="" disabled>-- Pilih RT / Ketua RT --</option>
                    {neighborhoodUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        RT {u.rt_number} / RW {u.rw_number} - {u.dusun_name || 'Dusun'} | Ketua: {u.rt_leader_name} ({u.rt_leader_phone || 'Tanpa WA'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10.5px] text-slate-400">
                    Memilih RT akan otomatis memperbarui nomor WhatsApp tujuan notifikasi WAHA dan menyimpannya ke surat ini.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Ketua RT:</span>
                  <p className="font-bold text-slate-800">
                    {currentRtLeaderName}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Nomor WhatsApp RT:</span>
                  <p className="font-mono font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className={currentRtLeaderPhone ? 'text-slate-800 font-bold' : 'text-amber-600 font-semibold italic'}>
                      {currentRtLeaderPhone || 'Belum diisi (Klik Ubah RT)'}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Status Respon:</span>
                  <p className="font-medium text-slate-700">
                    {letter.rt_approved_at ? (
                      <span className="text-emerald-700 font-semibold">{letter.rt_approved_at}</span>
                    ) : (letter.rt_status === 'pending_rt' || letter.status === 'pending_rt') ? (
                      <span className="text-purple-800 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-purple-600" />
                        Menunggu ketik "1" via WA
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </p>
                </div>
              </div>

                {waSuccessBanner && (
                  <div className="mt-2.5 p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{waSuccessBanner}</span>
                  </div>
                )}

                {letter.rt_rejection_reason && (
                  <div className="mt-2.5 p-2.5 bg-rose-100/70 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <strong>Alasan dari RT:</strong> {letter.rt_rejection_reason}
                  </div>
                )}
                {letter.rt_notes && (
                  <div className="mt-2.5 p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700">
                    <strong>Catatan RT:</strong> {letter.rt_notes}
                  </div>
                )}

                {(letter.rt_status === 'pending_rt' || letter.status === 'pending_rt') && (
                  <div className="mt-3.5 pt-3 border-t border-purple-200 flex flex-wrap items-center justify-between gap-2 bg-purple-100/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl">
                    <div className="text-[11px] text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>
                        Warga membawa surat fisik / ada konfirmasi langsung? Petugas desa dapat memvalidasi manual di sini:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleManualRtReject}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 border border-rose-300 rounded-xl transition-all"
                      >
                        Tolak atas Arahan RT
                      </button>
                      <button
                        type="button"
                        onClick={handleManualRtApprove}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Validasi Manual Rekomendasi RT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {/* BENTO GRID: Data Pemohon & Keperluan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Pemohon Card */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Data Warga Subjek Surat</span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    Terdaftar di BIK
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Nama Lengkap Subjek:</span>
                    <p className="font-bold text-slate-900 text-sm">{letter.citizen_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[11px] block">NIK Pemohon:</span>
                      <p className="font-mono font-bold text-slate-800">{letter.citizen_nik}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Kontak WhatsApp:</span>
                      <p className="font-medium text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{letter.applicant_phone || 'Tersinkron APK'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Alamat Kependudukan:</span>
                    <p className="font-medium text-slate-700 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{letter.citizen_address || `Wilayah ${profile.name}`}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Permohonan & Keperluan Card */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rincian Surat & Keperluan</span>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500">
                      Pengaju: {letter.applicant_name}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Jenis Format Layanan:</span>
                      <p className="font-bold text-slate-800">{letter.letter_name}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Keperluan / Keterangan Tertulis:</span>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-800 font-medium leading-relaxed italic text-[11.5px]">
                        "{letter.purpose}"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Waktu Pengajuan:</span>
                  <span className="font-mono text-slate-600 font-semibold">{letter.created_at || 'Hari ini'}</span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 4. DOKUMEN PERSYARATAN & CEKLIS VERIFIKASI                         */}
            {/* =================================================================== */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Pemeriksaan Dokumen Persyaratan ({totalAttachments})
                  </span>
                </div>
                
                {totalAttachments > 0 && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    verifiedCount === totalAttachments
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {verifiedCount === totalAttachments ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Semua Syarat Sesuai ({verifiedCount}/{totalAttachments})
                      </span>
                    ) : (
                      <span>Ceklis Verifikasi: {verifiedCount} dari {totalAttachments} Sesuai</span>
                    )}
                  </span>
                )}
              </div>

              {totalAttachments === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                  <span>Tidak ada lampiran dokumen khusus untuk jenis surat ini.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {letter.attachments?.map((att, idx) => {
                    const checkStatus = verifiedDocs[att.name];
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          checkStatus === 'valid'
                            ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-100'
                            : checkStatus === 'needs_fix'
                              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-100'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div
                          onClick={() => setSelectedPreviewDoc({ url: att.url, name: att.name })}
                          className="w-full h-28 rounded-xl bg-slate-200 overflow-hidden mb-2 relative cursor-pointer group"
                          title="Klik untuk membuka pratinjau resolusi tinggi"
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5 text-white text-xs font-bold">
                            <Eye className="w-4 h-4 text-white" />
                            <span>Perbesar</span>
                          </div>
                        </div>

                        {/* Title & Status */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                              {att.name}
                            </span>
                            {checkStatus === 'valid' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Valid
                              </span>
                            ) : checkStatus === 'needs_fix' ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                Kurang
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                                Perlu Cek
                              </span>
                            )}
                          </div>

                          {/* Quick Verification Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => toggleDocVerification(att.name, 'valid')}
                              className={`py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                                checkStatus === 'valid'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Sesuai</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleDocVerification(att.name, 'needs_fix')}
                              className={`py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                                checkStatus === 'needs_fix'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200'
                              }`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>Buram</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* 5. TAHAP 3: BUKU AGENDA DESA (PENOMORAN SURAT RESMI)                 */}
            {/* =================================================================== */}
            {(letter.status === 'in_verification' || letter.status === 'approved' || letter.status === 'signed' || letter.status === 'completed') && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                      Nomor Surat Resmi (Buku Registrasi Agenda Desa):
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Standar Kemendagri RI
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={officialNumber}
                    onChange={(e) => setOfficialNumber(e.target.value)}
                    disabled={letter.status === 'signed' || letter.status === 'completed'}
                    placeholder="Contoh: 470/042/DS-SKM/X/2026"
                    className="flex-1 px-4 py-2.5 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 py-2.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
                    title="Salin Nomor Surat"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="hidden sm:inline">Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-emerald-800/80 leading-relaxed font-normal">
                  Nomor ini otomatis tercatat di Buku Induk Administrasi Umum Desa dan tertera pada QR Code TTE pengesahan Kades/Lurah.
                </p>
              </div>
            )}

            {/* =================================================================== */}
            {/* 6. TIMELINE & AUDIT TRAIL                                           */}
            {/* =================================================================== */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Histori Alur &amp; Catatan Petugas
                </span>
                <span className="text-[11px] text-slate-400">Audit Trail Terverifikasi</span>
              </div>

              <div className="space-y-2 text-xs">
                {(Array.isArray(letter.timeline) ? letter.timeline : []).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-semibold text-slate-800">{step.title}</span>
                      {step.actor && (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-medium">
                          {step.actor}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================================== */}
            {/* 7. REVISION BOX (Permintaan Perbaikan Berkas)                       */}
            {/* =================================================================== */}
            {showRevisionBox && (
              <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-300 shadow-sm animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Minta Perbaikan / Revisi Berkas ke Pemohon:</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Warga dapat upload ulang via APK
                  </span>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-amber-800 font-bold self-center">Pilihan Cepat:</span>
                  {revisionTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRevisionNote(tmpl);
                        if (revisionError) setRevisionError('');
                      }}
                      className="text-[10.5px] font-medium bg-white hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                    >
                      {tmpl.split(',')[0]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={revisionNote}
                  onChange={(e) => {
                    setRevisionNote(e.target.value);
                    if (revisionError) setRevisionError('');
                  }}
                  placeholder="Tuliskan catatan detail untuk pemohon (contoh: Foto surat pengantar RT belum distempel, mohon foto ulang dengan jelas)..."
                  rows={2}
                  className="w-full p-3 text-xs text-slate-800 bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                />

                {revisionError && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{revisionError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowRevisionBox(false);
                      setRevisionError('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRequestRevision}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
                  >
                    Kirim Permintaan Revisi
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 8. REJECTION BOX (Penolakan Berkas Permanen)                        */}
            {/* =================================================================== */}
            {showRejectBox && (
              <div className="p-4 sm:p-5 bg-rose-50 rounded-2xl border border-rose-300 shadow-sm animate-fade-in space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Konfirmasi Penolakan Berkas Permohonan:</span>
                </div>

                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder="Masukkan alasan penolakan berkas (contoh: Pemohon tidak berdomisili di wilayah desa ini)..."
                  rows={2}
                  className="w-full p-3 text-xs text-slate-800 bg-white rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-xs"
                />

                {rejectError && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{rejectError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowRejectBox(false);
                      setRejectError('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
                  >
                    Konfirmasi Tolak Permohonan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 9. FIXED FOOTER ACTION BUTTONS BAR                                        */}
          {/* ========================================================================= */}
          <div className="shrink-0 px-6 sm:px-8 py-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
            {/* Left Action Buttons: Cetak & Validasi QR */}
            <div className="flex items-center gap-2">
              {(letter.status === 'signed' || letter.status === 'completed' || letter.status === 'approved') && (
                <>
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Surat Resmi</span>
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Validasi QR TTE</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Action Buttons: Step by Step Workflow Progression */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Tombol Minta Revisi */}
              {letter.status !== 'rejected' && letter.status !== 'signed' && letter.status !== 'completed' && !showRevisionBox && !showRejectBox && (
                <button
                  type="button"
                  onClick={() => setShowRevisionBox(true)}
                  className="px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-300 rounded-xl transition-all flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Minta Revisi</span>
                </button>
              )}

              {/* Tombol Tolak Berkas */}
              {letter.status !== 'rejected' && letter.status !== 'signed' && letter.status !== 'completed' && !showRejectBox && !showRevisionBox && (
                <button
                  type="button"
                  onClick={() => setShowRejectBox(true)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  Tolak Berkas
                </button>
              )}

              {/* TAHAP RT -> TAHAP 1: Validasi Manual Rekomendasi RT */}
              {letter.status === 'pending_rt' && (
                <button
                  onClick={handleManualRtApprove}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition-all ring-2 ring-purple-300/30"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Validasi Manual Rekomendasi RT ➔</span>
                </button>
              )}

              {/* TAHAP 1 -> TAHAP 2: Mulai Verifikasi Berkas */}
              {(letter.status === 'submitted' || letter.status === 'needs_revision') && (
                <button
                  onClick={handleStartVerification}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mulai Verifikasi Syarat ➔</span>
                </button>
              )}

              {/* TAHAP 2 -> TAHAP 3: Tetapkan Nomor & Teruskan ke Kades */}
              {letter.status === 'in_verification' && (
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Loloskan Syarat &amp; Buat No. Agenda ➔</span>
                </button>
              )}

              {/* TAHAP 3 -> TAHAP 4: Pengesahan TTE Digital QR Kades/Lurah */}
              {letter.status === 'approved' && (
                <button
                  onClick={handleSignTte}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all ring-2 ring-emerald-400/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sahkan TTE QR Kades ➔</span>
                </button>
              )}

              {/* Sudah TTE Sah */}
              {(letter.status === 'signed' || letter.status === 'completed') && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Surat Sah &amp; Terbit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. LIGHTBOX PREVIEW DOKUMEN MODAL (High Z-Index)                         */}
      {/* ========================================================================= */}
      {selectedPreviewDoc && (
        <div 
          className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPreviewDoc(null)}
        >
          <div 
            className="max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Toolbar */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm truncate">
                  {selectedPreviewDoc.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  Lampiran Berkas
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedPreviewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                  title="Buka foto asli resolusi penuh di tab baru browser"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buka Resolusi Penuh</span>
                </a>
                <button
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                  title="Tutup Pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Viewer Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950 min-h-[280px]">
              <img
                src={selectedPreviewDoc.url}
                alt={selectedPreviewDoc.name}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      {showPrintModal && (
        <LetterPrintModal
          letter={letter}
          profile={profile}
          templates={letterTemplates}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showQrModal && (
        <QrVerifyModal
          letter={letter}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>,
    document.body
  );
};
