// src/components/NikPinModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Settings,
  ArrowRight,
  Info
} from 'lucide-react';
import { nikPrivacyService } from '../services/nikPrivacyService';

interface NikPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rememberSession: boolean) => void;
  targetNik?: string | null;
}

export const NikPinModal: React.FC<NikPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetNik,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // States untuk ubah PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changePinMessage, setChangePinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage(null);
      setIsChangingPin(false);
      setChangePinMessage(null);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!pin.trim()) {
      setErrorMessage('Silakan masukkan PIN keamanan.');
      return;
    }

    const isValid = nikPrivacyService.verifyPin(pin);
    if (isValid) {
      if (rememberSession) {
        nikPrivacyService.setSessionActive(15);
      }
      onSuccess(rememberSession);
      onClose();
    } else {
      setErrorMessage('PIN yang Anda masukkan salah. Default PIN adalah 123456.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!oldPin || !newPin || !confirmPin) {
      setChangePinMessage({ text: 'Mohon isi seluruh kolom PIN.', isError: true });
      return;
    }

    if (newPin !== confirmPin) {
      setChangePinMessage({ text: 'Konfirmasi PIN baru tidak sesuai.', isError: true });
      return;
    }

    const res = nikPrivacyService.setPin(oldPin, newPin);
    if (res.success) {
      setChangePinMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setIsChangingPin(false);
        setPin(newPin);
        setChangePinMessage(null);
      }, 1200);
    } else {
      setChangePinMessage({ text: res.message, isError: true });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Verifikasi PIN NIK</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Privasi PDP
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isChangingPin
                  ? 'Perbarui PIN keamanan akses data kependudukan'
                  : 'Masukkan PIN untuk melihat NIK kependudukan lengkap'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isChangingPin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {targetNik && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Pratinjau Terproteksi:</span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider">
                    {nikPrivacyService.maskNik(targetNik)}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>PIN Keamanan (Otoritas Web)</span>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(true)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Ubah PIN</span>
                  </button>
                </label>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/[^0-9]/g, ''));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan 6-digit PIN..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-center text-lg tracking-[0.3em] font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    title={showPin ? 'Sembunyikan karakter' : 'Tampilkan karakter'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>

              {/* Sesi & Default PIN Note */}
              <div className="pt-2 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Buka semua NIK selama sesi aktif (15 menit)</span>
                </label>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Informasi:</span> PIN bawaan standar adalah{' '}
                    <code className="bg-emerald-200/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-950">
                      123456
                    </code>
                    . Anda dapat mengubahnya kapan saja melalui tombol "Ubah PIN" di atas.
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Buka NIK Lengkap</span>
                </button>
              </div>
            </form>
          ) : (
            /* Mode Ganti PIN */
            <form onSubmit={handleChangePinSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">PIN Lama:</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Masukkan PIN lama (default: 123456)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">PIN Baru (4-8 Digit Angka):</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Contoh: 889900"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Konfirmasi PIN Baru:</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ketik ulang PIN baru..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {changePinMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    changePinMessage.isError
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {changePinMessage.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{changePinMessage.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Kembali
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    Simpan PIN Baru
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
