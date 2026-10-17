// src/views/landing/EmergencyContactSection.tsx
import React from 'react';
import { Siren, PhoneCall, ChevronRight } from 'lucide-react';
import { EmergencyContact } from '../../types';

interface EmergencyContactSectionProps {
  contacts: EmergencyContact[];
}

const iconClasses: Record<string, string> = {
  car: 'bg-red-100 text-red-600',
  shield: 'bg-blue-100 text-blue-600',
  'shield-checkmark': 'bg-indigo-100 text-indigo-600',
  flame: 'bg-orange-100 text-orange-600',
  default: 'bg-emerald-100 text-emerald-600'
};

export const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({ contacts }) => {
  const activeContacts = contacts
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99));

  if (activeContacts.length === 0) {
    return null;
  }

  return (
    <section id="darurat" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            Layanan Darurat 24 Jam
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Kontak Cepat Saat Warga Membutuhkan Pertolongan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Nomor layanan publik wilayah desa/kelurahan yang siap dihubungi kapan pun — disimpan
            permanen di aplikasi DEKATI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activeContacts.map((contact) => {
            const iconCls = iconClasses[contact.icon ?? 'default'] ?? iconClasses.default;
            return (
              <a
                key={contact.id}
                href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/40 hover:bg-slate-800 transition-all group"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconCls}`}>
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="mt-4 text-sm font-extrabold text-white">{contact.title}</div>
                {contact.description && (
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{contact.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-700/60">
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {contact.phone}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </a>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Nomor dikelola pemdes &amp; mitra keamanan — diperbarui oleh operator desa/kelurahan.
        </p>
      </div>
    </section>
  );
};
