// src/services/nikPrivacyService.ts
/**
 * Service untuk logika pengamanan, masking NIK, dan validasi PIN Otoritas Web.
 * Sesuai UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
 */

const STORAGE_KEYS = {
  NIK_PIN: 'dekati_nik_security_pin',
  SESSION_AUTH_UNTIL: 'dekati_nik_session_expiry',
};

const DEFAULT_PIN = '123456';

export const nikPrivacyService = {
  /**
   * Mengambil PIN keamanan saat ini dari localStorage atau default '123456'
   */
  getPin(): string {
    return localStorage.getItem(STORAGE_KEYS.NIK_PIN) || DEFAULT_PIN;
  },

  /**
   * Mengubah PIN keamanan baru (minimal 4 digit, rekomendasi 6 digit)
   */
  setPin(oldPin: string, newPin: string): { success: boolean; message: string } {
    const current = this.getPin();
    if (oldPin !== current) {
      return { success: false, message: 'PIN lama yang Anda masukkan salah.' };
    }
    if (!newPin || newPin.length < 4 || newPin.length > 8 || !/^\d+$/.test(newPin)) {
      return { success: false, message: 'PIN baru harus berupa 4-8 digit angka.' };
    }
    localStorage.setItem(STORAGE_KEYS.NIK_PIN, newPin);
    return { success: true, message: 'PIN keamanan NIK berhasil diperbarui.' };
  },

  /**
   * Reset PIN kembali ke default '123456'
   */
  resetPinToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.NIK_PIN);
  },

  /**
   * Verifikasi input PIN pengguna
   */
  verifyPin(inputPin: string): boolean {
    const current = this.getPin();
    return inputPin.trim() === current;
  },

  /**
   * Masking NIK: Menampilkan digit depan & belakang, sedangkan bagian tengah disamarkan dengan titik (.)
   * Contoh NIK 16 digit: "3201011504950001" -> "320101......0001"
   */
  maskNik(nik?: string | null): string {
    if (!nik || typeof nik !== 'string') return '-';
    const clean = nik.trim();
    if (clean.length < 8) {
      // Jika NIK pendek/kurang dari 8 karakter
      return `${clean.slice(0, 2)}....${clean.slice(-2)}`;
    }

    if (clean.length === 16) {
      // Standar NIK Kependudukan Indonesia 16 digit:
      // 6 digit pertama (Kode Wilayah) + 6 titik (.) + 4 digit terakhir (Nomor Urut)
      return `${clean.slice(0, 6)}......${clean.slice(12)}`;
    }

    // NIK / Nomor Identitas lainnya: sembunyikan 50% digit di tengah dengan titik
    const prefixLen = Math.min(4, Math.floor(clean.length / 4));
    const suffixLen = Math.min(4, Math.floor(clean.length / 4));
    const dotCount = Math.max(4, clean.length - (prefixLen + suffixLen));
    const dots = '.'.repeat(dotCount);
    return `${clean.slice(0, prefixLen)}${dots}${clean.slice(clean.length - suffixLen)}`;
  },

  /**
   * Cek apakah sesi otorisasi global masih aktif
   */
  isSessionActive(): boolean {
    const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_AUTH_UNTIL);
    if (!expiry) return false;
    const expiryTime = parseInt(expiry, 10);
    return !isNaN(expiryTime) && Date.now() < expiryTime;
  },

  /**
   * Simpan sesi aktif selama rentang waktu tertentu (default 15 menit)
   */
  setSessionActive(durationMinutes = 15): void {
    const expiry = Date.now() + durationMinutes * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.SESSION_AUTH_UNTIL, expiry.toString());
  },

  /**
   * Hapus sesi aktif (kunci kembali seluruh NIK)
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_AUTH_UNTIL);
  }
};
