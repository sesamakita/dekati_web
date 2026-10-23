// src/services/wahaService.ts
/**
 * WAHA (WhatsApp HTTP API) Client Service untuk Sistem Administrasi Desa DEKATI
 * Terhubung langsung ke WAHA di VPS: https://api.ujianpintar.online/waha
 */

import { LetterRequest, NeighborhoodUnit } from '../types';

export interface WahaConfig {
  baseUrl: string;
  apiKey: string;
  session: string;
  enabled: boolean;
}

const STORAGE_KEY = 'dekati_waha_config_v1';

// Default configuration dari server VPS yang sedang berjalan
export const DEFAULT_WAHA_CONFIG: WahaConfig = {
  baseUrl: 'https://api.ujianpintar.online/waha',
  apiKey: 'WahaUjianPintar2026',
  session: 'default',
  enabled: true,
};

class WahaService {
  private config: WahaConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig(): WahaConfig {
    if (typeof window === 'undefined') return DEFAULT_WAHA_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_WAHA_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[WAHA] Gagal memuat setelan lokal:', e);
    }
    return DEFAULT_WAHA_CONFIG;
  }

  saveConfig(nextConfig: Partial<WahaConfig>): WahaConfig {
    this.config = { ...this.config, ...nextConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('[WAHA] Gagal menyimpan setelan:', e);
      }
    }
    return this.config;
  }

  getConfig(): WahaConfig {
    return { ...this.config };
  }

  // Normalisasi nomor HP: 0812... -> 62812...@c.us
  formatChatId(rawPhone: string): string {
    let clean = (rawPhone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '628' + clean.slice(1);
    }
    return clean ? `${clean}@c.us` : '';
  }

  // Cek koneksi ke server WAHA
  async checkConnection(): Promise<{ ok: boolean; status: string; sessionName?: string }> {
    try {
      const cleanBase = this.config.baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanBase}/api/sessions`, {
        headers: {
          'X-Api-Key': this.config.apiKey,
        },
      });

      if (!res.ok) {
        return { ok: false, status: `HTTP ${res.status}` };
      }

      const sessions = await res.json();
      const current = Array.isArray(sessions)
        ? sessions.find((s: any) => s.name === this.config.session) || sessions[0]
        : null;

      if (current && current.status === 'WORKING') {
        return { ok: true, status: 'CONNECTED', sessionName: current.name };
      }

      return {
        ok: false,
        status: current ? current.status : 'NO_SESSION',
        sessionName: current?.name,
      };
    } catch (err: any) {
      return { ok: false, status: err.message || 'NETWORK_ERROR' };
    }
  }

  // Kirim pesan WhatsApp sembarang teks
  async sendTextMessage(toPhone: string, text: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, error: 'Fitur WAHA dinonaktifkan dalam setelan.' };
    }

    const chatId = this.formatChatId(toPhone);
    if (!chatId) {
      return { success: false, error: 'Nomor WhatsApp tujuan tidak valid.' };
    }

    try {
      const cleanBase = this.config.baseUrl.replace(/\/+$/, '');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${cleanBase}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          chatId,
          text,
          session: this.config.session,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data };
      }

      return { success: false, error: data?.message || `HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Kirim Pesan Permintaan Rekomendasi / Pengantar ke Ketua RT
  async sendRtApprovalRequest(
    letter: LetterRequest,
    rtLeader?: NeighborhoodUnit
  ): Promise<{ success: boolean; error?: string }> {
    const leaderPhone = rtLeader?.rt_leader_phone || letter.rt_leader_phone;
    if (!leaderPhone) {
      return { success: false, error: 'Nomor WhatsApp Ketua RT tidak terdaftar.' };
    }

    const leaderName = rtLeader?.rt_leader_name || letter.rt_leader_name || 'Bapak/Ibu Ketua RT';
    const rtNum = letter.rt_number || rtLeader?.rt_number || '-';
    const rwNum = letter.rw_number || rtLeader?.rw_number || '-';

    const message = 
`🏛️ *PEMERINTAH DESA - SISTEM DEKATI*
*PERMOHONAN REKOMENDASI / PENGANTAR RT*

Yth. *${leaderName}*
Ketua RT ${rtNum} / RW ${rwNum}

Terdapat permohonan surat warga di lingkungan Anda yang memerlukan verifikasi & rekomendasi kewilayahan:

📋 *Rincian Pengajuan Warga:*
• No. Registrasi: *${letter.tracking_number}*
• Nama Warga: *${letter.citizen_name}*
• NIK: ${letter.citizen_nik}
• Alamat: ${letter.citizen_address || `RT ${rtNum} / RW ${rwNum}`}
• Jenis Surat: *${letter.letter_name}*
• Keperluan: "${letter.purpose}"
• Waktu Pengajuan: ${letter.created_at || 'Hari ini'}

━━━━━━━━━━━━━━━━━━━━━
Mohon memberikan konfirmasi dengan *membalas langsung chat ini*:

👉 Ketik *1* untuk *SETUJU / REKOMENDASIKAN*
👉 Ketik *2* untuk *TOLAK*

*(Anda juga bisa menambahkan catatan, contoh: "1 Disetujui warga aktif" atau "2 Tidak tinggal di RT sini")*

Konfirmasi Anda otomatis tersinkronisasi ke Kantor Desa secara instan. Terima kasih.`;

    return await this.sendTextMessage(leaderPhone, message);
  }

  // Kirim Update Status Surat ke Warga Pemohon
  async sendCitizenStatusNotification(
    letter: LetterRequest,
    customMessage?: string
  ): Promise<{ success: boolean; error?: string }> {
    const phone = letter.applicant_phone;
    if (!phone) {
      return { success: false, error: 'Nomor WhatsApp pemohon tidak tersedia.' };
    }

    let statusText = '';
    if (letter.status === 'signed' || letter.status === 'completed') {
      statusText = '✅ *SURAT RESMI TELAH DISAHKAN & DITERBITKAN* dengan Tanda Tangan Elektronik (TTE QR) Kepala Desa.';
    } else if (letter.status === 'approved') {
      statusText = '📋 Berkas telah diverifikasi lengkap dan telah diterbitkan Nomor Registrasi Resmi Desa. Menunggu pengesahan TTE Kades.';
    } else if (letter.status === 'submitted' && letter.rt_status === 'approved_by_rt') {
      statusText = '👍 Rekomendasi Ketua RT telah *DISETUJUI*. Berkas Anda kini sedang dalam antrean verifikasi kantor desa.';
    } else if (letter.status === 'rejected') {
      statusText = `❌ Permohonan surat *DITOLAK*.\nAlasan: ${letter.rejection_reason || 'Persyaratan belum terpenuhi.'}`;
    }

    const message = 
`🏛️ *LAYANAN E-SURAT DESA - DEKATI*
Halo Sdr/i *${letter.citizen_name}*,

Status permohonan surat Anda telah diperbarui:
• No. Pelacakan: *${letter.tracking_number}*
• Jenis Surat: *${letter.letter_name}*

${statusText}

${customMessage ? `\nCatatan Tambahan: ${customMessage}` : ''}

Anda dapat memantau perkembangan dan mengunduh surat resmi langsung melalui aplikasi mobile DEKATI. Terima kasih.`;

    return await this.sendTextMessage(phone, message);
  }
}

export const wahaService = new WahaService();
