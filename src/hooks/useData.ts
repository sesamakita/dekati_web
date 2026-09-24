// src/hooks/useData.ts
import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export function useData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    letters: dataService.getLetters(),
    complaints: dataService.getComplaints(),
    citizens: dataService.getCitizens(),
    announcements: dataService.getAnnouncements(),
    apbdes: dataService.getApbdes(),
    profile: dataService.getVillageProfile(),
    emergencyContacts: dataService.getEmergencyContacts(),
    villageEvents: dataService.getVillageEvents(),
    activeRole: dataService.getActiveRole(),
    currentOfficial: dataService.getCurrentOfficial(),
    setActiveRole: (role: 'admin_desa' | 'kades') => dataService.setActiveRole(role),
    loginOfficial: dataService.loginOfficial.bind(dataService),
    registerOfficial: dataService.registerOfficial.bind(dataService),
    logoutOfficial: dataService.logoutOfficial.bind(dataService),
    updateLetterStatus: dataService.updateLetterStatus.bind(dataService),
    updateComplaintStatus: dataService.updateComplaintStatus.bind(dataService),
    verifyCitizen: dataService.verifyCitizen.bind(dataService),
    createAnnouncement: dataService.createAnnouncement.bind(dataService),
    updateApbdesItem: dataService.updateApbdesItem.bind(dataService),
    createEmergencyContact: dataService.createEmergencyContact.bind(dataService),
    updateEmergencyContact: dataService.updateEmergencyContact.bind(dataService),
    deleteEmergencyContact: dataService.deleteEmergencyContact.bind(dataService),
    createVillageEvent: dataService.createVillageEvent.bind(dataService),
    updateVillageEvent: dataService.updateVillageEvent.bind(dataService),
    deleteVillageEvent: dataService.deleteVillageEvent.bind(dataService),
    updateVillageProfile: dataService.updateVillageProfile.bind(dataService),
    resetAllData: dataService.resetAllData.bind(dataService),
  };
}
