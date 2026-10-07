// src/views/landing/AnnouncementsPublicSection.tsx
import React from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import { Announcement } from '../../types';

interface AnnouncementsPublicSectionProps {
  announcements: Announcement[];
  onOpenDownloadModal: () => void;
}

export const AnnouncementsPublicSection: React.FC<AnnouncementsPublicSectionProps> = ({
  announcements,
  onOpenDownloadModal,
}) => {
  return (
    <section id="pengumuman" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Radio className="w-3.5 h-3.5 text-teal-600" />
            Kanal Berita & Pengumuman
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Siaran Resmi Balai Desa Terkini
          </h2>
        </div>
        <button
          onClick={onOpenDownloadModal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          <span>Dapatkan notifikasi di aplikasi mobile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {announcements.slice(0, 3).map((announcement) => (
          <div
            key={announcement.id}
            className={`p-6 rounded-3xl bg-white border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
              announcement.is_urgent ? 'border-rose-200 ring-1 ring-rose-200/60' : 'border-slate-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    announcement.category === 'Bansos'
                      ? 'bg-amber-100 text-amber-800'
                      : announcement.category === 'Kesehatan'
                      ? 'bg-emerald-100 text-emerald-800'
                      : announcement.category === 'Darurat'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {announcement.category}
                </span>
                {announcement.is_urgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Penting
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {announcement.title}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {announcement.summary || announcement.content}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
              <span>{announcement.date}</span>
              <span>Oleh: {announcement.author?.split(' ')[0] || 'Sekretariat'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
