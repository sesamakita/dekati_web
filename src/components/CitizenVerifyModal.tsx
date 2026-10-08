// src/components/CitizenVerifyModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Eye, 
  CreditCard, 
  Camera,
  FileText,
  ExternalLink,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  MessageSquare,
  Loader2,
  Users,
  ChevronRight
} from 'lucide-react';
import { Citizen } from '../types';
import { useData } from '../hooks/useData';

interface CitizenVerifyModalProps {
  citizen: Citizen;
  onClose: () => void;
}

export const CitizenVerifyModal: React.FC<CitizenVerifyModalProps> = ({ citizen, onClose }) => {
  const { verifyCitizen, citizens } = useData();
  const [activeCitizen, setActiveCitizen] = useState<Citizen>(citizen);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update activeCitizen when prop citizen changes
  useEffect(() => {
    setActiveCitizen(citizen);
  }, [citizen]);

  // Find all members in the same Kartu Keluarga (KK)
  const familyMembers = citizens.filter(
    (c) => c.no_kk && activeCitizen.no_kk && c.no_kk.trim() === activeCitizen.no_kk.trim()
  );

  const isHeadOfFamily = (activeCitizen.status_dalam_keluarga || '').toLowerCase().includes('kepala keluarga') ||
    activeCitizen.status_dalam_keluarga === 'Kepala Keluarga';
  
  const isPreviousRevision = !activeCitizen.is_verified && activeCitizen.verified_by?.startsWith('revisi:');
  const previousRevisionNote = isPreviousRevision ? activeCitizen.verified_by?.replace(/^revisi:\s*/i, '').trim() : '';
  
  // Document presence checks
  const hasKtp = Boolean(activeCitizen.foto_ktp_path);
  const hasSelfie = Boolean(activeCitizen.foto_selfie_ktp_path);
  const hasKkOrAkta = Boolean(activeCitizen.foto_kk_path);
  const hasAnyDoc = hasKtp || hasSelfie || hasKkOrAkta;

  const cleanPhone = (activeCitizen.phone_number || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Halo ${activeCitizen.nama_lengkap}, kami dari Tim Layanan Operator Desa ingin mengonfirmasi pendaftaran kependudukan DEKATI Anda (NIK: ${activeCitizen.nik}).`)}`
    : null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await verifyCitizen(activeCitizen.id, true);
      // Update local state if needed
      setActiveCitizen(prev => ({ ...prev, is_verified: true, verified_by: 'Operator Verifikasi Desa' }));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Mohon tulis alasan penolakan verifikasi agar warga dapat memperbaikinya di aplikasi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyCitizen(activeCitizen.id, false, rejectReason.trim());
      setActiveCitizen(prev => ({ ...prev, is_verified: false, verified_by: `revisi: ${rejectReason.trim()}` }));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2.5rem)] sm:max-h-[calc(100vh-4rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Fixed Header Bar */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                NIK: {activeCitizen.nik}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                KK: {activeCitizen.no_kk || 'Belum diisi'}
              </span>
              {activeCitizen.is_verified ? (
                <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Terverifikasi
                </span>
              ) : isPreviousRevision ? (
                <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  Perlu Revisi Dokumen
                </span>
              ) : (
                <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  Menunggu Verifikasi
                </span>
              )}
              {hasAnyDoc ? (
                <span className="badge-pill bg-sky-50 text-sky-700 border border-sky-200">
                  {isHeadOfFamily ? (hasKtp ? 'Foto KTP Dilampirkan' : 'Dokumen Fisik Ada') : 'Berkas Anggota Keluarga Ada'}
                </span>
              ) : (
                <span className="badge-pill bg-slate-100 text-slate-500 border border-slate-200">
                  Belum Lampirkan Berkas
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Validasi Akun: {activeCitizen.nama_lengkap}
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                {activeCitizen.status_dalam_keluarga || 'Kepala Keluarga'}
              </span>
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Previous Revision Notice if any */}
          {isPreviousRevision && previousRevisionNote && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200/80 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-900 block">
                  Catatan Penolakan/Revisi Sebelumnya:
                </span>
                <p className="text-xs text-rose-700 mt-0.5 font-medium">
                  "{previousRevisionNote}"
                </p>
              </div>
            </div>
          )}

          {/* Kartu Keluarga Digital: Daftar Seluruh Anggota Keluarga */}
          {familyMembers.length > 1 && (
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Daftar Anggota Keluarga ({familyMembers.length} Jiwa dalam KK ini)
                </span>
                <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  No. KK: {activeCitizen.no_kk}
                </span>
              </div>
              <div className="divide-y divide-indigo-100/70 text-xs">
                {familyMembers.map((member) => {
                  const isCurrent = member.id === activeCitizen.id;
                  return (
                    <div 
                      key={member.id} 
                      className={`py-2 px-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        isCurrent ? 'bg-indigo-100/80 font-bold' : 'hover:bg-indigo-50/50 cursor-pointer'
                      }`}
                      onClick={() => !isCurrent && setActiveCitizen(member)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${member.is_verified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <div>
                          <span className="text-slate-900">{member.nama_lengkap}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                            ({member.status_dalam_keluarga || 'Anggota'}) • NIK: {member.nik}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.is_verified ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            Perlu Validasi
                          </span>
                        )}
                        {!isCurrent && (
                          <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
                            Periksa <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Citizen Profile Information Card */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                Data Kependudukan: {activeCitizen.nama_lengkap}
              </span>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  Hubungi via WhatsApp
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Kartu Keluarga (KK):</span>
                <p className="font-mono font-semibold text-slate-800">{activeCitizen.no_kk || 'Belum diisi'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Telepon / WA:</span>
                <p className="font-mono font-semibold text-slate-800">
                  {activeCitizen.phone_number ? (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {activeCitizen.phone_number}
                    </span>
                  ) : (
                    'Belum dicantumkan'
                  )}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Jenis Kelamin:</span>
                <p className="font-semibold text-slate-800">
                  {activeCitizen.jenis_kelamin === 'L' ? 'Laki-laki (L)' : activeCitizen.jenis_kelamin === 'P' ? 'Perempuan (P)' : '-'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Tempat, Tanggal Lahir:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  {[activeCitizen.tempat_lahir, activeCitizen.tanggal_lahir].filter(Boolean).join(', ') || '-'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Status Hubungan Keluarga:</span>
                <p className="font-semibold text-slate-800">{activeCitizen.status_dalam_keluarga || 'Kepala Keluarga'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Pekerjaan:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  {activeCitizen.pekerjaan || '-'}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block text-[11px]">Alamat & Wilayah Domisili:</span>
                <p className="font-semibold text-slate-800 flex items-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    {activeCitizen.alamat_lengkap || 'Alamat Domisili Warga'} 
                    {activeCitizen.dusun ? ` • Dusun ${activeCitizen.dusun}` : ''}
                    {(activeCitizen.rt || activeCitizen.rw) ? ` (RT ${activeCitizen.rt || '-'}/RW ${activeCitizen.rw || '-'})` : ''}
                    {activeCitizen.village_name ? ` • Desa/Kel. ${activeCitizen.village_name}` : ''}
                    {activeCitizen.district ? `, Kec. ${activeCitizen.district}` : ''}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* DOKUMEN BUKTI ANGGOTA KELUARGA (Jika status bukan Kepala Keluarga) */}
          {!isHeadOfFamily && activeCitizen.foto_kk_path && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Dokumen Bukti Anggota Keluarga (Akta Kelahiran / KIA / Buku Nikah / Kartu Keluarga)
                </span>
                <a
                  href={activeCitizen.foto_kk_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Penuh
                </a>
              </div>
              <div className="h-56 bg-white rounded-xl overflow-hidden border border-emerald-200/80 flex items-center justify-center p-1.5">
                <img
                  src={activeCitizen.foto_kk_path}
                  alt="Dokumen Bukti Anggota Keluarga"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => window.open(activeCitizen.foto_kk_path, '_blank')}
                />
              </div>
            </div>
          )}

          {/* Photo verification grid (KTP & Swafoto) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              {isHeadOfFamily ? 'Bukti Berkas Fisik e-KTP & Swafoto:' : 'Dokumen Identitas Tambahan (e-KTP & Swafoto jika ada):'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-sky-600" /> Foto Fisik e-KTP
                  </span>
                  {activeCitizen.foto_ktp_path && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Ada
                    </span>
                  )}
                </div>
                <div className="h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group flex items-center justify-center">
                  {activeCitizen.foto_ktp_path ? (
                    <>
                      <img
                        src={activeCitizen.foto_ktp_path}
                        alt="KTP"
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                        onClick={() => window.open(activeCitizen.foto_ktp_path, '_blank')}
                      />
                      <a
                        href={activeCitizen.foto_ktp_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Buka
                      </a>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                      <CreditCard className="w-7 h-7 mb-1 text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {isHeadOfFamily ? 'Belum Dilampirkan' : 'Tidak Wajib untuk Anak'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isHeadOfFamily ? 'Menunggu unggahan warga' : 'Cukup Akta Kelahiran/KIA'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-sky-600" /> Swafoto Pegang KTP
                  </span>
                  {activeCitizen.foto_selfie_ktp_path && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Ada
                    </span>
                  )}
                </div>
                <div className="h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group flex items-center justify-center">
                  {activeCitizen.foto_selfie_ktp_path ? (
                    <>
                      <img
                        src={activeCitizen.foto_selfie_ktp_path}
                        alt="Selfie Pegang KTP"
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                        onClick={() => window.open(activeCitizen.foto_selfie_ktp_path, '_blank')}
                      />
                      <a
                        href={activeCitizen.foto_selfie_ktp_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Buka
                      </a>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                      <Camera className="w-7 h-7 mb-1 text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {isHeadOfFamily ? 'Belum Dilampirkan' : 'Tidak Wajib untuk Anak'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isHeadOfFamily ? 'Menunggu unggahan warga' : 'Swafoto akun utama aktif'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dokumen Bukti Fisik / KK jika diunggah warga Kepala Keluarga */}
          {isHeadOfFamily && activeCitizen.foto_kk_path && activeCitizen.foto_kk_path !== activeCitizen.foto_ktp_path && (
            <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Berkas Fisik Lampiran Kartu Keluarga (KK)
                </span>
                <a
                  href={activeCitizen.foto_kk_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Buka Penuh
                </a>
              </div>
              <div className="h-44 bg-white rounded-xl overflow-hidden border border-sky-100 flex items-center justify-center">
                <img
                  src={activeCitizen.foto_kk_path}
                  alt="Dokumen KK / Akta"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>
          )}

          {/* Reject box */}
          {showRejectBox && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 animate-fade-in">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Alasan Penolakan / Permintaan Revisi Akun:
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                placeholder="Contoh: Foto berkas buram, nama tidak sesuai dengan NIK Kependudukan"
                className="w-full p-2.5 text-xs bg-white rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Foto dokumen buram/tidak terbaca',
                  'Berkas Akta/KIA tidak sesuai nama anak',
                  'Nama tidak cocok dengan NIK',
                  'Bukan warga domisili desa ini'
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setRejectReason(sug);
                      if (rejectError) setRejectError('');
                    }}
                    className="text-[10px] bg-rose-100/70 hover:bg-rose-200 text-rose-800 px-2 py-0.5 rounded-lg transition-colors font-medium"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              {rejectError ? (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rejectError}</span>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowRejectBox(false);
                    setRejectError('');
                  }}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-100/50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Kirim Revisi ke Warga
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Action Bar */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          {!showRejectBox ? (
            <button
              onClick={() => {
                setShowRejectBox(true);
                setRejectError('');
              }}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              Minta Revisi Dokumen
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
            >
              Tutup
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Setujui & Verifikasi Warga</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
