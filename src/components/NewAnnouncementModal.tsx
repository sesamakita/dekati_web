// src/components/NewAnnouncementModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Send, 
  Smartphone, 
  AlertTriangle 
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { TargetAudienceType } from '../types';

interface NewAnnouncementModalProps {
  onClose: () => void;
}

export const NewAnnouncementModal: React.FC<NewAnnouncementModalProps> = ({ onClose }) => {
  const { createAnnouncement, profile } = useData();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Bansos' | 'Kesehatan' | 'Lingkungan' | 'Darurat' | 'Pemerintahan'>('Bansos');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<TargetAudienceType>('all');
  const [targetValue, setTargetValue] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Mohon lengkapi judul dan rincian pengumuman.');
      return;
    }

    createAnnouncement({
      title,
      category,
      summary: summary || title,
      content,
      target_type: targetType,
      target_value: targetValue || undefined,
      is_urgent: isUrgent,
      author: profile.sekdes_name || `Sekretariat ${profile.name || 'Desa'}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container: Max-height with safe viewport distance up and down */}
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Fixed Header Bar */}
        <div className="shrink-0 px-6 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-pill bg-sky-50 text-sky-700 border border-sky-200">
                <Radio className="w-3 h-3 text-sky-600 animate-pulse" />
                Broadcast Informasi Desa
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Buat Pengumuman & Siaran Notifikasi Warga
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Form + Smartphone Preview */}
        <form id="announcement-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-7 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Pengumuman / Berita:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Penyaluran Bansos Beras CBP Tahap 4..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Siaran:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Bansos">Bansos & Bantuan Sosial</option>
                    <option value="Kesehatan">Kesehatan & Posyandu</option>
                    <option value="Lingkungan">Lingkungan & Gotong Royong</option>
                    <option value="Darurat">Peringatan Darurat / Bencana</option>
                    <option value="Pemerintahan">Agenda Pemerintahan Desa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Segmentasi:
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="all">Seluruh Warga Desa</option>
                    <option value="dusun">Khusus Per Dusun</option>
                    <option value="rw">Khusus Per RW</option>
                    <option value="rt">Khusus Per RT</option>
                  </select>
                </div>
              </div>

              {targetType !== 'all' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Dusun / Nomor RW / RT Sasaran:
                  </label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Contoh: Dusun Mekar atau RW 02"
                    className="w-full px-3.5 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ringkasan Notifikasi HP (Maks. 140 karakter):
                </label>
                <input
                  type="text"
                  value={summary}
                  maxLength={140}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Pesan pendek yang akan muncul di layar HP warga..."
                  className="w-full px-3.5 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Isi Lengkap Informasi:
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Rincian jadwal, lokasi pengambilan, syarat berkas yang harus dibawa..."
                  required
                  className="w-full p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Urgent Toggle */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Prioritas Siaran Mendesak / Darurat
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Memicu nada notifikasi peringatan di aplikasi mobile warga.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Smartphone Push Notification Live Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                Pratinjau Layar HP Warga
              </span>

              {/* Smartphone Mockup */}
              <div className="w-60 bg-slate-900 rounded-[32px] p-2.5 shadow-xl border-4 border-slate-800 relative">
                {/* Camera notch */}
                <div className="w-16 h-2.5 bg-black rounded-full mx-auto mb-2"></div>

                {/* Screen Area */}
                <div className="bg-slate-950/90 rounded-[24px] p-3 text-white min-h-[300px] flex flex-col justify-between">
                  <div>
                    {/* Lockscreen clock */}
                    <div className="text-center pt-2 pb-4">
                      <div className="text-2xl font-light tracking-tight">10:20</div>
                      <div className="text-[9px] text-slate-400 font-medium">Sabtu, 19 September</div>
                    </div>

                    {/* Push Notification Banner */}
                    <div className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-md transition-all ${
                      isUrgent
                        ? 'bg-rose-950/80 border-rose-500/50 text-rose-100'
                        : 'bg-slate-900/90 border-slate-700 text-slate-100'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white">
                            D
                          </div>
                          <span className="text-[10px] font-bold tracking-tight">DEKATI • {category}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">baru saja</span>
                      </div>

                      <div className="text-[11px] font-bold leading-tight line-clamp-2">
                        {title || 'Judul pengumuman desa...'}
                      </div>
                      <div className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                        {summary || title || 'Ringkasan informasi notifikasi...'}
                      </div>

                      <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-emerald-400 font-medium">
                        <span>{targetType === 'all' ? 'Semua Warga' : `Khusus ${targetValue || targetType}`}</span>
                        <span>Ketuk buka</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom home bar */}
                  <div className="w-20 h-1 bg-white/40 rounded-full mx-auto mb-1"></div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Footer Bar */}
        <div className="shrink-0 px-6 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            form="announcement-form"
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim Siaran ke Warga
          </button>
        </div>

      </div>
    </div>
  );
};
