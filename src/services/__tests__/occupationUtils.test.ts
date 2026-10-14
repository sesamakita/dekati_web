// src/services/__tests__/occupationUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  normalizeOccupation,
  aggregateOccupations,
  generateOccupationReportCsv,
} from '../occupationUtils';
import { Citizen } from '../../types';

describe('occupationUtils Tests', () => {
  describe('calculateAge', () => {
    it('calculates age from ISO/YYYY-MM-DD string', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 5;
      const birthDate = `${birthYear}-01-01`;
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThanOrEqual(4);
      expect(age).toBeLessThanOrEqual(5);
    });

    it('calculates age from DD-MM-YYYY format', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 4;
      const age = calculateAge(`15-05-${birthYear}`);
      expect(age).toBeGreaterThanOrEqual(3);
      expect(age).toBeLessThanOrEqual(4);
    });

    it('calculates age from 16-digit NIK correctly (male)', () => {
      // NIK: 320101 + 150521 (15 Mei 2021) + 0001
      const nik = '3201011505210001';
      const age = calculateAge(undefined, nik);
      expect(age).not.toBeNull();
      // In 2026, 2021 born child is 4 or 5
      expect(age).toBeGreaterThanOrEqual(4);
      expect(age).toBeLessThanOrEqual(5);
    });

    it('calculates age from 16-digit NIK correctly for female (day + 40)', () => {
      // Female born 12 August 2022: day is 12 + 40 = 52. Month is 08. Year is 22.
      const nik = '3201015208220002';
      const age = calculateAge(undefined, nik);
      expect(age).not.toBeNull();
      // In 2026, 2022 born child is 3 or 4
      expect(age).toBeGreaterThanOrEqual(3);
      expect(age).toBeLessThanOrEqual(4);
    });
  });

  describe('normalizeOccupation', () => {
    it('classifies explicit preschool keywords', () => {
      expect(normalizeOccupation('Anak Pra-Sekolah')).toBe('Anak Pra-Sekolah / PAUD');
      expect(normalizeOccupation('PAUD Pelita')).toBe('Anak Pra-Sekolah / PAUD');
      expect(normalizeOccupation('TK Pertiwi')).toBe('Anak Pra-Sekolah / PAUD');
      expect(normalizeOccupation('Belum Sekolah')).toBe('Anak Pra-Sekolah / PAUD');
      expect(normalizeOccupation('Balita')).toBe('Anak Pra-Sekolah / PAUD');
    });

    it('classifies child under 7 years as preschool even if recorded as "Belum Bekerja"', () => {
      const today = new Date();
      const childBirthDate = `${today.getFullYear() - 3}-06-15`;
      expect(normalizeOccupation('Belum/Tidak Bekerja', childBirthDate)).toBe(
        'Anak Pra-Sekolah / PAUD'
      );
    });

    it('classifies adult as "Belum / Tidak Bekerja" if age >= 7', () => {
      const today = new Date();
      const adultBirthDate = `${today.getFullYear() - 25}-01-01`;
      expect(normalizeOccupation('Belum/Tidak Bekerja', adultBirthDate)).toBe(
        'Belum / Tidak Bekerja'
      );
    });

    it('classifies other standard professions correctly', () => {
      expect(normalizeOccupation('Guru PNS')).toBe('PNS / ASN / PPPK');
      expect(normalizeOccupation('Bhabinkamtibmas Polri')).toBe('TNI / POLRI');
      expect(normalizeOccupation('Mahasiswa')).toBe('Pelajar / Mahasiswa');
      expect(normalizeOccupation('Petani Sawit')).toBe('Petani / Pekebun / Peternak');
      expect(normalizeOccupation('Nelayan Tradisional')).toBe('Nelayan / Perikanan');
      expect(normalizeOccupation('Pemilik Warung Sembako')).toBe('Wiraswasta / Pedagang');
    });
  });

  describe('aggregateOccupations & generateOccupationReportCsv', () => {
    const mockCitizens: Citizen[] = [
      {
        id: '1',
        nik: '3201011505210001', // male child born 2021
        no_kk: '3201010000000001',
        nama_lengkap: 'Adik Bayi',
        pekerjaan: 'Belum Sekolah',
        jenis_kelamin: 'L',
        is_verified: true,
      },
      {
        id: '2',
        nik: '3201015208220002', // female child born 2022
        no_kk: '3201010000000001',
        nama_lengkap: 'Balita Cilik',
        pekerjaan: 'Belum/Tidak Bekerja', // auto-detected by NIK age < 7
        jenis_kelamin: 'P',
        is_verified: true,
      },
      {
        id: '3',
        nik: '3201010101900001',
        no_kk: '3201010000000001',
        nama_lengkap: 'Bapak PNS',
        pekerjaan: 'PNS',
        jenis_kelamin: 'L',
        is_verified: true,
      },
      {
        id: '4',
        nik: '3201014101920002',
        no_kk: '3201010000000001',
        nama_lengkap: 'Ibu IRT',
        pekerjaan: 'Ibu Rumah Tangga',
        jenis_kelamin: 'P',
        is_verified: true,
      },
    ];

    it('correctly aggregates preschool counts and other categories', () => {
      const summary = aggregateOccupations(mockCitizens);
      expect(summary.totalCitizens).toBe(4);
      expect(summary.preschoolCount).toBe(2);
      expect(summary.workingCount).toBe(1);
      expect(summary.homemakerCount).toBe(1);
      expect(summary.unemployedCount).toBe(0);
    });

    it('generates CSV report containing preschool summary', () => {
      const csv = generateOccupationReportCsv(mockCitizens, 'Desa Sukamaju');
      expect(csv).toContain('Anak Pra-Sekolah / PAUD');
      expect(csv).toContain('Total Anak Usia Dini / Pra-Sekolah (PAUD): 2 Jiwa');
      expect(csv).toContain('DESA SUKAMAJU');
    });
  });
});
