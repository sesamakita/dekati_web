// src/context/NikPrivacyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { nikPrivacyService } from '../services/nikPrivacyService';
import { NikPinModal } from '../components/NikPinModal';

interface NikPrivacyContextType {
  isNikUnlocked: (nik?: string | null) => boolean;
  requestUnlock: (nik?: string | null) => void;
  lockNik: (nik: string) => void;
  lockAll: () => void;
  isSessionUnlocked: boolean;
}

const NikPrivacyContext = createContext<NikPrivacyContextType | undefined>(undefined);

export const NikPrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedNiks, setUnlockedNiks] = useState<Set<string>>(new Set());
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(() =>
    nikPrivacyService.isSessionActive()
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetNikForModal, setTargetNikForModal] = useState<string | null>(null);

  // Periksa masa berlaku sesi secara berkala
  useEffect(() => {
    const interval = setInterval(() => {
      const active = nikPrivacyService.isSessionActive();
      if (!active && isSessionUnlocked) {
        setIsSessionUnlocked(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSessionUnlocked]);

  const isNikUnlocked = useCallback(
    (nik?: string | null): boolean => {
      if (!nik) return false;
      if (isSessionUnlocked && nikPrivacyService.isSessionActive()) {
        return true;
      }
      return unlockedNiks.has(nik.trim());
    },
    [isSessionUnlocked, unlockedNiks]
  );

  const requestUnlock = useCallback(
    (nik?: string | null) => {
      if (nik && isNikUnlocked(nik)) {
        // Jika sudah terbuka, abaikan atau izinkan toggle
        return;
      }

      setTargetNikForModal(nik || null);
      setIsModalOpen(true);
    },
    [isNikUnlocked]
  );

  const handleModalSuccess = (rememberSession: boolean) => {
    if (rememberSession) {
      setIsSessionUnlocked(true);
    }
    if (targetNikForModal) {
      setUnlockedNiks((prev) => new Set([...prev, targetNikForModal.trim()]));
    }
  };

  const lockNik = useCallback((nik: string) => {
    const clean = nik.trim();
    setUnlockedNiks((prev) => {
      const next = new Set(prev);
      next.delete(clean);
      return next;
    });
  }, []);

  const lockAll = useCallback(() => {
    nikPrivacyService.clearSession();
    setIsSessionUnlocked(false);
    setUnlockedNiks(new Set());
  }, []);

  return (
    <NikPrivacyContext.Provider
      value={{
        isNikUnlocked,
        requestUnlock,
        lockNik,
        lockAll,
        isSessionUnlocked,
      }}
    >
      {children}

      <NikPinModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetNikForModal(null);
        }}
        onSuccess={handleModalSuccess}
        targetNik={targetNikForModal}
      />
    </NikPrivacyContext.Provider>
  );
};

export const useNikPrivacy = (): NikPrivacyContextType => {
  const context = useContext(NikPrivacyContext);
  if (!context) {
    throw new Error('useNikPrivacy must be used within a NikPrivacyProvider');
  }
  return context;
};
