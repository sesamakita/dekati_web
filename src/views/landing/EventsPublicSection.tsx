// src/views/landing/EventsPublicSection.tsx
import React from 'react';
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react';
import { VillageEvent } from '../../types';

interface EventsPublicSectionProps {
  events: VillageEvent[];
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

function formatEventDate(raw: string): { day: string; month: string; full: string } {
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.split('-').map((p) => Number(p));
    const month = MONTHS_ID[(m || 1) - 1] || '';
    return { day: String(d || raw), month, full: `${d} ${month} ${y}` };
  }
  const parts = raw.split(' ');
  return { day: parts[0] || '', month: parts[1] || '', full: raw };
}

export const EventsPublicSection: React.FC<EventsPublicSectionProps> = ({ events }) => {
  const activeEvents = events.filter((e) => e.is_active !== false);

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <section id="agenda" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
            <CalendarDays className="w-3.5 h-3.5" />
            Agenda Kegiatan Terdekat
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Jadwal Kegiatan di Balai Desa &amp; Lapangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pantau kegiatan terdekat dari pemerintah desa, kader, dan kelompok masyarakat —
            semua terjadwal dan terbuka untuk warga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeEvents.map((event) => {
            const dateBadge = formatEventDate(event.event_date);
            return (
              <div
                key={event.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center shrink-0"
                      title={dateBadge.full}
                    >
                      <span className="text-sm font-black leading-none">{dateBadge.day}</span>
                      <span className="text-[10px] font-bold uppercase leading-none mt-1">
                        {dateBadge.month}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{event.category}</div>
                      {event.event_time && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {event.event_time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{event.title}</h3>

              {event.description && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {event.location}
                  </div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {event.organizer}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
