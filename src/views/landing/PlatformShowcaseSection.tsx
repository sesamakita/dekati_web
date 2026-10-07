// src/views/landing/PlatformShowcaseSection.tsx
import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Check, 
  MessageSquareWarning, 
  Radio, 
  Users 
} from 'lucide-react';

interface PlatformShowcaseSectionProps {
  onEnterAdmin: () => void;
  onOpenDownloadModal: () => void;
}

export const PlatformShowcaseSection: React.FC<PlatformShowcaseSectionProps> = ({
  onEnterAdmin,
  onOpenDownloadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'kades' | 'warga'>('kades');

  return (
    <section id="dua-platform" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Ekosistem Terintegrasi 1:1
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Dua Platform Saling Melengkapi dalam Satu Basis Data
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Aparatur desa menggunakan Web Admin untuk manajemen birokrasi & pengesahan,
          sedangkan warga menikmati kemudahan pelayanan langsung dari ponsel genggam.
        </p>

        {/* Tab Switcher */}
        <div className="pt-4 flex items-center justify-center">
          <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kades')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'kades'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Portal Web Admin (Kades & Pamong)</span>
            </button>

            <button
              onClick={() => setActiveTab('warga')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'warga'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Aplikasi Mobile (Seluruh Warga)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: WEB ADMIN (KADES & PAMONG) */}
      {activeTab === 'kades' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Pengesahan E-Surat & TTE QR Kades</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pemeriksaan berkas pemohon, penetapan Nomor Surat Resmi Desa sesuai registrasi Kemendagri,
              dan pengesahan Tanda Tangan Elektronik QR Code instan tanpa tanda tangan basah.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Pratinjau berkas KTP, KK, & Surat Pengantar
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Cetak Kop Surat Resmi Pemerintah Kabupaten
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                QR Code keabsahan berkas terenkripsi
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Helpdesk Aduan Warga Cepat Tanggap</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Menampung laporan jalan rusak, PJU padam, dan tumpukan sampah liar.
              Admin mendisposisikan tugas ke Satlinmas atau Kaur Pembangunan, lalu mengunggah foto bukti penyelesaian.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Foto kondisi lapangan & koordinat GPS warga
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Disposisi per aparat desa terkait
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Unggah bukti perbaikan selesai
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-teal-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Siaran Informasi & Broadcast Darurat</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Publikasikan jadwal bansos, posyandu, kerja bakti, atau pengumuman darurat bencana
              yang langsung memicu notifikasi peringatan di layar kunci smartphone warga.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Segmentasi sasaran per Dusun / RW / Seluruh Warga
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Tandai "Prioritas Darurat" untuk notifikasi mendesak
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Mockup pratinjau ponsel cerdas secara real-time
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE APP (SELURUH WARGA) */}
      {activeTab === 'warga' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Urus Surat dari Rumah (Bebas Antre)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Warga cukup membuka aplikasi, memilih jenis surat (SKTM, SKU, Domisili, SKCK),
              mengisi keperluan, dan memilih anggota keluarga yang diajukan tanpa fotokopi berulang.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Otomatis terhubung dengan Kartu Keluarga digital
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Lacak status surat detik per detik
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Simpan file surat resmi PDF siap cetak
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Lapor Fasilitas Rusak (Foto + GPS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Temukan jalan berlubang atau lampu padam? Foto langsung dari kamera ponsel,
              GPS akan menandai koordinat lokasi secara otomatis, lalu kirim ke tim reaksi cepat desa.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Pilihan mode laporan Anonim (identitas terlindungi)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Lihat foto bukti pengerjaan saat aduan selesai
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600" />
                Dukungan nomor tiket pelacakan unik
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Buku Keluarga & Kontak Darurat 24 Jam</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Akses profil kependudukan mandiri, jadwal pembagian BLT Dana Desa,
              dan tombol panggilan cepat ke Ambulans Desa, Babinsa, serta Bhabinkamtibmas.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Panggilan darurat ambulans & pamong 1-klik
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Banner merah peringatan siaga bencana
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Jadwal Posyandu & Imunisasi Balita rutin
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Dual CTA inside Platform section */}
      <div className="text-center pt-4">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onEnterAdmin}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Akses Portal Admin Desa</span>
          </button>
          <button
            onClick={onOpenDownloadModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Dapatkan Aplikasi Mobile Warga</span>
          </button>
        </div>
      </div>
    </section>
  );
};
