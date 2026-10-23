-- ============================================================================
-- SINKRONISASI ARSITEKTUR DATABASE: TABEL RUKUN TETANGGA (NEIGHBORHOOD UNITS)
-- & APARATUR PEMERINTAH DESA (VILLAGE OFFICIALS)
-- File: database/migration_neighborhood_units_and_officials.sql
-- Target Database: Supabase (https://jaqvxcnrqodumydeqlao.supabase.co)
--
-- PENJELASAN MASALAH ARSITEKTUR:
-- 1. Tabel 'public.neighborhood_units' belum pernah dibuat di database Supabase (PGRST205 / 404).
--    Saat admin mengubah data RT di web, data hanya tersimpan di localStorage browser lokal,
--    sementara aplikasi mobile warga (dekatip_app) yang memanggil Supabase selalu gagal (404)
--    dan jatuh ke fallback default Desa Sukamaju.
-- 2. Tabel 'public.village_officials' di Supabase ditutup izin aksesnya (401 Unauthorized)
--    sehingga perubahan struktur pamong desa juga tidak tersimpan ke cloud.
--
-- CARA MENJALANKAN (HANYA 1 MENIT):
-- 1. Buka browser: https://supabase.com/dashboard/project/jaqvxcnrqodumydeqlao/sql/new
--    (atau buka Supabase Dashboard -> Project jaqvxcnrqodumydeqlao -> menu "SQL Editor")
-- 2. Tempelkan (paste) seluruh isi skrip ini.
-- 3. Klik tombol hijau "Run".
-- ============================================================================

BEGIN;

-- 1. BUAT TABEL public.neighborhood_units JIKA BELUM ADA
CREATE TABLE IF NOT EXISTS public.neighborhood_units (
    id TEXT PRIMARY KEY,                                  -- Mendukung UUID atau string id dari web
    village_code VARCHAR(50) DEFAULT '2102050003',         -- Kode Wilayah Desa (e.g. Desa Lancang Kuning)
    dusun_name VARCHAR(150) NOT NULL DEFAULT 'Dusun I',    -- Nama Dusun / Lingkungan
    dusun VARCHAR(150),                                   -- Kompatibilitas mundur
    rt_number VARCHAR(10) NOT NULL,                       -- Contoh: '01', '02', '03'
    rw_number VARCHAR(10) NOT NULL,                       -- Contoh: '01', '02'
    rt_leader_name VARCHAR(255) NOT NULL,                 -- Nama Ketua RT
    rt_leader_phone VARCHAR(50) NOT NULL,                 -- Nomor WhatsApp Ketua RT (Muncul di APK warga)
    rw_leader_name VARCHAR(255),                          -- Nama Ketua RW (Opsional)
    rw_leader_phone VARCHAR(50),                          -- Kontak Ketua RW (Opsional)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat indeks untuk performa query pencarian dan sorting
CREATE INDEX IF NOT EXISTS idx_neighborhood_units_rt_rw ON public.neighborhood_units(rt_number, rw_number);
CREATE INDEX IF NOT EXISTS idx_neighborhood_units_active ON public.neighborhood_units(is_active);
CREATE INDEX IF NOT EXISTS idx_neighborhood_units_village ON public.neighborhood_units(village_code);

-- 2. ATUR IZIN ROW LEVEL SECURITY (RLS) TABEL neighborhood_units
-- Memberikan akses penuh kepada role anon & authenticated agar Web Admin dapat
-- melakukan Insert/Update/Delete dan Mobile App Warga dapat membaca (SELECT).
ALTER TABLE public.neighborhood_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access neighborhood_units" ON public.neighborhood_units;
DROP POLICY IF EXISTS "Allow All neighborhood_units" ON public.neighborhood_units;

CREATE POLICY "Allow All neighborhood_units"
ON public.neighborhood_units
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.neighborhood_units TO anon, authenticated;

-- 3. PERBAIKI IZIN AKSES TABEL village_officials
-- Membuka akses agar susunan aparatur desa di web admin dapat tersinkron ke Supabase
CREATE TABLE IF NOT EXISTS public.village_officials (
    id TEXT PRIMARY KEY,
    user_id UUID,
    nik VARCHAR(16),
    nip VARCHAR(50),
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    jabatan VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'kasi_layanan',
    village_code VARCHAR(50) DEFAULT '2102050003',
    village_name VARCHAR(150) DEFAULT 'Desa Lancang Kuning',
    phone_number VARCHAR(50),
    whatsapp VARCHAR(50),
    avatar_url TEXT,
    can_sign_tte BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.village_officials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access village_officials" ON public.village_officials;
DROP POLICY IF EXISTS "Allow All village_officials" ON public.village_officials;

CREATE POLICY "Allow All village_officials"
ON public.village_officials
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.village_officials TO anon, authenticated;

-- 4. DAFTARKAN TABEL KE SUPABASE REALTIME PUBLICATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'neighborhood_units'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.neighborhood_units;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'village_officials'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.village_officials;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Lewati jika publication tidak ada
END $$;

-- 5. SEED DATA AWAL WILAYAH RT DESA LANCANG KUNING (JIKA MASIH KOSONG)
INSERT INTO public.neighborhood_units (
    id, village_code, dusun_name, dusun, rt_number, rw_number, rt_leader_name, rt_leader_phone, is_active
) VALUES
    ('rt-lk-001', '2102050003', 'Dusun I Lancang Kuning', 'Dusun I Lancang Kuning', '01', '01', 'Ketua RT 01', '081266000001', true),
    ('rt-lk-002', '2102050003', 'Dusun I Lancang Kuning', 'Dusun I Lancang Kuning', '02', '01', 'Ketua RT 02', '081266000002', true),
    ('rt-lk-003', '2102050003', 'Dusun II Lancang Kuning', 'Dusun II Lancang Kuning', '03', '02', 'Ketua RT 03', '081266000003', true),
    ('rt-lk-004', '2102050003', 'Dusun II Lancang Kuning', 'Dusun II Lancang Kuning', '04', '02', 'Ketua RT 04', '081266000004', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Selesai! Tabel neighborhood_units dan village_officials kini aktif dan tersinkron dua arah.
