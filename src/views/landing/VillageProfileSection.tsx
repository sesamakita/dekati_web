// src/views/landing/VillageProfileSection.tsx
import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Target,
  ScrollText,
  User,
  Landmark
} from 'lucide-react';
import { VillageProfile } from '../../types';

interface VillageProfileSectionProps {
  profile: VillageProfile;
}

export const VillageProfileSection: React.FC<VillageProfileSectionProps> = ({ profile }) => {
  const hasIdentity =
    profile.name &&
    (profile.district || profile.regency || profile.office_address || profile.office_phone);
  const hasVision = profile.vision || (profile.mission && profile.mission.length > 0);

  if (!hasIdentity && !hasVision) {
    return null;
  }

  return (
    <section id="profil-desa" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Building2 className="w-3.5 h-3.5" />
            Identitas &amp; Arah Pembangunan
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Profil {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {profile.name}, {profile.district}, {profile.regency}, {profile.province}
            {profile.postal_code ? ` · Kode Pos ${profile.postal_code}` : ''}
            {profile.code ? ` · Kode Desa ${profile.code}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Identitas Kantor */}
          <div className="lg:col-span-2 p-7 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Pemerintah {profile.name}
            </h3>

            <div className="space-y-4 text-sm">
              {profile.office_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Alamat Kantor</div>
                    <div className="text-slate-600 leading-relaxed">{profile.office_address}</div>
                  </div>
                </div>
              )}
              {profile.office_phone && (
                <a
                  href={`tel:${profile.office_phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-3 group"
                >
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Telepon Kantor
                    </div>
                    <div className="text-slate-600">{profile.office_phone}</div>
                  </div>
                </a>
              )}
              {profile.office_email && (
                <a
                  href={`mailto:${profile.office_email}`}
                  className="flex items-center gap-3 group"
                >
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Surat Elektronik
                    </div>
                    <div className="text-slate-600 break-all">{profile.office_email}</div>
                  </div>
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/70 space-y-3">
              {profile.kades_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Kepala {profile.village_type === 'kelurahan' ? 'Lurah' : 'Desa'}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{profile.kades_name}</div>
                  </div>
                </div>
              )}
              {profile.sekdes_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Sekretaris {profile.village_type === 'kelurahan' ? 'Kelurahan' : 'Desa'}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{profile.sekdes_name}</div>
                  </div>
                </div>
              )}

              <a
                href="#organisasi"
                className="mt-3 inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition-colors group/orglink"
              >
                <span>Lihat Aparatur &amp; Kontak WhatsApp</span>
                <span className="text-emerald-600 group-hover/orglink:translate-x-0.5 transition-transform">→</span>
              </a>
            </div>
          </div>

          {/* Visi & Misi */}
          <div className="lg:col-span-3 p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Visi &amp; Misi {profile.name}</h3>
            </div>

            {profile.vision && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                  Visi
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
                  “{profile.vision}”
                </p>
              </div>
            )}

            {profile.mission && profile.mission.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <ScrollText className="w-3.5 h-3.5" />
                  Misi
                </div>
                <ol className="space-y-2.5">
                  {profile.mission.map((m, i) => (
                    <li
                      key={`mission-${i}`}
                      className="flex items-start gap-3 text-sm text-slate-200 leading-relaxed"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {m}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
