// src/views/LandingPageView.tsx
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { LetterRequest } from '../types';
import { QrVerifyModal } from '../components/QrVerifyModal';
import { MobileDownloadModal } from '../components/MobileDownloadModal';
import {
  LandingNavbar,
  HeroSection,
  LetterTrackingSection,
  PlatformShowcaseSection,
  ApbdesPublicSection,
  AnnouncementsPublicSection,
  FaqSection,
  LandingFooter
} from './landing';

interface LandingPageViewProps {
  onEnterAdmin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterAdmin }) => {
  const { letters, announcements, apbdes, profile } = useData();

  // Modals state
  const [selectedQrLetter, setSelectedQrLetter] = useState<LetterRequest | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 2. Hero Section */}
      <HeroSection
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 3. Interactive Letter Tracking Widget */}
      <LetterTrackingSection
        letters={letters}
        profile={profile}
        onOpenQrModal={(letter) => setSelectedQrLetter(letter)}
      />

      {/* 4. Dual Platform Showcase (Admin vs Warga) */}
      <PlatformShowcaseSection
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 5. Open APBDes Transparency Section */}
      <ApbdesPublicSection
        apbdes={apbdes}
        profile={profile}
      />

      {/* 6. Village Broadcast Announcements */}
      <AnnouncementsPublicSection
        announcements={announcements}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 7. FAQ & Regulations */}
      <FaqSection profile={profile} />

      {/* 8. Official Village Footer */}
      <LandingFooter
        profile={profile}
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 9. Floating / Action Modals */}
      {selectedQrLetter && (
        <QrVerifyModal
          letter={selectedQrLetter}
          onClose={() => setSelectedQrLetter(null)}
        />
      )}

      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default LandingPageView;
