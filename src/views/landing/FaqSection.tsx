// src/views/landing/FaqSection.tsx
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { VillageProfile } from '../../types';

interface FaqSectionProps {
  profile: VillageProfile;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ profile }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Bagaimana kekuatan hukum Tanda Tangan Elektronik (TTE QR Code) Kepala Desa / Lurah?',
      a: 'Tanda Tangan Elektronik (TTE) pada platform Dekati mengacu pada UU No. 11/2008 jo UU No. 1/2024 tentang ITE serta regulasi Kementerian Dalam Negeri dan BSSN. Dokumen PDF yang diterbitkan memuat kode hash unik dan QR Code validator publik yang dapat diverifikasi keasliannya oleh instansi perbankan, kepolisian, dinas pendidikan, atau rumah sakit.'
    },
    {
      q: 'Apakah warga dikenakan biaya saat menggunakan aplikasi mobile atau mengurus surat?',
      a: `Tidak ada biaya sepeser pun. Seluruh layanan E-Surat, pengaduan fasilitas, dan pengumuman balai desa dapat diakses secara gratis oleh warga yang terdata secara sah pada Buku Induk Kependudukan ${profile.name || 'Desa'}.`
    },
    {
      q: 'Bagaimana keamanan data NIK dan dokumen Kartu Keluarga warga?',
      a: 'Platform Dekati mematuhi standar UU No. 27/2022 tentang Perlindungan Data Pribadi (UU PDP). Database disimpan pada cloud terenkripsi, berkas hanya dapat diakses oleh operator berwenang dan warga bersangkutan melalui verifikasi NIK sah.'
    },
    {
      q: 'Apakah platform ini dapat diadopsi oleh Desa atau Kelurahan lain di Indonesia?',
      a: 'Sangat bisa. Arsitektur Dekati dirancang modular dan multi-tenant. Pengaturan profil desa, nama kepala desa, batas wilayah RT/RW/Dusun, jenis surat master, serta skema database cloud dapat disesuaikan untuk kebutuhan setiap desa maupun kelurahan.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            Pertanyaan yang Sering Diajukan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tanya Jawab untuk Pamong & Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Informasi hukum, teknis, dan regulasi pemanfaatan platform Dekati.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
