import React from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { VillageProfile } from '../../types';
import { DekatiLogo } from '../../components/DekatiLogo';
import { scrollToSection } from '../../utils/scrollUtils';

interface LandingFooterProps {
  profile: VillageProfile;
  onEnterAdmin: () => void;
  onOpenDownloadModal: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  profile,
  onEnterAdmin,
  onOpenDownloadModal,
}) => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <footer className="bg-white border-t border-slate-200 py-14 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3 flex-wrap">
              <DekatiLogo variant="brand" className="h-7 w-auto" />
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Desa &amp; Kelurahan semakin dekat di hati warga
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Platform Tata Kelola Pemerintahan Desa & Kelurahan Digital Terpadu.
              Mendekatkan pelayanan birokrasi, mempercepat penerbitan surat ber-TTE QR, dan menjaga akuntabilitas publik.
            </p>
            <div className="text-[11px] text-slate-400">
              {profile.office_address} • Telepon: {profile.office_phone} • Email: {profile.office_email}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Akses Portal</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onEnterAdmin} className="hover:text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Masuk Dashboard Admin Desa
                </button>
              </li>
              <li>
                <button onClick={onOpenDownloadModal} className="hover:text-emerald-600 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  Unduh Aplikasi Mobile Warga
                </button>
              </li>
              <li>
                <a href="#lacak-surat" onClick={(e) => handleAnchorClick(e, 'lacak-surat')} className="hover:text-emerald-600">Lacak Status Surat Mandiri</a>
              </li>
              <li>
                <a href="#transparansi" onClick={(e) => handleAnchorClick(e, 'transparansi')} className="hover:text-emerald-600">Transparansi APBDes 2026</a>
              </li>
              <li>
                <a href="#dua-platform" onClick={(e) => handleAnchorClick(e, 'dua-platform')} className="hover:text-emerald-600">Fitur Pamong & Warga</a>
              </li>
              <li>
                <a href="#pengumuman" onClick={(e) => handleAnchorClick(e, 'pengumuman')} className="hover:text-emerald-600">Siaran Desa</a>
              </li>
              <li>
                <a href="#agenda" onClick={(e) => handleAnchorClick(e, 'agenda')} className="hover:text-emerald-600">Agenda Kegiatan</a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="hover:text-emerald-600">Tanya Jawab</a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Kepatuhan Standar</h5>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Standar E-Government Kemendagri RI</li>
              <li>• Keabsahan TTE Sesuai Regulasi BSSN</li>
              <li>• Perlindungan Data Pribadi (UU PDP)</li>
              <li>• Sistem Terbuka PostgreSQL Supabase</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Pemerintahan {profile.name}, {profile.district}, {profile.regency}. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Platform Dekati v1.0.0 (Web Admin & Mobile App)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
