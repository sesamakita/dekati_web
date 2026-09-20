// src/views/AnnouncementsView.tsx
import React, { useState } from 'react';
import { 
  Radio, 
  PlusCircle, 
  Eye, 
  AlertTriangle, 
  Calendar, 
  User, 
  Send, 
  CheckCircle2,
  Users,
  X
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { NewAnnouncementModal } from '../components/NewAnnouncementModal';
import { Announcement } from '../types';

export const AnnouncementsView: React.FC = () => {
  const { announcements } = useData();
  const [showModal, setShowModal] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Bansos':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Kesehatan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Lingkungan':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Darurat':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            Pusat Informasi & Broadcast Pengumuman Desa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kirimkan berita resmi, jadwal bantuan sosial (BLT), posyandu, atau peringatan darurat ke smartphone seluruh warga desa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Siaran Baru
        </button>
      </div>

      {/* Announcements Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {announcements.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveAnnouncement(item)}
            className="bento-card p-5 cursor-pointer flex flex-col justify-between hover:border-emerald-300 transition-all group"
          >
            <div>
              {/* Category & Urgency badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`badge-pill border ${getCategoryBadge(item.category)}`}>
                  {item.category}
                </span>

                {item.is_urgent && (
                  <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Mendesak
                  </span>
                )}
              </div>

              {/* Title & Summary */}
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                {item.content}
              </p>
            </div>

            {/* Target and Author Meta */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Target:
                </span>
                <span>
                  {item.target_type === 'all' ? 'Seluruh Warga Desa' : item.target_value || item.target_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <User className="w-3 h-3" />
                  {item.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal if clicked */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
            <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <span className={`badge-pill border ${getCategoryBadge(activeAnnouncement.category)}`}>
                {activeAnnouncement.category}
              </span>
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h2 className="text-base font-bold text-slate-900">
                {activeAnnouncement.title}
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Dipublikasikan oleh {activeAnnouncement.author} • {activeAnnouncement.date}
              </div>
              <p className="text-xs text-slate-700 mt-4 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {activeAnnouncement.content}
              </p>
            </div>

            <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end">
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {showModal && (
        <NewAnnouncementModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};
