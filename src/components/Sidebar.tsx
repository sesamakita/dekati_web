// src/components/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquareWarning, 
  Users, 
  Radio, 
  PieChart, 
  RotateCcw,
  CheckCircle,
  ChevronRight,
  Globe,
  Calendar
} from 'lucide-react';
import { useData } from '../hooks/useData';

export type NavTab = 'dashboard' | 'letters' | 'complaints' | 'citizens' | 'announcements' | 'events' | 'apbdes';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onOpenLanding }) => {
  const { letters, complaints, citizens, resetAllData } = useData();

  const pendingLettersCount = letters.filter(
    (l) => l.status === 'submitted' || l.status === 'in_verification'
  ).length;
  const activeComplaintsCount = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'in_progress'
  ).length;
  const unverifiedCitizensCount = citizens.filter((c) => !c.is_verified).length;

  const navItems: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Bento',
      description: 'Ringkasan & Metrik Desa',
      icon: LayoutDashboard,
    },
    {
      id: 'letters',
      label: 'Layanan E-Surat',
      description: 'Verifikasi & TTE QR Surat',
      icon: FileText,
      badge: pendingLettersCount,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'complaints',
      label: 'Aduan Warga',
      description: 'Helpdesk & Disposisi Lapangan',
      icon: MessageSquareWarning,
      badge: activeComplaintsCount,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'citizens',
      label: 'Kependudukan',
      description: 'Buku Induk & Verifikasi Akun',
      icon: Users,
      badge: unverifiedCitizensCount,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'announcements',
      label: 'Siaran & Berita',
      description: 'Broadcast Target Dusun/RT',
      icon: Radio,
    },
    {
      id: 'events',
      label: 'Agenda & Layanan Siaga',
      description: 'Jadwal Musdes & Nomor Darurat',
      icon: Calendar,
    },
    {
      id: 'apbdes',
      label: 'APBDes & Profil',
      description: 'Transparansi Dana & Visi',
      icon: PieChart,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 h-full overflow-y-auto select-none">
      {/* Navigation List */}
      <div className="space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Utama Portal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/90 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-sm ${isActive ? 'text-emerald-950' : 'text-slate-800'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight">
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Badge if available */}
              {item.badge !== undefined && item.badge > 0 ? (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info Card & Controls */}
      <div className="pt-4 mt-6 border-t border-slate-200/80 space-y-3">
        {/* Connection status */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700">Konektivitas Sistem</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <CheckCircle className="w-3 h-3" />
              Tersinkron
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Sinkron 1:1 dengan basis data PostgreSQL & mobile app warga Dekati.
          </p>
        </div>

        {/* Return to Public Landing Page */}
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-100 rounded-xl transition-all border border-slate-200/80"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Halaman Publik / Landing</span>
          </button>
        )}

        {/* Reset Mock Data button */}
        <button
          onClick={() => {
            if (window.confirm('Reset data simulasi ke awal?')) {
              resetAllData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Data Demo
        </button>

        <div className="text-center text-[10px] text-slate-400 font-medium">
          Dekati Web Admin v1.0.0 • Pemerintahan Desa
        </div>
      </div>
    </aside>
  );
};
