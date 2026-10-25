// src/components/MaskedNik.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useNikPrivacy } from '../context/NikPrivacyContext';
import { nikPrivacyService } from '../services/nikPrivacyService';

interface MaskedNikProps {
  nik?: string | null;
  className?: string;
  showCopy?: boolean;
  alwaysShow?: boolean;
}

export const MaskedNik: React.FC<MaskedNikProps> = ({
  nik,
  className = '',
  showCopy = false,
  alwaysShow = false,
}) => {
  const { isNikUnlocked, requestUnlock, lockNik } = useNikPrivacy();
  const [copied, setCopied] = useState(false);

  if (!nik) {
    return <span className={`text-slate-400 font-mono ${className}`}>-</span>;
  }

  const isRevealed = alwaysShow || isNikUnlocked(nik);
  const displayText = isRevealed ? nik : nikPrivacyService.maskNik(nik);

  const handleToggleEye = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRevealed) {
      lockNik(nik);
    } else {
      requestUnlock(nik);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Salin nomor NIK (asli jika terbuka, atau yang tertera)
    navigator.clipboard.writeText(nik);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle select-all font-mono font-medium ${className}`}
    >
      <span
        className={`tracking-wider ${
          isRevealed ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'
        }`}
        title={isRevealed ? 'NIK Terbuka' : 'NIK Terproteksi (Klik icon mata untuk membuka)'}
      >
        {displayText}
      </span>

      {/* Tombol Icon Mata (Reveal / Hide) */}
      <button
        type="button"
        onClick={handleToggleEye}
        className={`p-1 rounded-lg transition-all shrink-0 cursor-pointer ${
          isRevealed
            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'
            : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
        }`}
        title={
          isRevealed
            ? 'Sembunyikan NIK'
            : 'Buka NIK Lengkap (Verifikasi PIN)'
        }
        aria-label={isRevealed ? 'Sembunyikan NIK' : 'Buka NIK Lengkap'}
      >
        {isRevealed ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Opsi Copy Cepat */}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={copied ? 'Tersalin!' : 'Salin NIK'}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </span>
  );
};
