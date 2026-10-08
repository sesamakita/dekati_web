import {
  Citizen,
  LetterRequest,
  Complaint,
  Announcement,
  ApbdesData,
  ApbdesItem,
  VillageProfile,
  LetterStatus,
  ComplaintStatus,
  VillageOfficial,
  EmergencyContact,
  VillageEvent
} from '../types';
import {
  initialCitizens,
  initialLetterRequests,
  initialComplaints,
  initialAnnouncements,
  initialApbdes,
  initialVillageProfile,
  initialEmergencyContacts,
  initialVillageEvents
} from '../data/mockData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  CITIZENS: 'dekati_citizens_v1',
  LETTERS: 'dekati_letters_v1',
  COMPLAINTS: 'dekati_complaints_v1',
  ANNOUNCEMENTS: 'dekati_announcements_v1',
  APBDES: 'dekati_apbdes_v1',
  PROFILE: 'dekati_profile_v1',
  ACTIVE_ROLE: 'dekati_active_role_v1',
  CURRENT_OFFICIAL: 'dekati_current_official_v1',
  EMERGENCY_CONTACTS: 'dekati_emergency_contacts_v1',
  VILLAGE_EVENTS: 'dekati_village_events_v1',
  OFFICIALS_LIST: 'dekati_officials_list_v1'
};

export const defaultOfficials: VillageOfficial[] = [];

type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();
  public isSupabaseConnected: boolean = false;
  private cache: Record<string, any> = {};

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
    if (this.cache[key] !== undefined) {
      return this.cache[key];
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        const parsed = data ? JSON.parse(data) : fallback;
        this.cache[key] = parsed;
        return parsed;
      }
    } catch {
      // fallback
    }
    this.cache[key] = fallback;
    return fallback;
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      this.cache[key] = value;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save to storage', e);
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

      if (!citErr && Array.isArray(citData)) {
        this.setStorage(STORAGE_KEYS.CITIZENS, citData);
        this.isSupabaseConnected = true;
      }

      // 2. Check letters
      const { data: letData, error: letErr } = await supabase
        .from('letter_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!letErr && Array.isArray(letData)) {
        this.setStorage(STORAGE_KEYS.LETTERS, letData);
        this.isSupabaseConnected = true;
      }

      // 3. Check complaints
      const { data: cmpData, error: cmpErr } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!cmpErr && Array.isArray(cmpData)) {
        this.setStorage(STORAGE_KEYS.COMPLAINTS, cmpData);
        this.isSupabaseConnected = true;
      }

      // 4. Check announcements
      const { data: ancData, error: ancErr } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ancErr && Array.isArray(ancData)) {
        this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, ancData);
        this.isSupabaseConnected = true;
      }

      // 5. Check village profile
      const currentOfficial = this.getCurrentOfficial();
      let profQuery = supabase.from('village_profiles').select('*');
      if (currentOfficial?.village_code) {
        profQuery = profQuery.eq('code', currentOfficial.village_code);
      }
      const { data: profData, error: profErr } = await profQuery.limit(1).maybeSingle();

      if (!profErr) {
        if (profData) {
          this.setStorage(STORAGE_KEYS.PROFILE, profData);
        } else {
          this.setStorage(STORAGE_KEYS.PROFILE, initialVillageProfile);
        }
        this.isSupabaseConnected = true;
      }

      // 6. Check emergency contacts
      const { data: emgData, error: emgErr } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('order_index', { ascending: true });

      if (!emgErr && Array.isArray(emgData)) {
        this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, emgData);
        this.isSupabaseConnected = true;
      }

      // 7. Check village events
      const { data: evtData, error: evtErr } = await supabase
        .from('village_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (!evtErr && Array.isArray(evtData)) {
        this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, evtData);
        this.isSupabaseConnected = true;
      }

      // 8. Check APBDes items
      const { data: apbData, error: apbErr } = await supabase
        .from('apbdes_items')
        .select('*');

      if (!apbErr && Array.isArray(apbData)) {
        if (apbData.length > 0) {
          const fiscalYear = apbData[0].fiscal_year || new Date().getFullYear();
          const pendapatanItems = apbData.filter((i: any) => i.type === 'pendapatan');
          const belanjaItems = apbData.filter((i: any) => i.type === 'belanja');

          const pBudget = pendapatanItems.reduce((s: number, i: any) => s + (Number(i.budget_amount) || 0), 0);
          const pRealized = pendapatanItems.reduce((s: number, i: any) => s + (Number(i.realized_amount) || 0), 0);
          const bBudget = belanjaItems.reduce((s: number, i: any) => s + (Number(i.budget_amount) || 0), 0);
          const bRealized = belanjaItems.reduce((s: number, i: any) => s + (Number(i.realized_amount) || 0), 0);
          const totalB = pBudget + bBudget;
          const totalR = pRealized + bRealized;

          const fullApb: ApbdesData = {
            fiscal_year: fiscalYear,
            pendapatan: {
              total_budget: pBudget,
              total_realized: pRealized,
              items: pendapatanItems.map((i: any) => ({
                account_code: i.account_code,
                name: i.name,
                budget_amount: Number(i.budget_amount) || 0,
                realized_amount: Number(i.realized_amount) || 0,
                percentage: Number(i.percentage) || 0
              }))
            },
            belanja: {
              total_budget: bBudget,
              total_realized: bRealized,
              items: belanjaItems.map((i: any) => ({
                account_code: i.account_code,
                name: i.name,
                budget_amount: Number(i.budget_amount) || 0,
                realized_amount: Number(i.realized_amount) || 0,
                percentage: Number(i.percentage) || 0
              }))
            },
            realisasi_persen: totalB > 0 ? Number(((totalR / totalB) * 100).toFixed(1)) : 0
          };
          this.setStorage(STORAGE_KEYS.APBDES, fullApb);
        } else {
          this.setStorage(STORAGE_KEYS.APBDES, initialApbdes);
        }
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
              if (!currentLetters.find((l) => l.id === newLetter.id || l.tracking_number === newLetter.tracking_number)) {
                this.setStorage(STORAGE_KEYS.LETTERS, [newLetter, ...currentLetters]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as LetterRequest;
              const idx = currentLetters.findIndex((l) => l.id === updated.id || l.tracking_number === updated.tracking_number);
              if (idx !== -1) {
                currentLetters[idx] = { ...currentLetters[idx], ...updated };
                this.setStorage(STORAGE_KEYS.LETTERS, [...currentLetters]);
              }
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id?: string; tracking_number?: string };
              this.setStorage(
                STORAGE_KEYS.LETTERS,
                currentLetters.filter((l) => (!old.id || l.id !== old.id) && (!old.tracking_number || l.tracking_number !== old.tracking_number))
              );
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
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id?: string };
              if (old && old.id) {
                this.setStorage(
                  STORAGE_KEYS.COMPLAINTS,
                  currentComplaints.filter((c) => c.id !== old.id)
                );
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
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id?: string; nik?: string };
              this.setStorage(
                STORAGE_KEYS.CITIZENS,
                currentCitizens.filter((c) => (!old?.id || c.id !== old.id) && (!old?.nik || c.nik !== old.nik))
              );
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
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id?: string };
              if (old && old.id) {
                this.setStorage(
                  STORAGE_KEYS.ANNOUNCEMENTS,
                  currentAnnouncements.filter((a) => a.id !== old.id)
                );
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'emergency_contacts' },
          (payload) => {
            const current = this.getEmergencyContacts();
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as EmergencyContact;
              if (!current.find((e) => e.id === newItem.id)) {
                this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, [...current, newItem]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as EmergencyContact;
              const idx = current.findIndex((e) => e.id === updated.id);
              if (idx !== -1) {
                current[idx] = updated;
                this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, [...current]);
              }
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id: string };
              this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, current.filter((e) => e.id !== old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'village_events' },
          (payload) => {
            const current = this.getVillageEvents();
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as VillageEvent;
              if (!current.find((e) => e.id === newItem.id)) {
                this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, [...current, newItem]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as VillageEvent;
              const idx = current.findIndex((e) => e.id === updated.id);
              if (idx !== -1) {
                current[idx] = updated;
                this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, [...current]);
              }
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as { id: string };
              this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, current.filter((e) => e.id !== old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'village_profiles' },
          (payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const updated = payload.new as VillageProfile;
              this.setStorage(STORAGE_KEYS.PROFILE, updated);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'apbdes_items' },
          () => {
            this.syncFromSupabase();
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
    if (this.cache[STORAGE_KEYS.ACTIVE_ROLE]) {
      return this.cache[STORAGE_KEYS.ACTIVE_ROLE];
    }
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as 'admin_desa' | 'kades') || 'admin_desa';
    }
    return 'admin_desa';
  }

  setActiveRole(role: 'admin_desa' | 'kades') {
    this.cache[STORAGE_KEYS.ACTIVE_ROLE] = role;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    }
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

    // Sync to Supabase: Multi-desa by code
    try {
      if (updated.code) {
        const { data: existing } = await supabase
          .from('village_profiles')
          .select('id')
          .eq('code', updated.code)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('village_profiles')
            .update({ ...updated, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          // Buat record desa baru di tabel village_profiles
          const { id: _, ...insertData } = updated as any;
          await supabase
            .from('village_profiles')
            .insert([{ ...insertData, updated_at: new Date().toISOString() }]);
        }
      } else {
        await supabase
          .from('village_profiles')
          .upsert({ id: 1, ...updated, updated_at: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Supabase profile update offline', e);
    }

    this.notify();
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
        const secureCode = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID().split('-')[0] + '-' + crypto.randomUUID().split('-')[1]
          : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        const cleanLetterSlug = (letter.letter_name || 'surat').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);
        const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://dekati.desa.id';
        letter.qr_verification_token = `valid-${secureCode}-${cleanLetterSlug}-${new Date().getFullYear()}`;
        letter.qr_verification_url = `${origin}/#/verify/${letter.qr_verification_token}`;
      }
      letter.signed_by_name = extra?.signed_by_name || this.getVillageProfile().kades_name || 'Kepala Desa';
      letter.signed_at = new Date().toLocaleString('id-ID');
    }

    // Timeline updates: Perbarui alur langkah secara rapi dan sinkron
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const existingTimeline = Array.isArray(letter.timeline) ? [...letter.timeline] : [];

    // Helper untuk update atau tambah langkah timeline
    const updateOrCreateStep = (matchKeyword: string, newStep: { title: string; time: string; done: boolean; actor?: string }) => {
      const idx = existingTimeline.findIndex(s => s.title.toLowerCase().includes(matchKeyword.toLowerCase()));
      if (idx !== -1) {
        existingTimeline[idx] = { ...existingTimeline[idx], ...newStep };
      } else {
        existingTimeline.push(newStep);
      }
    };

    if (status === 'in_verification') {
      updateOrCreateStep('pemeriksaan berkas', {
        title: 'Berkas Sedang Diverifikasi Petugas Pelayanan',
        time: nowTime,
        done: true,
        actor: 'Operator Pelayanan'
      });
    } else if (status === 'approved') {
      updateOrCreateStep('pemeriksaan berkas', {
        title: 'Berkas Selesai Diverifikasi Petugas',
        time: nowTime,
        done: true,
        actor: 'Operator Pelayanan'
      });
      updateOrCreateStep('penerbitan nomor', {
        title: `Diterbitkan No. Registrasi Desa (${letter.letter_official_number || '470/...'})`,
        time: nowTime,
        done: true,
        actor: 'Sekretariat Desa'
      });
    } else if (status === 'signed' || status === 'completed') {
      updateOrCreateStep('pemeriksaan berkas', {
        title: 'Berkas Selesai Diverifikasi Petugas',
        time: nowTime,
        done: true,
        actor: 'Operator Pelayanan'
      });
      updateOrCreateStep('penerbitan nomor', {
        title: `Diterbitkan No. Registrasi Desa (${letter.letter_official_number || '470/...'})`,
        time: nowTime,
        done: true,
        actor: 'Sekretariat Desa'
      });
      updateOrCreateStep('tanda tangan', {
        title: 'Tanda Tangan Elektronik QR Kades Disahkan',
        time: nowTime,
        done: true,
        actor: letter.signed_by_name || 'Kepala Desa'
      });
      updateOrCreateStep('dokumen digital', {
        title: 'Surat Selesai & Dokumen Digital Siap Diunduh',
        time: nowTime,
        done: true
      });
    } else if (status === 'rejected') {
      updateOrCreateStep('ditolak', {
        title: `Pengajuan Ditolak: ${extra?.rejection_reason || 'Syarat tidak lengkap'}`,
        time: nowTime,
        done: true,
        actor: 'Pemeriksa Berkas'
      });
    }

    letter.timeline = existingTimeline;
    letters[index] = letter;
    this.setStorage(STORAGE_KEYS.LETTERS, letters);

    // Sync to Supabase: cocokkan id ataupun tracking_number secara aman tipe data UUID
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let updateQuery = supabase
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
        });

      if (isUuid) {
        await updateQuery.or(`id.eq.${id},tracking_number.eq.${letter.tracking_number}`);
      } else {
        await updateQuery.eq('tracking_number', letter.tracking_number);
      }
    } catch (e) {
      console.warn('Supabase letter update offline', e);
    }

    return letter;
  }

  async getLetterByTokenOrTracking(tokenOrTracking: string): Promise<LetterRequest | null> {
    const q = tokenOrTracking.trim();
    if (!q) return null;

    // Check local storage first
    const letters = this.getLetters();
    const localMatch = letters.find(
      (l) =>
        (l.qr_verification_token && l.qr_verification_token.toLowerCase() === q.toLowerCase()) ||
        l.tracking_number.toLowerCase() === q.toLowerCase() ||
        (l.letter_official_number && l.letter_official_number.toLowerCase() === q.toLowerCase()) ||
        l.id === q
    );
    if (localMatch) return localMatch;

    // Direct Supabase lookup
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
      let query = supabase.from('letter_requests').select('*');
      if (isUuid) {
        query = query.or(`id.eq.${q},tracking_number.eq.${q},qr_verification_token.eq.${q}`);
      } else {
        query = query.or(`tracking_number.eq.${q},qr_verification_token.eq.${q}`);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return data as LetterRequest;
      }
    } catch (e) {
      console.warn('Supabase getLetterByTokenOrTracking error', e);
    }
    return null;
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
      citizen.verified_by = `revisi: ${notes || 'Dokumen KTP/KK buram atau belum sesuai'}`;
      citizen.verified_at = new Date().toLocaleString('id-ID');
    }

    citizens[index] = citizen;
    this.setStorage(STORAGE_KEYS.CITIZENS, citizens);

    // Sync to Supabase
    try {
      const updatePayload: any = {
        is_verified: citizen.is_verified,
        verified_at: approve ? new Date().toISOString() : null,
        verified_by: citizen.verified_by,
        updated_at: new Date().toISOString()
      };

      const res = await supabase
        .from('citizens')
        .update(updatePayload)
        .eq('id', id);

      if (res.error) {
        console.warn('[Dekati DataService] Failed updating citizen by ID, trying by NIK:', res.error);
        if (citizen.nik) {
          const resNik = await supabase
            .from('citizens')
            .update(updatePayload)
            .eq('nik', citizen.nik);
          if (resNik.error) {
            console.error('[Dekati DataService] Failed updating citizen by NIK:', resNik.error);
          }
        }
      }
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

  async saveFullApbdes(apbdes: ApbdesData): Promise<ApbdesData> {
    const pendapatanItems = (apbdes.pendapatan?.items || []).map((i) => {
      const budget = Number(i.budget_amount) || 0;
      const realized = Number(i.realized_amount) || 0;
      return {
        account_code: i.account_code || '',
        name: i.name || '',
        budget_amount: budget,
        realized_amount: realized,
        percentage: budget > 0 ? Number(((realized / budget) * 100).toFixed(1)) : 0
      };
    });

    const belanjaItems = (apbdes.belanja?.items || []).map((i) => {
      const budget = Number(i.budget_amount) || 0;
      const realized = Number(i.realized_amount) || 0;
      return {
        account_code: i.account_code || '',
        name: i.name || '',
        budget_amount: budget,
        realized_amount: realized,
        percentage: budget > 0 ? Number(((realized / budget) * 100).toFixed(1)) : 0
      };
    });

    const pBudget = pendapatanItems.reduce((s, i) => s + i.budget_amount, 0);
    const pRealized = pendapatanItems.reduce((s, i) => s + i.realized_amount, 0);
    const bBudget = belanjaItems.reduce((s, i) => s + i.budget_amount, 0);
    const bRealized = belanjaItems.reduce((s, i) => s + i.realized_amount, 0);
    const totalB = pBudget + bBudget;
    const totalR = pRealized + bRealized;

    const updatedApbdes: ApbdesData = {
      fiscal_year: Number(apbdes.fiscal_year) || new Date().getFullYear(),
      pendapatan: {
        total_budget: pBudget,
        total_realized: pRealized,
        items: pendapatanItems
      },
      belanja: {
        total_budget: bBudget,
        total_realized: bRealized,
        items: belanjaItems
      },
      realisasi_persen: totalB > 0 ? Number(((totalR / totalB) * 100).toFixed(1)) : 0
    };

    this.setStorage(STORAGE_KEYS.APBDES, updatedApbdes);

    // Sync to Supabase apbdes_items
    try {
      await supabase.from('apbdes_items').delete().eq('fiscal_year', updatedApbdes.fiscal_year);

      const rowsToInsert = [
        ...pendapatanItems.map((i) => ({
          fiscal_year: updatedApbdes.fiscal_year,
          type: 'pendapatan',
          account_code: i.account_code,
          name: i.name,
          budget_amount: i.budget_amount,
          realized_amount: i.realized_amount,
          percentage: i.percentage
        })),
        ...belanjaItems.map((i) => ({
          fiscal_year: updatedApbdes.fiscal_year,
          type: 'belanja',
          account_code: i.account_code,
          name: i.name,
          budget_amount: i.budget_amount,
          realized_amount: i.realized_amount,
          percentage: i.percentage
        }))
      ];

      if (rowsToInsert.length > 0) {
        await supabase.from('apbdes_items').insert(rowsToInsert);
      }
    } catch (e) {
      console.warn('Supabase apbdes sync offline', e);
    }

    this.notify();
    return updatedApbdes;
  }

  async updateApbdesItem(
    type: 'pendapatan' | 'belanja',
    accountCode: string,
    realizedAmount: number
  ) {
    const apbdes = this.getApbdes();
    const item = apbdes[type].items.find((i) => i.account_code === accountCode);
    if (item) {
      item.realized_amount = realizedAmount;
    }
    return this.saveFullApbdes(apbdes);
  }

  async addApbdesItem(
    type: 'pendapatan' | 'belanja',
    item: Omit<ApbdesItem, 'percentage'>
  ) {
    const apbdes = this.getApbdes();
    const newItem: ApbdesItem = {
      ...item,
      percentage: Number(item.budget_amount) > 0 ? Number(((item.realized_amount / item.budget_amount) * 100).toFixed(1)) : 0
    };
    apbdes[type].items.push(newItem);
    return this.saveFullApbdes(apbdes);
  }

  async deleteApbdesItem(
    type: 'pendapatan' | 'belanja',
    accountCode: string
  ) {
    const apbdes = this.getApbdes();
    apbdes[type].items = apbdes[type].items.filter((i) => i.account_code !== accountCode);
    return this.saveFullApbdes(apbdes);
  }

  async updateApbdesItemFull(
    type: 'pendapatan' | 'belanja',
    accountCode: string,
    updatedFields: Partial<ApbdesItem>
  ) {
    const apbdes = this.getApbdes();
    const idx = apbdes[type].items.findIndex((i) => i.account_code === accountCode);
    if (idx !== -1) {
      apbdes[type].items[idx] = {
        ...apbdes[type].items[idx],
        ...updatedFields
      };
    }
    return this.saveFullApbdes(apbdes);
  }

  // ==========================================
  // Emergency Contacts 24 Jam
  // ==========================================
  getEmergencyContacts(): EmergencyContact[] {
    return this.getStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, initialEmergencyContacts);
  }

  async createEmergencyContact(payload: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const list = this.getEmergencyContacts();
    const newContact: EmergencyContact = {
      ...payload,
      id: `emg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [...list, newContact].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, updated);

    // Sync to Supabase
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          title: newContact.title,
          phone: newContact.phone,
          icon: newContact.icon || 'call',
          description: newContact.description || null,
          order_index: newContact.order_index || 0,
          is_active: newContact.is_active ?? true
        })
        .select('*')
        .single();

      if (!error && data) {
        newContact.id = data.id;
        const currentList = this.getEmergencyContacts();
        const idx = currentList.findIndex((c) => c.title === newContact.title && c.phone === newContact.phone);
        if (idx !== -1) {
          currentList[idx].id = data.id;
          this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, currentList);
        }
      }
    } catch (e) {
      console.warn('Supabase emergency_contact insert offline', e);
    }

    return newContact;
  }

  async updateEmergencyContact(id: string, payload: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const list = this.getEmergencyContacts();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const updatedContact = { ...list[idx], ...payload };
    list[idx] = updatedContact;
    const sorted = [...list].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, sorted);

    // Sync to Supabase
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('emergency_contacts')
          .update({
            title: updatedContact.title,
            phone: updatedContact.phone,
            icon: updatedContact.icon,
            description: updatedContact.description,
            order_index: updatedContact.order_index,
            is_active: updatedContact.is_active
          })
          .eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase emergency_contact update offline', e);
    }

    return updatedContact;
  }

  async deleteEmergencyContact(id: string): Promise<boolean> {
    const list = this.getEmergencyContacts();
    const filtered = list.filter((c) => c.id !== id);
    this.setStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, filtered);

    // Sync to Supabase
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('emergency_contacts').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase emergency_contact delete offline', e);
    }

    return true;
  }

  // ==========================================
  // Village Events (Agenda Kegiatan Desa)
  // ==========================================
  getVillageEvents(): VillageEvent[] {
    return this.getStorage(STORAGE_KEYS.VILLAGE_EVENTS, initialVillageEvents);
  }

  async createVillageEvent(payload: Omit<VillageEvent, 'id'>): Promise<VillageEvent> {
    const list = this.getVillageEvents();
    const newEvent: VillageEvent = {
      ...payload,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [...list, newEvent].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, updated);

    // Sync to Supabase
    try {
      const { data, error } = await supabase
        .from('village_events')
        .insert({
          title: newEvent.title,
          category: newEvent.category,
          event_date: newEvent.event_date,
          event_time: newEvent.event_time,
          location: newEvent.location,
          organizer: newEvent.organizer || null,
          description: newEvent.description || null,
          is_active: newEvent.is_active ?? true
        })
        .select('*')
        .single();

      if (!error && data) {
        newEvent.id = data.id;
        const currentList = this.getVillageEvents();
        const idx = currentList.findIndex((e) => e.title === newEvent.title && e.event_date === newEvent.event_date);
        if (idx !== -1) {
          currentList[idx].id = data.id;
          this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, currentList);
        }
      }
    } catch (e) {
      console.warn('Supabase village_event insert offline', e);
    }

    return newEvent;
  }

  async updateVillageEvent(id: string, payload: Partial<VillageEvent>): Promise<VillageEvent | undefined> {
    const list = this.getVillageEvents();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;

    const updatedEvent = { ...list[idx], ...payload };
    list[idx] = updatedEvent;
    const sorted = [...list].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, sorted);

    // Sync to Supabase
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('village_events')
          .update({
            title: updatedEvent.title,
            category: updatedEvent.category,
            event_date: updatedEvent.event_date,
            event_time: updatedEvent.event_time,
            location: updatedEvent.location,
            organizer: updatedEvent.organizer,
            description: updatedEvent.description,
            is_active: updatedEvent.is_active
          })
          .eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase village_event update offline', e);
    }

    return updatedEvent;
  }

  async deleteVillageEvent(id: string): Promise<boolean> {
    const list = this.getVillageEvents();
    const filtered = list.filter((e) => e.id !== id);
    this.setStorage(STORAGE_KEYS.VILLAGE_EVENTS, filtered);

    // Sync to Supabase
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('village_events').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase village_event delete offline', e);
    }

    return true;
  }

  // ==========================================
  // Authentication & Pamong Accounts
  // ==========================================
  async loginOfficial(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: VillageOfficial; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.rpc('authenticate_official', {
        p_email: cleanEmail,
        p_password: password
      });

      if (error) {
        console.error('[Dekati Auth] Server authentication failed:', error);
        return { success: false, error: 'Layanan autentikasi tidak tersedia. Silakan coba lagi.' };
      }

      if (Array.isArray(data) && data.length > 0) {
        const user = data[0] as VillageOfficial;
        if (!user.id || !user.email || user.status !== 'active') {
          return { success: false, error: 'Kredensial tidak valid.' };
        }
        this.cache[STORAGE_KEYS.CURRENT_OFFICIAL] = user;
        this.setActiveRole(user.role === 'kades' || user.role === 'lurah' ? 'kades' : 'admin_desa');

        if (user.village_code) {
          try {
            const { data: dbProfile } = await supabase
              .from('village_profiles')
              .select('*')
              .eq('code', user.village_code)
              .maybeSingle();

            if (dbProfile) {
              this.setStorage(STORAGE_KEYS.PROFILE, dbProfile);
            }
          } catch (e) {
            console.warn('[Dekati Auth] Failed to fetch village profile:', e);
          }
        }

        if (user.village_name && user.village_name !== 'Pemerintah Desa') {
          this.updateVillageProfile({
            name: user.village_name,
            code: user.village_code || '',
            ...(user.role === 'kades' || user.role === 'lurah' ? { kades_name: user.nama_lengkap } : {})
          });
        }
        return { success: true, user };
      }
    } catch (e) {
      console.error('[Dekati Auth] Supabase RPC unavailable:', e);
      return { success: false, error: 'Layanan autentikasi tidak tersedia. Silakan coba lagi.' };
    }

    return { success: false, error: 'Email dinas atau kata sandi tidak cocok.' };
  }

  async registerOfficial(payload: {
    nama: string;
    email: string;
    password: string;
    role: string;
    nik: string;
    village_code?: string;
    village_name?: string;
    district?: string;
    regency?: string;
    province?: string;
    phone?: string;
  }): Promise<{ success: boolean; user?: VillageOfficial; error?: string }> {
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      // 1. Coba panggil fungsi RPC register_official di Supabase
      const { data, error } = await supabase.rpc('register_official', {
        p_nama: payload.nama,
        p_email: cleanEmail,
        p_password: payload.password,
        p_role: payload.role,
        p_nik: payload.nik,
        p_village_code: payload.village_code || '',
        p_village_name: payload.village_name || 'Pemerintah Desa',
        p_phone: payload.phone || null
      });

      if (!error && data && data.length > 0) {
        const newUser: VillageOfficial = {
          id: data[0].id,
          nik: payload.nik,
          nama_lengkap: data[0].nama_lengkap,
          email: data[0].email,
          role: data[0].role as any,
          can_sign_tte: payload.role === 'kades' || payload.role === 'lurah',
          village_name: data[0].village_name,
          village_code: payload.village_code || '',
          status: 'active'
        };

        const localOfficials = this.getStorage<VillageOfficial[]>(STORAGE_KEYS.OFFICIALS_LIST, []);
        if (!localOfficials.some((o) => o.email.toLowerCase() === newUser.email.toLowerCase())) {
          localOfficials.push(newUser);
          this.setStorage(STORAGE_KEYS.OFFICIALS_LIST, localOfficials);
        }

        if (payload.village_name || payload.district) {
          this.updateVillageProfile({
            name: payload.village_name || 'Pemerintah Desa',
            code: payload.village_code || '',
            district: payload.district || '',
            regency: payload.regency || '',
            province: payload.province || '',
            ...(payload.role === 'kades' || payload.role === 'lurah' ? { kades_name: payload.nama } : {})
          });
        }

        return { success: true, user: newUser };
      }

      if (error) {
        console.warn('[Dekati Register RPC Error]:', error);
      }
    } catch (e) {
      console.warn('[Dekati Register] Offline fallback', e);
    }

    // 2. Fallback Response (Local / Offline mode)
    const fallbackUser: VillageOfficial = {
      id: `off-${Date.now()}`,
      nik: payload.nik,
      nama_lengkap: payload.nama,
      email: cleanEmail,
      role: payload.role as any,
      can_sign_tte: payload.role === 'kades' || payload.role === 'lurah',
      village_name: payload.village_name || 'Pemerintah Desa',
      village_code: payload.village_code || '',
      status: 'active'
    };

    const localOfficials = this.getStorage<VillageOfficial[]>(STORAGE_KEYS.OFFICIALS_LIST, []);
    localOfficials.push(fallbackUser);
    this.setStorage(STORAGE_KEYS.OFFICIALS_LIST, localOfficials);

    if (payload.village_name || payload.district) {
      this.updateVillageProfile({
        name: payload.village_name || 'Pemerintah Desa',
        code: payload.village_code || '',
        district: payload.district || '',
        regency: payload.regency || '',
        province: payload.province || '',
        ...(payload.role === 'kades' || payload.role === 'lurah' ? { kades_name: payload.nama } : {})
      });
    }

    return { success: true, user: fallbackUser };
  }

  getCurrentOfficial(): VillageOfficial | null {
    return this.cache[STORAGE_KEYS.CURRENT_OFFICIAL] || null;
  }

  logoutOfficial() {
    delete this.cache[STORAGE_KEYS.CURRENT_OFFICIAL];
    localStorage.removeItem(STORAGE_KEYS.CURRENT_OFFICIAL);
    this.notify();
  }

  // Reset to initial mock data
  resetAllData() {
    this.cache = {};
    localStorage.removeItem(STORAGE_KEYS.CITIZENS);
    localStorage.removeItem(STORAGE_KEYS.LETTERS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.APBDES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_OFFICIAL);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.VILLAGE_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.OFFICIALS_LIST);
    this.syncFromSupabase();
    this.notify();
  }
}

export const dataService = new DataService();
