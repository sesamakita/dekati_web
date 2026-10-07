# 🏛️ DEKATI WEB (Portal Administrasi & Pamong Desa)

> **DEKATI** (*Desa Komunikasi & Administrasi Terintegrasi*) — Portal web resmi aparatur pemerintah desa untuk verifikasi kependudukan, pemrosesan E-Surat ber-Tanda Tangan Elektronik (TTE) QR, tindak lanjut aduan warga, serta transparansi APBDes.

---

## 📌 Ringkasan Teknologi

* **Framework:** React 18.3 + TypeScript 5.6 + Vite 6
* **Styling & UI:** Tailwind CSS 3.4 + Lucide Icons + Bento Grid Layout
* **Routing:** React Router DOM 7
* **Basis Data & Realtime:** Supabase (PostgreSQL 15+) via `@supabase/supabase-js`
* **Unit Testing:** Vitest 5.0

---

## 🚀 Panduan Memulai Cepat

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel berikut sesuai proyek Supabase Anda:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
*(Catatan: File `.env` telah dilindungi dalam `.gitignore` agar tidak ter-commit ke repositori).*

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses portal melalui browser di `http://localhost:5173`.

### 4. Menjalankan Pengujian & Build Produksi
```bash
# Menjalankan unit tests
npm test

# Build aset produksi (TypeScript check + Vite bundler)
npm run build

# Pratinjau hasil build
npm run preview
```

---

## 🛡️ Fitur Utama Portal Web

1. **Landing Page Publik Mandiri:**
   * Informasi profil desa, visi & misi, dan susunan aparatur.
   * **Lacak Status Surat Tanpa Login:** Warga dapat memantau progres permohonan via nomor resi (dilengkapi sensor NIK sesuai UU PDP No. 27/2022).
   * **Grafik Transparansi APBDes:** Diagram pendapatan dan belanja anggaran desa.
   * Siaran kabar dan pengumuman resmi desa.
2. **Buku Induk Kependudukan (BIK):**
   * Pencocokan data NIK dan No. KK warga.
   * Validasi foto identitas fisik KTP dan swafoto pemegang akun mobile warga.
   * Ekspor data warga ke format CSV (Excel).
3. **Layanan E-Surat & TTE QR:**
   * Verifikasi berkas permohonan surat masuk.
   * Penomoran surat resmi register desa.
   * Pengesahan Tanda Tangan Elektronik (TTE) berbasis QR Code Kepala Desa.
   * Pratinjau dan cetak dokumen PDF surat resmi siap stempel.
4. **Disposisi Aduan & Aspirasi:**
   * Tinjauan laporan kerusakan fasilitas/keamanan dari warga.
   * Pemetaan lokasi presisi berbasis koordinat GPS & link Google Maps.
   * Unggah foto bukti penyelesaian dan catatan penanganan aparat.
5. **Agenda Kegiatan & Kontak Siaga 24 Jam:**
   * Manajemen kalender kegiatan rapat/posyandu/gotong royong.
   * Pengelolaan daftar kontak darurat (Ambulans, Bhabinkamtibmas, Babinsa).

---

## 👥 Peran Pengguna (RBAC)

* **Admin Desa (`admin_desa`):** Verifikasi data warga, input nomor registrasi surat, kelola warta & agenda desa.
* **Kepala Desa (`kades`):** Otoritas pengesahan Tanda Tangan Elektronik (TTE QR) surat resmi dan pengawasan APBDes.

---

## 📄 Lisensi & Kepatuhan
Dikembangkan untuk modernisasi tata kelola administrasi desa digital di Indonesia dengan mematuhi **UU Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022)**.
