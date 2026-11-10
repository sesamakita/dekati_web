// src/components/Sidebar.tsx
import React, { useState, useMemo } from 'react';
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
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  Sparkles
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { CustomDialog } from './CustomDialog';
import { AboutAppModal } from './AboutAppModal';
import { getPermittedTabs, getRoleDisplayName } from '../utils/rbac';

export type NavTab = 'dashboard' | 'letters' | 'complaints' | 'citizens' | 'announcements' | 'events' | 'apbdes';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLanding?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  onOpenLanding,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { letters, complaints, citizens, resetAllData, currentOfficial, profile, seedShowcaseData, demoMode } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const permittedTabs = useMemo(() => getPermittedTabs(currentOfficial), [currentOfficial]);

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
      label: 'Dashboard',
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
      label: profile.village_type === 'kelurahan' ? 'Anggaran & Profil' : 'APBDes & Profil',
      description: profile.village_type === 'kelurahan' ? 'Transparansi Anggaran & Profil Kelurahan' : 'Transparansi Dana Desa & Visi',
      icon: PieChart,
    },
  ];

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => permittedTabs.includes(item.id)),
    [navItems, permittedTabs]
  );

  return (
    <aside 
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full overflow-y-auto overflow-x-hidden select-none transition-[width] duration-200 ease-out will-change-[width] ${
        isCollapsed ? 'w-20' : 'w-72'
      } p-3.5`}
    >
      {/* Navigation List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 pb-2 h-8 min-h-[32px] overflow-hidden">
          <div className={`transition-opacity duration-150 overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 flex-1'
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama Portal
            </span>
          </div>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-auto"
              title={isCollapsed ? "Perluas Menu Sidebar" : "Ciutkan Menu Sidebar (Hanya Ikon)"}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Current Active Official Identity Card */}
        {currentOfficial && (
          <div
            title={`${currentOfficial.nama_lengkap} • ${currentOfficial.jabatan || getRoleDisplayName(currentOfficial.role, profile.village_type)}`}
            className={`transition-all mb-2.5 rounded-2xl border ${
              isCollapsed
                ? 'w-12 h-12 mx-auto flex items-center justify-center bg-slate-50 border-slate-200/80 p-0 cursor-help'
                : 'p-2.5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-slate-200/90 flex items-center gap-2.5'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden ring-1 ring-emerald-500/30 shadow-xs">
              {currentOfficial.avatar_url ? (
                <img src={currentOfficial.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                currentOfficial.nama_lengkap.slice(0, 1)
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentOfficial.nama_lengkap}
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 truncate">
                  {currentOfficial.jabatan || getRoleDisplayName(currentOfficial.role, profile.village_type)}
                </div>
              </div>
            )}
          </div>
        )}

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? `${item.label} • ${item.description}` : item.description}
              className={`group relative flex items-center h-12 rounded-2xl transition-all cursor-pointer ${
                isCollapsed
                  ? 'w-12 mx-auto justify-center p-0'
                  : 'w-full px-2.5 text-left'
              } ${
                isActive
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/90 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
              }`}
            >
              {/* Icon Container with fixed width/shrink-0 */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Floating Badge in Collapsed Mode */}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Text & Inline Badge in Expanded Mode (hidden when collapsed so ml-3 doesn't offset icon) */}
              <div
                className={`flex items-center justify-between min-w-0 flex-1 transition-opacity duration-150 overflow-hidden whitespace-nowrap ${
                  isCollapsed ? 'hidden opacity-0 w-0' : 'ml-3 opacity-100'
                }`}
              >
                <span
                  className={`text-sm tracking-tight truncate ${
                    isActive ? 'font-bold text-emerald-950' : 'font-semibold text-slate-800 group-hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </span>

                {item.badge !== undefined && item.badge > 0 ? (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full border shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Info Card & Controls */}
      <div className="pt-3 mt-4 border-t border-slate-200/80 space-y-2">
        {/* Connection status */}
        <div 
          title="Konektivitas Sistem: Tersinkron 1:1 dengan basis data PostgreSQL & mobile app warga Dekati"
          className={`rounded-2xl transition-all overflow-hidden ${
            isCollapsed 
              ? 'w-12 h-12 mx-auto bg-emerald-50 border border-emerald-200/80 flex items-center justify-center relative cursor-help' 
              : 'p-3 bg-slate-50 border border-slate-200/80'
          }`}
        >
          {isCollapsed ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-700">Konektivitas Sistem</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <CheckCircle className="w-3 h-3" />
                  Tersinkron
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                Sinkron 1:1 dengan basis data PostgreSQL & mobile app warga.
              </p>
            </>
          )}
        </div>

        {/* Return to Public Landing Page */}
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            title="Halaman Publik / Landing Portal Desa"
            className={`w-full flex items-center rounded-xl transition-all border border-slate-200/80 cursor-pointer ${
              isCollapsed
                ? 'w-12 h-12 mx-auto justify-center bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 p-0'
                : 'gap-2 py-2 px-3 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-150 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              Halaman Publik / Landing
            </span>
          </button>
        )}

        {/* Tentang Aplikasi */}
        <button
          onClick={() => setShowAboutModal(true)}
          title="Tentang Aplikasi DEKATI (Versi, Pengembang & Paket Berlangganan)"
          className={`w-full flex items-center rounded-xl transition-all border border-slate-200/80 cursor-pointer ${
            isCollapsed
              ? 'w-12 h-12 mx-auto justify-center bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 p-0 shadow-2xs hover:border-emerald-300'
              : 'gap-2 py-2 px-3 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 bg-white shadow-2xs hover:border-emerald-300'
          }`}
        >
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className={`whitespace-nowrap transition-opacity duration-150 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            Tentang Aplikasi
          </span>
        </button>

        {/* Muat Data Contoh Presentasi button */}
        <button
          onClick={() => setShowSeedConfirm(true)}
          title="Muat Data Contoh Presentasi (Isi Data Lengkap)"
          className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
            isCollapsed
              ? 'w-12 h-12 mx-auto justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-0'
              : 'justify-center gap-2 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className={`whitespace-nowrap transition-opacity duration-150 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            Muat Data Presentasi
          </span>
        </button>

        {/* Reset Mock Data button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset Data Simulasi Demo"
          className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
            isCollapsed
              ? 'w-12 h-12 mx-auto justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0'
              : 'justify-center gap-2 py-1.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className={`whitespace-nowrap transition-opacity duration-150 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            Reset Data Demo
          </span>
        </button>

        {/* Footer Version */}
        <div className={`text-center text-[10px] text-slate-400 font-medium transition-opacity duration-150 overflow-hidden whitespace-nowrap ${
          isCollapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 pt-1'
        }`}>
          Dekati Web Admin v1.0.0
        </div>
      </div>

      {/* Confirmation Dialog Reset */}
      <CustomDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        type="warning"
        title="Reset Data Simulasi"
        message="Apakah Anda yakin ingin mengatur ulang data demo simulasi ke kondisi awal? Seluruh perubahan lokal akan dikembalikan."
        confirmText="Ya, Reset Data"
        cancelText="Batal"
        showCancel={true}
        onConfirm={() => resetAllData()}
      />

      {/* Confirmation Dialog Muat Data Presentasi */}
      <CustomDialog
        isOpen={showSeedConfirm}
        onClose={() => setShowSeedConfirm(false)}
        type="info"
        title="Muat Data Contoh Presentasi"
        message={`Apakah Anda ingin memuat paket data simulasi super lengkap (20+ warga, surat TTE, aduan foto, dan grafik APBDes) ke wilayah ${profile.name || 'ini'}? Fitur ini sangat ideal untuk mendemonstrasikan keunggulan sistem ke pimpinan / calon pengguna.`}
        confirmText="Ya, Muat Data Lengkap"
        cancelText="Batal"
        showCancel={true}
        onConfirm={() => seedShowcaseData()}
      />
      {/* Modal Tentang Aplikasi */}
      <AboutAppModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </aside>
  );
};
