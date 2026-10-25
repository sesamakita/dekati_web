-- ============================================================================
-- SINKRONISASI ARSITEKTUR DATABASE: DUKUNGAN UNGGAH FOTO PROFIL PAMONG DESA
-- File: database/migration_official_photo_upload.sql
-- Target: Supabase (https://jaqvxcnrqodumydeqlao.supabase.co)
-- ============================================================================
-- Skrip ini memastikan:
-- 1. Kolom 'avatar_url' (TEXT) tersedia di tabel public.village_officials
-- 2. Storage Bucket 'documents' siap menampung foto profil pamong desa
-- 3. Kebijakan Row Level Security (RLS) mengizinkan upload & baca publik
-- ============================================================================

BEGIN;

-- 1. Pastikan kolom avatar_url tersedia di tabel public.village_officials
ALTER TABLE IF EXISTS public.village_officials 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Konfigurasi Storage Bucket 'documents' (Mendukung upload gambar hingga 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    true, 
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- 3. Atur Hak Akses / RLS Storage Bucket agar foto pamong bisa diunggah & dibaca
DROP POLICY IF EXISTS "Public Documents Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Delete" ON storage.objects;

CREATE POLICY "Public Documents Upload" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public Documents Select" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Public Documents Update" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Public Documents Delete" ON storage.objects
FOR DELETE TO anon, authenticated
USING (bucket_id = 'documents');

COMMIT;
