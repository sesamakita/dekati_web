// src/services/dataService.ts
import {
  Citizen,
  LetterRequest,
  Complaint,
  Announcement,
  ApbdesData,
  VillageProfile,
  LetterStatus,
  ComplaintStatus
} from '../types';
import {
  initialCitizens,
  initialLetterRequests,
  initialComplaints,
  initialAnnouncements,
  initialApbdes,
  initialVillageProfile
} from '../data/mockData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  CITIZENS: 'dekati_citizens_v1',
  LETTERS: 'dekati_letters_v1',
  COMPLAINTS: 'dekati_complaints_v1',
  ANNOUNCEMENTS: 'dekati_announcements_v1',
  APBDES: 'dekati_apbdes_v1',
  PROFILE: 'dekati_profile_v1',
  ACTIVE_ROLE: 'dekati_active_role_v1'
};

type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();
  public isSupabaseConnected: boolean = false;

  constructor() {
    this.syncFromSupabase();
    this.initRealtime();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Helper storage
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Sync data from Supabase
  async syncFromSupabase() {
    try {
      // 1. Check citizens
      const { data: citData, error: citErr } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false });

      if (!citErr && citData && citData.length > 0) {
        this.setStorage(STORAGE_KEYS.CITIZENS, citData);
        this.isSupabaseConnected = true;
      }

      // 2. Check letters
      const { data: letData, error: letErr } = await supabase
        .from('letter_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!letErr && letData && letData.length > 0) {
        this.setStorage(STORAGE_KEYS.LETTERS, letData);
        this.isSupabaseConnected = true;
      }

      // 3. Check complaints
      const { data: cmpData, error: cmpErr } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!cmpErr && cmpData && cmpData.length > 0) {
        this.setStorage(STORAGE_KEYS.COMPLAINTS, cmpData);
        this.isSupabaseConnected = true;
      }

      // 4. Check announcements
      const { data: ancData, error: ancErr } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ancErr && ancData && ancData.length > 0) {
        this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, ancData);
        this.isSupabaseConnected = true;
      }

      // 5. Check village profile
      const { data: profData, error: profErr } = await supabase
        .from('village_profiles')
        .select('*')
        .limit(1)
        .single();

      if (!profErr && profData) {
        this.setStorage(STORAGE_KEYS.PROFILE, profData);
        this.isSupabaseConnected = true;
      }

      this.notify();
    } catch (err) {
      console.warn('[Dekati DataService] Supabase sync fallback to offline local store.', err);
    }
  }

  // Subscribe to Realtime Supabase Channel
  private initRealtime() {
    try {
      supabase
        .channel('dekati-realtime-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'letter_requests' },
          (payload) => {
            const currentLetters = this.getLetters();
            if (payload.eventType === 'INSERT') {
              const newLetter = payload.new as LetterRequest;
              if (!currentLetters.find((l) => l.id === newLetter.id)) {
                this.setStorage(STORAGE_KEYS.LETTERS, [newLetter, ...currentLetters]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as LetterRequest;
              const idx = currentLetters.findIndex((l) => l.id === updated.id);
              if (idx !== -1) {
                currentLetters[idx] = updated;
                this.setStorage(STORAGE_KEYS.LETTERS, [...currentLetters]);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'complaints' },
          (payload) => {
            const currentComplaints = this.getComplaints();
            if (payload.eventType === 'INSERT') {
              const newCmp = payload.new as Complaint;
              if (!currentComplaints.find((c) => c.id === newCmp.id)) {
                this.setStorage(STORAGE_KEYS.COMPLAINTS, [newCmp, ...currentComplaints]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Complaint;
              const idx = currentComplaints.findIndex((c) => c.id === updated.id);
              if (idx !== -1) {
                currentComplaints[idx] = updated;
                this.setStorage(STORAGE_KEYS.COMPLAINTS, [...currentComplaints]);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'citizens' },
          (payload) => {
            const currentCitizens = this.getCitizens();
            if (payload.eventType === 'INSERT') {
              const newCit = payload.new as Citizen;
              if (!currentCitizens.find((c) => c.id === newCit.id)) {
                this.setStorage(STORAGE_KEYS.CITIZENS, [newCit, ...currentCitizens]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Citizen;
              const idx = currentCitizens.findIndex((c) => c.id === updated.id);
              if (idx !== -1) {
                currentCitizens[idx] = updated;
                this.setStorage(STORAGE_KEYS.CITIZENS, [...currentCitizens]);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          (payload) => {
            const currentAnnouncements = this.getAnnouncements();
            if (payload.eventType === 'INSERT') {
              const newAnc = payload.new as Announcement;
              if (!currentAnnouncements.find((a) => a.id === newAnc.id)) {
                this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, [newAnc, ...currentAnnouncements]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Announcement;
              const idx = currentAnnouncements.findIndex((a) => a.id === updated.id);
              if (idx !== -1) {
                currentAnnouncements[idx] = updated;
                this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, [...currentAnnouncements]);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isSupabaseConnected = true;
            this.notify();
          }
        });
    } catch (e) {
      console.warn('[Dekati DataService] Realtime channel setup skipped.', e);
    }
  }

  // Active Role (Pamong Desa / Kades)
  getActiveRole(): 'admin_desa' | 'kades' {
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as 'admin_desa' | 'kades') || 'admin_desa';
  }

  setActiveRole(role: 'admin_desa' | 'kades') {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    this.notify();
  }

  // Village Profile
  getVillageProfile(): VillageProfile {
    return this.getStorage(STORAGE_KEYS.PROFILE, initialVillageProfile);
  }

  async updateVillageProfile(profile: Partial<VillageProfile>) {
    const current = this.getVillageProfile();
    const updated = { ...current, ...profile };
    this.setStorage(STORAGE_KEYS.PROFILE, updated);

    // Sync to Supabase
    try {
      await supabase
        .from('village_profiles')
        .upsert({ id: 1, ...updated, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn('Supabase profile update offline', e);
    }

    return updated;
  }

  // Letters
  getLetters(): LetterRequest[] {
    return this.getStorage(STORAGE_KEYS.LETTERS, initialLetterRequests);
  }

  getLetterById(id: string): LetterRequest | undefined {
    return this.getLetters().find((l) => l.id === id);
  }

  async updateLetterStatus(
    id: string,
    status: LetterStatus,
    extra?: {
      rejection_reason?: string;
      official_number?: string;
      signed_by_name?: string;
      notes?: string;
    }
  ): Promise<LetterRequest | undefined> {
    const letters = this.getLetters();
    const index = letters.findIndex((l) => l.id === id);
    if (index === -1) return undefined;

    const letter = { ...letters[index] };
    letter.status = status;
    letter.updated_at = new Date().toLocaleString('id-ID');

    if (extra?.rejection_reason) {
      letter.rejection_reason = extra.rejection_reason;
    }

    if (extra?.official_number) {
      letter.letter_official_number = extra.official_number;
    }

    // Auto generate QR token when approved or signed
    if (status === 'signed' || status === 'completed') {
      if (!letter.qr_verification_token) {
        letter.qr_verification_token = `valid-${Math.random().toString(36).substring(2, 8)}-${letter.letter_name.toLowerCase().replace(/[^a-z0-9]/g, '')}-2026`;
        letter.qr_verification_url = `https://dekati.sukamaju.desa.id/verify/${letter.qr_verification_token}`;
      }
      letter.signed_by_name = extra?.signed_by_name || 'Drs. H. Mulyadi Kartodirdjo, M.Si (Kepala Desa)';
      letter.signed_at = new Date().toLocaleString('id-ID');
    }

    // Timeline updates
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    if (!letter.timeline) letter.timeline = [];

    if (status === 'in_verification') {
      letter.timeline.push({
        title: 'Berkas Sedang Diverifikasi Operator',
        time: nowTime,
        done: true,
        actor: 'Operator Pelayanan'
      });
    } else if (status === 'approved') {
      letter.timeline.push({
        title: `Penerbitan No. Registrasi Desa (${letter.letter_official_number || '470/...'})`,
        time: nowTime,
        done: true,
        actor: 'Sekretariat Desa'
      });
    } else if (status === 'signed') {
      letter.timeline.push({
        title: 'Tanda Tangan Elektronik QR Kades Disahkan',
        time: nowTime,
        done: true,
        actor: letter.signed_by_name
      });
      letter.timeline.push({
        title: 'Surat Selesai & Dokumen Digital Siap Diunduh',
        time: nowTime,
        done: true
      });
    } else if (status === 'rejected') {
      letter.timeline.push({
        title: `Pengajuan Ditolak: ${extra?.rejection_reason || 'Syarat tidak lengkap'}`,
        time: nowTime,
        done: true,
        actor: 'Pemeriksa Berkas'
      });
    }

    letters[index] = letter;
    this.setStorage(STORAGE_KEYS.LETTERS, letters);

    // Sync to Supabase
    try {
      await supabase
        .from('letter_requests')
        .update({
          status: letter.status,
          letter_official_number: letter.letter_official_number,
          qr_verification_token: letter.qr_verification_token,
          qr_verification_url: letter.qr_verification_url,
          signed_by_name: letter.signed_by_name,
          signed_at: letter.signed_at ? new Date().toISOString() : null,
          rejection_reason: letter.rejection_reason,
          timeline: letter.timeline,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase letter update offline', e);
    }

    return letter;
  }

  // Complaints
  getComplaints(): Complaint[] {
    return this.getStorage(STORAGE_KEYS.COMPLAINTS, initialComplaints);
  }

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    data?: {
      assigned_department?: string;
      assigned_officer?: string;
      resolution_notes?: string;
      resolution_proof?: string;
    }
  ): Promise<Complaint | undefined> {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const complaint = { ...complaints[index], ...data, status };
    if (status === 'resolved') {
      complaint.resolved_at = new Date().toLocaleString('id-ID');
    }

    complaints[index] = complaint;
    this.setStorage(STORAGE_KEYS.COMPLAINTS, complaints);

    // Sync to Supabase
    try {
      await supabase
        .from('complaints')
        .update({
          status: complaint.status,
          assigned_department: complaint.assigned_department,
          assigned_officer: complaint.assigned_officer,
          resolution_notes: complaint.resolution_notes,
          resolution_proof: complaint.resolution_proof,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase complaint update offline', e);
    }

    return complaint;
  }

  // Citizens
  getCitizens(): Citizen[] {
    return this.getStorage(STORAGE_KEYS.CITIZENS, initialCitizens);
  }

  async verifyCitizen(id: string, approve: boolean, notes?: string): Promise<Citizen | undefined> {
    const citizens = this.getCitizens();
    const index = citizens.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const citizen = { ...citizens[index] };
    if (approve) {
      citizen.is_verified = true;
      citizen.verified_at = new Date().toLocaleString('id-ID');
      citizen.verified_by = 'Operator Verifikasi Desa';
    } else {
      citizen.is_verified = false;
      citizen.verified_at = `Ditolak: ${notes || 'Dokumen KTP/KK buram'}`;
    }

    citizens[index] = citizen;
    this.setStorage(STORAGE_KEYS.CITIZENS, citizens);

    // Sync to Supabase
    try {
      await supabase
        .from('citizens')
        .update({
          is_verified: citizen.is_verified,
          verified_at: approve ? new Date().toISOString() : null,
          verified_by: citizen.verified_by
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase citizen verification offline', e);
    }

    return citizen;
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.getStorage(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
  }

  async createAnnouncement(payload: Omit<Announcement, 'id' | 'views' | 'date'>): Promise<Announcement> {
    const announcements = this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...payload,
      id: `anc-${Date.now()}`,
      views: 0,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const updated = [newAnnouncement, ...announcements];
    this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, updated);

    // Sync to Supabase
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          category: newAnnouncement.category,
          summary: newAnnouncement.summary,
          content: newAnnouncement.content,
          date: newAnnouncement.date,
          is_urgent: newAnnouncement.is_urgent,
          author: newAnnouncement.author,
          views: 0,
          target_type: newAnnouncement.target_type,
          target_value: newAnnouncement.target_value
        })
        .select('*')
        .single();

      if (!error && data) {
        newAnnouncement.id = data.id;
        const currentList = this.getAnnouncements();
        const foundIdx = currentList.findIndex(a => a.title === newAnnouncement.title);
        if (foundIdx !== -1) {
          currentList[foundIdx].id = data.id;
          this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, currentList);
        }
      }
    } catch (e) {
      console.warn('Supabase announcement insert offline', e);
    }

    return newAnnouncement;
  }

  // APBDes
  getApbdes(): ApbdesData {
    return this.getStorage(STORAGE_KEYS.APBDES, initialApbdes);
  }

  async updateApbdesItem(
    type: 'pendapatan' | 'belanja',
    accountCode: string,
    realizedAmount: number
  ) {
    const apbdes = this.getApbdes();
    const target = apbdes[type];
    const item = target.items.find((i) => i.account_code === accountCode);
    if (item) {
      item.realized_amount = realizedAmount;
      item.percentage = Number(((realizedAmount / item.budget_amount) * 100).toFixed(1));
    }

    target.total_realized = target.items.reduce((sum, i) => sum + i.realized_amount, 0);
    const totalBudget = apbdes.pendapatan.total_budget + apbdes.belanja.total_budget;
    const totalRealized = apbdes.pendapatan.total_realized + apbdes.belanja.total_realized;
    apbdes.realisasi_persen = Number(((totalRealized / totalBudget) * 100).toFixed(1));

    this.setStorage(STORAGE_KEYS.APBDES, apbdes);

    // Sync to Supabase
    try {
      await supabase
        .from('apbdes_items')
        .update({
          realized_amount: realizedAmount,
          percentage: item?.percentage || 0
        })
        .eq('account_code', accountCode);
    } catch (e) {
      console.warn('Supabase apbdes update offline', e);
    }

    return apbdes;
  }

  // Reset to initial mock data
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.CITIZENS);
    localStorage.removeItem(STORAGE_KEYS.LETTERS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.APBDES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    this.syncFromSupabase();
    this.notify();
  }
}

export const dataService = new DataService();
