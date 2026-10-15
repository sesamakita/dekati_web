-- ============================================================================
-- SINKRONISASI & PERBAIKAN AKSES: PROFIL DESA & TEMPLATE TATA NASKAH SURAT
-- File: database/fix_village_profiles_and_templates.sql
--
-- Keterangan Masalah:
-- 1. Tabel village_profiles sebelumnya di-REVOKE hak UPDATE-nya untuk role 'anon'
--    sehingga saat pengguna menyimpan perubahan profil di web/app, Supabase
--    menolak dengan kode 42501 (permission denied). Data tersimpan di localStorage,
--    namun begitu logout, sinkronisasi Supabase menimpa kembali profil lokal dengan
--    data lama dari database.
-- 2. Kolom logo_desa_url, logo_kabupaten_url, logo_provinsi_url, dan village_type
--    belum ada di tabel village_profiles produksi.
-- 3. Tabel letter_templates belum dibuat / belum memiliki izin akses yang tepat.
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard -> Project Anda (https://supabase.com/dashboard)
-- 2. Masuk ke menu "SQL Editor" di bilah navigasi sebelah kiri
-- 3. Klik "New Query", tempelkan (paste) seluruh isi skrip ini, lalu klik "Run"
-- ============================================================================

BEGIN;

-- 1. PASTIKAN TABEL public.village_profiles MEMILIKI STRUKTUR LENGKAP
CREATE TABLE IF NOT EXISTS public.village_profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    district VARCHAR(100) NOT NULL DEFAULT '',
    regency VARCHAR(100) NOT NULL DEFAULT '',
    province VARCHAR(100) NOT NULL DEFAULT '',
    postal_code VARCHAR(10) DEFAULT '',
    office_address TEXT NOT NULL DEFAULT '',
    office_phone VARCHAR(50) DEFAULT '',
    office_email VARCHAR(100) DEFAULT '',
    kades_name VARCHAR(150) DEFAULT 'Kepala Desa',
    sekdes_name VARCHAR(150) DEFAULT 'Sekretaris Desa',
    vision TEXT DEFAULT '',
    mission JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom klasifikasi desa/kelurahan, NIP kades, dan URL/Base64 Logo resmi
ALTER TABLE IF EXISTS public.village_profiles 
ADD COLUMN IF NOT EXISTS logo_kabupaten_url TEXT,
ADD COLUMN IF NOT EXISTS logo_desa_url TEXT,
ADD COLUMN IF NOT EXISTS logo_provinsi_url TEXT,
ADD COLUMN IF NOT EXISTS village_type VARCHAR(20) DEFAULT 'desa',
ADD COLUMN IF NOT EXISTS kades_nip VARCHAR(50);

-- Pastikan kolom pada village_officials juga lengkap
ALTER TABLE IF EXISTS public.village_officials
ADD COLUMN IF NOT EXISTS village_type VARCHAR(20) DEFAULT 'desa',
ADD COLUMN IF NOT EXISTS nip VARCHAR(50);

-- 2. BUAT TABEL public.letter_templates JIKA BELUM ADA
CREATE TABLE IF NOT EXISTS public.letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_code VARCHAR(50) NOT NULL,
    letter_type_code VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    header_config JSONB DEFAULT '{}'::jsonb,
    body_template TEXT,
    footer_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(village_code, letter_type_code)
);

CREATE INDEX IF NOT EXISTS idx_letter_templates_village ON public.letter_templates(village_code);
CREATE INDEX IF NOT EXISTS idx_letter_templates_type ON public.letter_templates(letter_type_code);

-- 3. HAK AKSES GRANT (PENTING: MENGATASI ERROR 42501 permission denied)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.village_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.letter_templates TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. ROW LEVEL SECURITY (RLS) KEBIJAKAN TERBUKA (PERMISSIVE POLICIES)
ALTER TABLE public.village_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;

-- Reset kebijakan lama
DROP POLICY IF EXISTS "dekati_public_read_village_profiles" ON public.village_profiles;
DROP POLICY IF EXISTS "Public Anon All village_profiles" ON public.village_profiles;
DROP POLICY IF EXISTS "dekati_open_village_profiles" ON public.village_profiles;

CREATE POLICY "dekati_open_village_profiles" ON public.village_profiles
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "dekati_public_read_letter_templates" ON public.letter_templates;
DROP POLICY IF EXISTS "dekati_open_letter_templates" ON public.letter_templates;

CREATE POLICY "dekati_open_letter_templates" ON public.letter_templates
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 5. FUNCTION SECURITY DEFINER SEBAGAI JAMINAN AKSES SIMPAN PROFIL
-- Fungsi ini mengeksekusi penyimpanan dengan hak superuser/definer,
-- menjamin pembaruan profil selalu berhasil tanpa terhalang pembatasan RLS.
CREATE OR REPLACE FUNCTION public.update_village_profile_secure(
    p_code VARCHAR,
    p_name VARCHAR DEFAULT NULL,
    p_village_type VARCHAR DEFAULT 'desa',
    p_district VARCHAR DEFAULT NULL,
    p_regency VARCHAR DEFAULT NULL,
    p_province VARCHAR DEFAULT NULL,
    p_postal_code VARCHAR DEFAULT NULL,
    p_office_address TEXT DEFAULT NULL,
    p_office_phone VARCHAR DEFAULT NULL,
    p_office_email VARCHAR DEFAULT NULL,
    p_kades_name VARCHAR DEFAULT NULL,
    p_kades_nip VARCHAR DEFAULT NULL,
    p_sekdes_name VARCHAR DEFAULT NULL,
    p_vision TEXT DEFAULT NULL,
    p_mission JSONB DEFAULT '[]'::jsonb,
    p_logo_desa_url TEXT DEFAULT NULL,
    p_logo_kabupaten_url TEXT DEFAULT NULL,
    p_logo_provinsi_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_id INT;
    v_result RECORD;
BEGIN
    -- 1. Cari berdasarkan kode desa jika disediakan
    IF p_code IS NOT NULL AND TRIM(p_code) <> '' THEN
        SELECT id INTO v_existing_id FROM public.village_profiles WHERE code = p_code LIMIT 1;
    END IF;

    -- 2. Jika tidak ditemukan dengan kode, fallback ke baris pertama (id = 1)
    IF v_existing_id IS NULL THEN
        SELECT id INTO v_existing_id FROM public.village_profiles ORDER BY id ASC LIMIT 1;
    END IF;

    -- 3. Update jika ada, atau Insert jika tabel masih kosong
    IF v_existing_id IS NOT NULL THEN
        UPDATE public.village_profiles
        SET
            name = COALESCE(p_name, name),
            code = COALESCE(NULLIF(p_code, ''), code),
            village_type = COALESCE(p_village_type, village_type, 'desa'),
            district = COALESCE(p_district, district),
            regency = COALESCE(p_regency, regency),
            province = COALESCE(p_province, province),
            postal_code = COALESCE(p_postal_code, postal_code),
            office_address = COALESCE(p_office_address, office_address),
            office_phone = COALESCE(p_office_phone, office_phone),
            office_email = COALESCE(p_office_email, office_email),
            kades_name = COALESCE(p_kades_name, kades_name),
            kades_nip = COALESCE(p_kades_nip, kades_nip),
            sekdes_name = COALESCE(p_sekdes_name, sekdes_name),
            vision = COALESCE(p_vision, vision),
            mission = COALESCE(p_mission, mission),
            logo_desa_url = COALESCE(p_logo_desa_url, logo_desa_url),
            logo_kabupaten_url = COALESCE(p_logo_kabupaten_url, logo_kabupaten_url),
            logo_provinsi_url = COALESCE(p_logo_provinsi_url, logo_provinsi_url),
            updated_at = NOW()
        WHERE id = v_existing_id
        RETURNING * INTO v_result;
    ELSE
        INSERT INTO public.village_profiles (
            name, code, village_type, district, regency, province,
            postal_code, office_address, office_phone, office_email,
            kades_name, kades_nip, sekdes_name, vision, mission,
            logo_desa_url, logo_kabupaten_url, logo_provinsi_url, updated_at
        ) VALUES (
            COALESCE(p_name, 'Pemerintah Desa'),
            COALESCE(p_code, ''),
            COALESCE(p_village_type, 'desa'),
            COALESCE(p_district, ''),
            COALESCE(p_regency, ''),
            COALESCE(p_province, ''),
            COALESCE(p_postal_code, ''),
            COALESCE(p_office_address, ''),
            COALESCE(p_office_phone, ''),
            COALESCE(p_office_email, ''),
            COALESCE(p_kades_name, 'Kepala Desa'),
            p_kades_nip,
            COALESCE(p_sekdes_name, 'Sekretaris Desa'),
            COALESCE(p_vision, ''),
            COALESCE(p_mission, '[]'::jsonb),
            p_logo_desa_url,
            p_logo_kabupaten_url,
            p_logo_provinsi_url,
            NOW()
        )
        RETURNING * INTO v_result;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'profile', to_jsonb(v_result)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_village_profile_secure TO anon, authenticated;

-- 6. PASTIKAN REALTIME SUPABASE AKTIF UNTUK KEDUA TABEL INI
ALTER PUBLICATION supabase_realtime ADD TABLE public.village_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.letter_templates;

COMMIT;
