// src/views/LandingPageView.tsx
import React, { useState } from 'react';
import { LetterRequest } from '../types';
import {
  initialAnnouncements,
  initialApbdes,
  initialEmergencyContacts,
  initialLetterRequests,
  initialVillageEvents,
  initialVillageProfile
} from '../data/mockData';
import { QrVerifyModal } from '../components/QrVerifyModal';
import { MobileDownloadModal } from '../components/MobileDownloadModal';
import {
  LandingNavbar,
  HeroSection,
  VillageProfileSection,
  LetterTrackingSection,
  PlatformShowcaseSection,
  ApbdesPublicSection,
  AnnouncementsPublicSection,
  EventsPublicSection,
  EmergencyContactSection,
  FaqSection,
  LandingFooter
} from './landing';

interface LandingPageViewProps {
  onEnterAdmin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterAdmin }) => {
  // Landing page 100% memakai data mock lokal (Desa Sukamaju).
  // Data publik ini sengaja TIDAK disinkronkan dari Supabase agar identitas yang
  // tampil ke publik selalu konsisten dan tidak terimbas data server demo.
  const profile = initialVillageProfile;
  const letters = initialLetterRequests;
  const announcements = initialAnnouncements;
  const apbdes = initialApbdes;
  const emergencyContacts = initialEmergencyContacts;
  const villageEvents = initialVillageEvents;

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
        profile={profile}
      />

      {/* 3. Profil Desa / Kelurahan (Identitas & Visi Misi) */}
      <VillageProfileSection profile={profile} />

      {/* 4. Interactive Letter Tracking Widget */}
      <LetterTrackingSection
        letters={letters}
        profile={profile}
        onOpenQrModal={(letter) => setSelectedQrLetter(letter)}
      />

      {/* 5. Dual Platform Showcase (Admin vs Warga) */}
      <PlatformShowcaseSection
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 6. Open APBDes Transparency Section */}
      <ApbdesPublicSection
        apbdes={apbdes}
        profile={profile}
      />

      {/* 7. Village Broadcast Announcements */}
      <AnnouncementsPublicSection
        announcements={announcements}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 8. Agenda Kegiatan Desa / Kelurahan */}
      <EventsPublicSection events={villageEvents} />

      {/* 9. Layanan Kontak Darurat 24 Jam */}
      <EmergencyContactSection contacts={emergencyContacts} />

      {/* 10. FAQ & Regulations */}
      <FaqSection profile={profile} />

      {/* 11. Official Village Footer */}
      <LandingFooter
        profile={profile}
        onEnterAdmin={onEnterAdmin}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 12. Floating / Action Modals */}
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
