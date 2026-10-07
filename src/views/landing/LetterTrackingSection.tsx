// src/views/landing/LetterTrackingSection.tsx
import React, { useState } from 'react';
import { Search, Check, QrCode } from 'lucide-react';
import { LetterRequest, VillageProfile } from '../../types';
import { LetterStatusBadge } from '../../components/StatusBadge';
import { supabase } from '../../services/supabase';

interface LetterTrackingSectionProps {
  letters: LetterRequest[];
  profile: VillageProfile;
  onOpenQrModal: (letter: LetterRequest) => void;
}

export const LetterTrackingSection: React.FC<LetterTrackingSectionProps> = ({
  letters,
  profile,
  onOpenQrModal,
}) => {
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedLetter, setTrackedLetter] = useState<LetterRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const formatMaskedNik = (nik?: string) => {
    if (!nik || nik.length < 16) return '----------------';
    return `${nik.slice(0, 6)}******${nik.slice(12)}`;
  };

  const searchLetter = async (queryStr: string) => {
    const q = queryStr.trim();
    if (!q) return;

    setHasSearched(true);
    const found = letters.find(
      (l) =>
        l.tracking_number.toLowerCase() === q.toLowerCase() ||
        (l.letter_official_number &&
          l.letter_official_number.toLowerCase().includes(q.toLowerCase()))
    );

    if (found) {
      setTrackedLetter(found);
      return;
    }

    // Direct Supabase lookup jika belum ada di memori lokal
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
      let query = supabase.from('letter_requests').select('*');
      if (isUuid) {
        query = query.or(`id.eq.${q},tracking_number.eq.${q}`);
      } else {
        query = query.eq('tracking_number', q);
      }
      const { data } = await query.maybeSingle();
      if (data) {
        setTrackedLetter(data as LetterRequest);
      } else {
        setTrackedLetter(null);
      }
    } catch {
      setTrackedLetter(null);
    }
  };

  const handleTrackLetter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    searchLetter(trackingQuery);
  };

  const handleQuickTrack = (num: string) => {
    setTrackingQuery(num);
    searchLetter(num);
  };

  return (
    <section id="lacak-surat" className="py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Layanan Pelacakan Mandiri Warga
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lacak Status Surat Anda Tanpa Perlu Login
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Ketikkan nomor resi/tracking pelacakan surat Anda (didapatkan saat mengajukan permohonan melalui aplikasi mobile warga).
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrackLetter} className="relative mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Contoh: SRT-202609-0012 atau SRT-202609-5522..."
                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Lacak Status Sekarang
            </button>
          </div>
        </form>

        {/* Quick Demo Resi Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Coba Resi Demo:</span>
          <button
            type="button"
            onClick={() => handleQuickTrack('SRT-202609-0012')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
          >
            SRT-202609-0012 (SKTM - Sudah TTE QR)
          </button>
          <button
            type="button"
            onClick={() => handleQuickTrack('SRT-202609-5522')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
          >
            SRT-202609-5522 (SKU - Menunggu Verifikasi)
          </button>
          <button
            type="button"
            onClick={() => handleQuickTrack('SRT-202609-0005')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200/80 transition-colors"
          >
            SRT-202609-0005 (Pemeriksaan Berkas)
          </button>
        </div>

        {/* Tracking Result Card */}
        {hasSearched && (
          <div className="animate-fade-in">
            {trackedLetter ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-md space-y-6">
                {/* Top Bar of Result */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. Pelacakan</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{trackedLetter.tracking_number}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{trackedLetter.letter_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Pemohon: <strong>{trackedLetter.citizen_name}</strong> (NIK: {formatMaskedNik(trackedLetter.citizen_nik)})
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <LetterStatusBadge status={trackedLetter.status} />
                    {trackedLetter.letter_official_number && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Reg: {trackedLetter.letter_official_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Keperluan */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Keperluan Permohonan:</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{trackedLetter.purpose}</p>
                </div>

                {/* Timeline Alur Pengerjaan */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Alur Pengerjaan Berkas:
                  </span>
                  <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-3">
                    {trackedLetter.timeline?.map((step, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div
                          className={`absolute -left-[17px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.done
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="text-xs font-bold text-slate-800">{step.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{step.time}</span>
                          {step.actor && <span>• Ditangani oleh: <strong>{step.actor}</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification CTA if Signed */}
                {(trackedLetter.status === 'signed' || trackedLetter.qr_verification_token) && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Surat Sah Bertanda Tangan Elektronik (TTE QR)</div>
                        <div className="text-[11px] text-emerald-700">Disahkan secara sah oleh {trackedLetter.signed_by_name || profile.kades_name || 'Kepala Desa'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenQrModal(trackedLetter)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap"
                    >
                      Lihat Sertifikat TTE QR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500 mb-2">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nomor Pelacakan Tidak Ditemukan</h4>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  Pastikan nomor resi surat yang Anda masukkan benar (contoh: <code>SRT-202609-0012</code>).
                  Jika baru mengajukan dari aplikasi mobile, mohon tunggu beberapa saat untuk sinkronisasi cloud.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
