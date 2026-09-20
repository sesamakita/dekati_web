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
    activeRole: dataService.getActiveRole(),
    setActiveRole: (role: 'admin_desa' | 'kades') => dataService.setActiveRole(role),
    updateLetterStatus: dataService.updateLetterStatus.bind(dataService),
    updateComplaintStatus: dataService.updateComplaintStatus.bind(dataService),
    verifyCitizen: dataService.verifyCitizen.bind(dataService),
    createAnnouncement: dataService.createAnnouncement.bind(dataService),
    updateApbdesItem: dataService.updateApbdesItem.bind(dataService),
    updateVillageProfile: dataService.updateVillageProfile.bind(dataService),
    resetAllData: dataService.resetAllData.bind(dataService),
  };
}
