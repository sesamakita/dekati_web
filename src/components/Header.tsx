// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bell, 
  ShieldCheck, 
  UserCog, 
  CheckCircle2, 
  Search,
  Sparkles,
  Globe,
  LogOut
} from 'lucide-react';
import { useData } from '../hooks/useData';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenLanding?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, onOpenLanding, onLogout }) => {
  const { profile, activeRole, setActiveRole, letters, complaints, citizens } = useData();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' • ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingLettersCount = letters.filter(
    (l) => l.status === 'submitted' || l.status === 'in_verification'
  ).length;
  const activeComplaintsCount = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'in_progress'
  ).length;
  const pendingCitizensCount = citizens.filter((c) => !c.is_verified).length;
  const totalNotifications = pendingLettersCount + activeComplaintsCount + pendingCitizensCount;

  return (
    <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 transition-all">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Village Identity & Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {profile.name}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Portal Desa
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {profile.district} • {profile.regency}
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIK, Nama Warga, No. Surat, atau Tiket Aduan..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200/80 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Live Clock & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Time indicator */}
          <div className="hidden lg:block text-right pr-2">
            <div className="text-xs font-semibold text-slate-700">{timeStr}</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Aktif & Terhubung
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setActiveRole('admin_desa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'admin_desa'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Akses Operator Pelayanan Desa (Verifikasi Berkas & Disposisi)"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Operator</span>
            </button>
            <button
              onClick={() => setActiveRole('kades')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'kades'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Akses Kepala Desa (Otoritas TTE QR Code & Kebijakan)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kades (TTE)</span>
            </button>
          </div>

          {/* Landing Page Link Button */}
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 transition-all"
              title="Buka Landing Page Publik untuk Warga"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Portal Publik</span>
            </button>
          )}

          {/* Notification Button */}
          <div className="relative">
            <button
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 flex items-center justify-center text-slate-700 transition-colors"
              title={`${totalNotifications} antrean perlu ditindaklanjuti`}
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-all"
              title="Keluar dari Sesi Dashboard Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
