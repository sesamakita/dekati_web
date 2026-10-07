// src/services/__tests__/dataService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../dataService';
import { ApbdesData, LetterRequest } from '../../types';

describe('DataService Core Business Logic', () => {
  beforeEach(() => {
    // Seed initial letter data for isolated testing
    const sampleLetter: LetterRequest = {
      id: 'req-test-001',
      tracking_number: 'SRT-202610-9999',
      letter_type_id: 1,
      letter_name: 'Surat Keterangan Tidak Mampu (SKTM)',
      applicant_user_id: 'usr-001',
      applicant_name: 'Budi Santoso',
      citizen_id: 'cit-001',
      citizen_name: 'Budi Santoso',
      citizen_nik: '3201123456780001',
      status: 'submitted',
      purpose: 'Beasiswa Pendidikan',
      created_at: new Date().toISOString(),
      timeline: [
        { title: 'Permohonan Dikirim Warga', time: '10:00 WIB', done: true }
      ]
    };

    // Inject into dataService cache
    (dataService as any).setStorage('dekati_letters_v1', [sampleLetter]);
  });

  it('should initialize and return village profile with default values', () => {
    const profile = dataService.getVillageProfile();
    expect(profile).toBeDefined();
    expect(typeof profile.name).toBe('string');
  });

  it('should retrieve letter requests list', () => {
    const letters = dataService.getLetters();
    expect(Array.isArray(letters)).toBe(true);
    expect(letters.length).toBeGreaterThan(0);
    expect(letters[0].tracking_number).toBe('SRT-202610-9999');
  });

  it('should update letter status and generate secure TTE QR token when signed', async () => {
    const letters = dataService.getLetters();
    const testLetter = letters[0];
    expect(testLetter).toBeDefined();

    const updated = await dataService.updateLetterStatus(testLetter.id, 'signed', {
      signed_by_name: 'Kepala Desa Sukamaju',
      official_number: '470/123/SK/2026'
    });

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('signed');
    expect(updated?.letter_official_number).toBe('470/123/SK/2026');
    expect(updated?.qr_verification_token).toBeDefined();
    expect(updated?.qr_verification_token).toMatch(/^valid-/);
    expect(updated?.qr_verification_url).toContain(updated?.qr_verification_token);
    expect(updated?.timeline.some(step => step.title.toLowerCase().includes('tanda tangan'))).toBe(true);
  });

  it('should correctly calculate APBDes budget aggregates and percentages', async () => {
    const mockApbdesData: ApbdesData = {
      fiscal_year: 2026,
      pendapatan: {
        total_budget: 1000000000,
        total_realized: 800000000,
        items: [
          {
            name: 'Dana Desa',
            account_code: '4.1.1',
            budget_amount: 1000000000,
            realized_amount: 800000000,
            percentage: 80
          }
        ]
      },
      belanja: {
        total_budget: 1000000000,
        total_realized: 750000000,
        items: [
          {
            name: 'Pembangunan Jalan',
            account_code: '5.1.1',
            budget_amount: 1000000000,
            realized_amount: 750000000,
            percentage: 75
          }
        ]
      },
      realisasi_persen: 77.5
    };

    const saved = await dataService.saveFullApbdes(mockApbdesData);
    expect(saved.fiscal_year).toBe(2026);
    expect(saved.pendapatan.total_budget).toBe(1000000000);
    expect(saved.pendapatan.total_realized).toBe(800000000);
    expect(saved.belanja.total_budget).toBe(1000000000);
    expect(saved.belanja.total_realized).toBe(750000000);
    expect(saved.realisasi_persen).toBe(77.5);
  });

  it('should manage active official role correctly', () => {
    dataService.setActiveRole('kades');
    expect(dataService.getActiveRole()).toBe('kades');

    dataService.setActiveRole('admin_desa');
    expect(dataService.getActiveRole()).toBe('admin_desa');
  });

  it('should find letter by token or tracking number', async () => {
    const foundByTracking = await dataService.getLetterByTokenOrTracking('SRT-202610-9999');
    expect(foundByTracking).toBeDefined();
    expect(foundByTracking?.id).toBe('req-test-001');

    const notFound = await dataService.getLetterByTokenOrTracking('NON-EXISTENT-TOKEN');
    expect(notFound).toBeNull();
  });
});

