import React, { useEffect, useState } from 'react';
import { Smartphone, ShieldCheck, Menu, X } from 'lucide-react';
import { DekatiLogo } from '../../components/DekatiLogo';
import { scrollToSection, scrollToTop } from '../../utils/scrollUtils';

interface LandingNavbarProps {
  onEnterAdmin: () => void;
  onOpenDownloadModal: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onEnterAdmin,
  onOpenDownloadModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Tutup menu otomatis saat layar membesar ke ukuran desktop (>= lg)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigasi utama (desktop) — prioritas agar header tetap lega dan fungsional
  const navItems: Array<{ href: string; label: string }> = [
    { href: '#hero', label: 'Beranda' },
    { href: '#profil-desa', label: 'Profil Desa' },
    { href: '#organisasi', label: 'Aparatur Desa' },
    { href: '#lacak-surat', label: 'Lacak Surat' },
    { href: '#transparansi', label: 'APBDes' },
    { href: '#darurat', label: 'Darurat' },
  ];

  // Navigasi lengkap (mobile/tablet) — semua anchor tetap bisa diakses
  const mobileNavItems: Array<{ href: string; label: string }> = [
    ...navItems,
    { href: '#dua-platform', label: 'Fitur Pamong & Warga' },
    { href: '#pengumuman', label: 'Siaran Desa' },
    { href: '#agenda', label: 'Agenda Kegiatan' },
    { href: '#faq', label: 'Tanya Jawab' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Portal Identity */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl py-1 transition-transform"
          title="Portal Layanan Desa & Kelurahan Dekati"
        >
          <div className="flex items-center">
            <DekatiLogo
              variant="brand"
              className="h-9 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="hidden sm:flex flex-col border-l border-slate-200/90 pl-3.5 py-0.5 select-none justify-center">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">
              Desa &amp; Kelurahan
            </span>
            <span className="text-[10.5px] font-medium text-emerald-700 tracking-tight leading-none mt-1">
              semakin dekat di hati warga
            </span>
          </div>
        </a>

        {/* Navigation Links (Desktop) — ringkas: 5 prioritas utama */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href.slice(1));
              }}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Action CTAs — ringkas: Aplikasi Mobile, Masuk Admin (berlabel di layar besar), Hamburger */}
        <div className="flex items-center gap-2.5">
          {/* Buka Mobile App Modal */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={onOpenDownloadModal}
              aria-label="Aplikasi Mobile Warga"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 transition-all shadow-xs hover:scale-105 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
              Aplikasi Mobile Warga
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>

          {/* MASUK DASHBOARD ADMIN DESA / LURAH — berlabel mulai layar besar */}
          <div className="relative group/tooltip inline-block">
            <button
              type="button"
              onClick={onEnterAdmin}
              aria-label="Masuk Portal Admin Desa"
              className="h-10 inline-flex items-center gap-2 rounded-xl px-2.5 lg:px-4 text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all hover:scale-[1.03] active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden lg:inline text-sm font-semibold">Masuk Admin</span>
            </button>
            {/* Tooltip hanya untuk layar < lg saat tombol masih ikon saja */}
            <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mt-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md pointer-events-none opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0.5 transition-all duration-200 whitespace-nowrap z-50 border border-white/10 lg:hidden">
              Masuk Portal Admin Desa
              <div className="absolute bottom-full right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto -mb-px border-4 border-transparent border-b-slate-950"></div>
            </div>
          </div>

          {/* Hamburger Menu (Mobile & Tablet) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            aria-expanded={isMenuOpen}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/70 transition-all shadow-xs hover:scale-105 active:scale-95"
          >
            {isMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation Panel — semua anchor tetap tersedia */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid">
            {mobileNavItems.map((item, idx) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  scrollToSection(item.href.slice(1));
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  idx === 0 ? 'text-emerald-700' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-100 px-3">
              <p className="text-[11px] text-slate-400">
                Navigasi lengkap juga tersedia di bagian bawah halaman (footer).
              </p>
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
};
