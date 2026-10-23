// src/views/landing/VillageOfficialsSection.tsx
import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { VillageOfficial, VillageProfile } from '../../types';
import { initialVillageOfficials } from '../../data/mockData';

interface VillageOfficialsSectionProps {
  officials?: VillageOfficial[];
  profile: VillageProfile;
}

type OfficialCategory = 'all' | 'pimpinan' | 'kaur' | 'kasi' | 'wilayah';

export const VillageOfficialsSection: React.FC<VillageOfficialsSectionProps> = ({
  officials,
  profile,
}) => {
  const activeOfficials = officials && officials.length > 0 ? officials : initialVillageOfficials;
  const [selectedCategory, setSelectedCategory] = useState<OfficialCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanWaNumber = (official: VillageOfficial): string => {
    const raw = official.whatsapp || official.phone_number || '';
    let digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (!digits.startsWith('62') && digits.length > 0) {
      digits = '62' + digits;
    }
    return digits;
  };

  const filteredOfficials = useMemo(() => {
    return activeOfficials.filter((official) => {
      // Filter by category
      if (selectedCategory === 'pimpinan') {
        if (official.role !== 'kades' && official.role !== 'lurah' && official.role !== 'sekdes') {
          return false;
        }
      } else if (selectedCategory === 'kaur') {
        if (!official.role.includes('kaur')) return false;
      } else if (selectedCategory === 'kasi') {
        if (!official.role.includes('kasi')) return false;
      } else if (selectedCategory === 'wilayah') {
        if (official.role !== 'kadus' && official.role !== 'satlinmas') return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = official.nama_lengkap.toLowerCase().includes(q);
        const matchJabatan = (official.jabatan || '').toLowerCase().includes(q);
        const matchRole = official.role.toLowerCase().includes(q);
        const matchNip = (official.nip || '').toLowerCase().includes(q);
        if (!matchName && !matchJabatan && !matchRole && !matchNip) return false;
      }

      return true;
    });
  }, [activeOfficials, selectedCategory, searchQuery]);

  const pimpinanList = useMemo(() => {
    return activeOfficials.filter((o) => o.role === 'kades' || o.role === 'lurah' || o.role === 'sekdes');
  }, [activeOfficials]);

  return (
    <section id="organisasi" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-xs">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Organisasi &amp; Pamong Desa
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Aparatur Pemerintah {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Susunan pamong dan perangkat desa yang siap melayani kebutuhan administrasi dan kemasyarakatan warga.
            Hubungi aparatur terkait langsung via WhatsApp resmi untuk konsultasi dan informasi pelayanan.
          </p>
        </div>

        {/* Featured Pimpinan Desa Cards */}
        {pimpinanList.length > 0 && selectedCategory === 'all' && !searchQuery.trim() && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pimpinanList.map((pimpinan) => {
              const waNumber = getCleanWaNumber(pimpinan);
              const waMessage = encodeURIComponent(
                `Halo ${pimpinan.nama_lengkap} (${pimpinan.jabatan || 'Pamong Desa'}), saya warga ${profile.name} ingin berkonsultasi mengenai pelayanan desa.`
              );
              const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : '#';

              const isKades = pimpinan.role === 'kades' || pimpinan.role === 'lurah';

              return (
                <div
                  key={pimpinan.id}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isKades
                      ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-700/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-white text-slate-900 border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center shrink-0 ${
                          isKades
                            ? 'border-emerald-400/50 bg-emerald-800'
                            : 'border-emerald-200 bg-emerald-50'
                        }`}
                      >
                        {pimpinan.avatar_url ? (
                          <img
                            src={pimpinan.avatar_url}
                            alt={pimpinan.nama_lengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCheck
                            className={`w-10 h-10 ${isKades ? 'text-emerald-300' : 'text-emerald-600'}`}
                          />
                        )}
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white border border-white flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Aktif
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                            isKades
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isKades
                            ? profile.village_type === 'kelurahan'
                              ? 'Lurah'
                              : 'Kepala Desa'
                            : profile.village_type === 'kelurahan'
                            ? 'Sekretaris Kelurahan'
                            : 'Sekretaris Desa (Carik)'}
                        </span>
                        {pimpinan.can_sign_tte && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            Otoritas TTE QR
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-lg sm:text-xl font-extrabold tracking-tight truncate ${
                          isKades ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {pimpinan.nama_lengkap}
                      </h3>

                      {pimpinan.nip && (
                        <p className={`text-xs ${isKades ? 'text-slate-300' : 'text-slate-500'}`}>
                          NIP: {pimpinan.nip}
                        </p>
                      )}

                      <p
                        className={`text-xs leading-relaxed ${
                          isKades ? 'text-emerald-200/90' : 'text-slate-600'
                        }`}
                      >
                        {isKades
                          ? 'Penanggung jawab tertinggi wilayah, kebijakan desa, dan penandatangan dokumen administrasi TTE digital.'
                          : 'Koordinator tata usaha pemerintahan, administrasi persuratan desa, dan verifikasi berkas permohonan warga.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                      isKades ? 'border-white/10' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isKades ? 'text-slate-200' : 'text-slate-700'
                        }`}
                      >
                        {pimpinan.phone_number || pimpinan.whatsapp || '-'}
                      </span>
                      {(pimpinan.phone_number || pimpinan.whatsapp) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPhone(pimpinan.id, pimpinan.whatsapp || pimpinan.phone_number || '')
                          }
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            isKades
                              ? 'text-slate-300 hover:bg-white/10'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title="Salin Nomor Telepon"
                        >
                          {copiedId === pimpinan.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {pimpinan.phone_number && (
                        <a
                          href={`tel:${pimpinan.phone_number.replace(/[^0-9]/g, '')}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isKades
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Telepon
                        </a>
                      )}
                      {waNumber && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          Chat WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Semua Aparatur ({activeOfficials.length})
            </button>
            <button
              onClick={() => setSelectedCategory('pimpinan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'pimpinan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Pimpinan
            </button>
            <button
              onClick={() => setSelectedCategory('kasi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'kasi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Kepala Seksi (Kasi)
            </button>
            <button
              onClick={() => setSelectedCategory('kaur')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'kaur'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Kepala Urusan (Kaur)
            </button>
            <button
              onClick={() => setSelectedCategory('wilayah')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'wilayah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Kadus &amp; Linmas
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan pamong..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-slate-200/90 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-xs transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Officials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedCategory === 'all' && !searchQuery.trim()
            ? filteredOfficials.filter((o) => o.role !== 'kades' && o.role !== 'lurah' && o.role !== 'sekdes')
            : filteredOfficials
          ).map((official) => {
            const waNumber = getCleanWaNumber(official);
            const waMessage = encodeURIComponent(
              `Halo Bpk/Ibu ${official.nama_lengkap} (${official.jabatan || 'Pamong Desa'}), saya warga ${profile.name} ingin berkonsultasi mengenai pelayanan.`
            );
            const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : '#';

            // Role badge color scheme
            let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
            if (official.role === 'kades' || official.role === 'lurah') {
              badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            } else if (official.role === 'sekdes') {
              badgeBg = 'bg-teal-100 text-teal-800 border-teal-200';
            } else if (official.role.includes('kasi')) {
              badgeBg = 'bg-sky-100 text-sky-800 border-sky-200';
            } else if (official.role.includes('kaur')) {
              badgeBg = 'bg-violet-100 text-violet-800 border-violet-200';
            } else if (official.role === 'kadus' || official.role === 'satlinmas') {
              badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={official.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group-hover:scale-105 transition-transform">
                      {official.avatar_url ? (
                        <img
                          src={official.avatar_url}
                          alt={official.nama_lengkap}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-extrabold text-lg">
                          {official.nama_lengkap.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border mb-1 truncate max-w-full ${badgeBg}`}
                      >
                        {official.jabatan || official.role}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate group-hover:text-emerald-700 transition-colors">
                        {official.nama_lengkap}
                      </h4>
                      {official.nip ? (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIP: {official.nip}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Aparatur Pemerintah {profile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">WhatsApp / Telp:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 font-mono">
                        {official.whatsapp || official.phone_number || '-'}
                      </span>
                      {(official.whatsapp || official.phone_number) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPhone(
                              official.id,
                              official.whatsapp || official.phone_number || ''
                            )
                          }
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Salin Nomor"
                        >
                          {copiedId === official.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  {official.phone_number && (
                    <a
                      href={`tel:${official.phone_number.replace(/[^0-9]/g, '')}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Panggil
                    </a>
                  )}

                  {waNumber ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 py-2 italic text-center w-full">
                      Kontak belum dicantumkan
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOfficials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Pamong Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada data aparatur yang cocok dengan kata kunci "{searchQuery}". Silakan coba kata kunci lain.
            </p>
          </div>
        )}

        {/* Information Banner */}
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                Jam Pelayanan Tatap Muka Kantor Balai Desa
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Senin - Jumat: 08.00 - 15.30 WIB • Untuk keperluan mendesak, silakan hubungi kontak WhatsApp di atas.
              </div>
            </div>
          </div>
          <a
            href="#lacak-surat"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300/80 transition-colors whitespace-nowrap"
          >
            Lacak Status Permohonan Surat
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default VillageOfficialsSection;
