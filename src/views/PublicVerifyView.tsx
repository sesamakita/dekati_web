// src/views/PublicVerifyView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MapPin,
  Building2,
  Printer,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { LetterRequest, VillageProfile } from '../types';
import { dataService } from '../services/dataService';
import { LetterPrintModal } from '../components/LetterPrintModal';

export const PublicVerifyView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [letter, setLetter] = useState<LetterRequest | null>(null);
  const [profile, setProfile] = useState<VillageProfile>(dataService.getVillageProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLetter = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const found = await dataService.getLetterByTokenOrTracking(token);
        if (isMounted) {
          setLetter(found);
          setProfile(dataService.getVillageProfile());
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLetter();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatMaskedNik = (nik?: string) => {
    if (!nik || nik.length < 16) return '----------------';
    return `${nik.slice(0, 6)}******${nik.slice(12)}`;
  };

  const isVerified = letter && (letter.status === 'signed' || letter.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                Pemerintah Desa {profile.name}
              </h1>
              <p className="text-xs text-slate-500">
                Kec. {profile.district}, Kab. {profile.regency}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda Desa</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">
              Memeriksa keaslian dokumen di basis data desa...
            </p>
          </div>
        ) : isVerified ? (
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
            {/* Verified Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                    <ShieldCheck className="w-8 h-8 text-emerald-100" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1 border border-white/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      TTE QR RESMI TERVALIDASI
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Dokumen Sah Pemerintah Desa
                    </h2>
                  </div>
                </div>

                <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 text-xs font-mono">
                  TOKEN: {letter.qr_verification_token || token}
                </div>
              </div>
            </div>

            {/* Document Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Notice per UU ITE & UU PDP */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                <strong>Verifikasi Resmi:</strong> Dokumen ini telah ditandatangani secara elektronik (TTE QR) oleh Kepala Desa {profile.name} sesuai dengan ketentuan UU Informasi dan Transaksi Elektronik (UU ITE) serta perlindungan data pribadi (UU PDP No. 27/2022).
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Nomor Registrasi Surat
                  </span>
                  <p className="font-bold text-slate-900 text-base">
                    {letter.letter_official_number || '470/...'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Jenis Dokumen / Layanan
                  </span>
                  <p className="font-bold text-slate-900 text-base">
                    {letter.letter_name}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Nama Pemohon
                  </span>
                  <p className="font-bold text-slate-900 text-base">
                    {letter.citizen_name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    NIK: {formatMaskedNik(letter.citizen_nik)}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Disahkan Oleh (TTE QR)
                  </span>
                  <p className="font-bold text-slate-900 text-base">
                    {letter.signed_by_name || profile.kades_name || 'Kepala Desa'}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">
                    Kepala Desa {profile.name}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Pengesahan
                  </span>
                  <p className="font-semibold text-slate-800">
                    {letter.signed_at || letter.updated_at || 'Hari ini'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Keperluan
                  </span>
                  <p className="font-semibold text-slate-800">
                    {letter.purpose || '-'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Lihat / Cetak Salinan Resmi
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Tersalin' : 'Salin Tautan'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-rose-200 overflow-hidden text-center p-8 sm:p-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Dokumen Tidak Ditemukan atau Belum Disahkan
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Kode token verifikasi <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-800">{token || 'N/A'}</code> tidak cocok dengan arsip dokumen resmi yang telah disahkan dengan TTE QR di Pemerintah Desa {profile.name}.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 max-w-md mx-auto text-left leading-relaxed">
              <strong>Kemungkinan Penyebab:</strong>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Surat masih dalam proses peninjauan petugas dan belum disahkan oleh Kepala Desa.</li>
                <li>QR Code dipindai dari dokumen yang bukan terbitan resmi desa ini.</li>
                <li>Tautan atau token verifikasi tidak lengkap.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow transition-colors"
              >
                Kembali ke Beranda Desa
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        Portal Terpadu Sistem Informasi Desa (DEKATI) • Dilindungi Undang-Undang
      </footer>

      {/* Print Modal if requested */}
      {showPrintModal && letter && (
        <LetterPrintModal
          letter={letter}
          profile={profile}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default PublicVerifyView;
