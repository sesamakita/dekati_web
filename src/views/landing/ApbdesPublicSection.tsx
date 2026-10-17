// src/views/landing/ApbdesPublicSection.tsx
import React from 'react';
import { PieChart } from 'lucide-react';
import { ApbdesData, VillageProfile } from '../../types';

interface ApbdesPublicSectionProps {
  apbdes: ApbdesData;
  profile: VillageProfile;
}

export const ApbdesPublicSection: React.FC<ApbdesPublicSectionProps> = ({
  apbdes,
  profile,
}) => {
  return (
    <section id="transparansi" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <PieChart className="w-3.5 h-3.5" />
            Akuntabilitas Publik Terbuka
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Transparansi Anggaran Pendapatan & Belanja Desa (APBDes)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {profile.name || 'Pemerintah Desa'} membuka data serapan dana desa secara berkala
            sebagai komitmen tata kelola pemerintahan yang bersih dan bebas korupsi.
          </p>
        </div>

        {/* APBDes Bento Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Realisasi Card */}
          <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Realisasi Anggaran</span>
              <span className="text-emerald-400 font-extrabold text-base">{apbdes.realisasi_persen}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${apbdes.realisasi_persen}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tahun Anggaran 2026 berjalan secara transparan dan akuntabel berdasarkan Keputusan BPD & Musrenbangdes.
            </p>
          </div>

          {/* Pendapatan Card */}
          <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Total Pendapatan Desa
            </span>
            <div className="text-2xl font-black text-white">
              Rp {apbdes.pendapatan.total_budget.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span>Terealisasi:</span>
              <span className="font-bold text-emerald-300">
                Rp {apbdes.pendapatan.total_realized.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Belanja Card */}
          <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
              Total Belanja Desa
            </span>
            <div className="text-2xl font-black text-white">
              Rp {apbdes.belanja.total_budget.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span>Terealisasi:</span>
              <span className="font-bold text-teal-300">
                Rp {apbdes.belanja.total_realized.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Inline breakdown items (data-driven dari APBDes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {apbdes.pendapatan.items.slice(0, 2).map((item) => (
            <div
              key={`pd-${item.account_code}`}
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 font-semibold leading-snug">{item.name}</span>
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase">
                  Pendapatan
                </span>
              </div>
              <div className="mt-2 font-bold text-white text-sm">
                Rp {item.budget_amount.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-emerald-400 font-bold">{item.percentage}% Terserap</div>
            </div>
          ))}
          {apbdes.belanja.items.slice(0, 2).map((item) => (
            <div
              key={`bl-${item.account_code}`}
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 font-semibold leading-snug">{item.name}</span>
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 text-[10px] font-extrabold uppercase">
                  Belanja
                </span>
              </div>
              <div className="mt-2 font-bold text-white text-sm">
                Rp {item.budget_amount.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-teal-400 font-bold">{item.percentage}% Terserap</div>
            </div>
          ))}
          {apbdes.pendapatan.items.length === 0 && apbdes.belanja.items.length === 0 && (
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 text-center text-slate-400">
              Rincian APBDes {apbdes.fiscal_year} akan diumumkan menyusul setelah penetapan
              bersama BPD dan Musrenbangdes.
            </div>
          )}
        </div>

        {/* Catatan rincian lengkap */}
        <p className="text-center text-[11px] text-slate-500">
          Data rincian pendapatan & belanja {profile.name} TA {apbdes.fiscal_year} · diperbarui
          berkala oleh Sekretariat Desa.
        </p>
      </div>
    </section>
  );
};
