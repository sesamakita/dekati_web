-- ============================================================================
-- MIGRASI: SISTEM KUSTOMISASI TEMPLATE SURAT & TATA NASKAH DINAS DESA
-- Tabel: letter_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_code VARCHAR(50) NOT NULL DEFAULT '32.04.10.2001',
    letter_type_code VARCHAR(50) NOT NULL, -- e.g. 'SKTM', 'SKU', 'SKCK_PENGANTAR', 'SK_DOMISILI', 'DEFAULT'
    letter_name VARCHAR(255) NOT NULL,
    title_format VARCHAR(255) NOT NULL,
    header_config JSONB NOT NULL DEFAULT '{
        "show_kab_logo": true,
        "show_desa_logo": false,
        "show_garuda_logo": false,
        "logo_layout": "standard_left",
        "kab_logo_url": "",
        "desa_logo_url": "",
        "garuda_logo_url": "",
        "font_family": "Times New Roman",
        "line_spacing": 1.5,
        "border_style": "double"
    }'::jsonb,
    opening_text TEXT NOT NULL,
    declaration_text TEXT NOT NULL,
    closing_text TEXT NOT NULL,
    signer_role VARCHAR(100) NOT NULL DEFAULT 'Kepala Desa',
    custom_fields JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(village_code, letter_type_code)
);

-- Penambahan Kolom Logo & Klasifikasi Wilayah pada Profil Desa / Kelurahan
ALTER TABLE IF EXISTS public.village_profiles 
ADD COLUMN IF NOT EXISTS logo_kabupaten_url TEXT,
ADD COLUMN IF NOT EXISTS logo_desa_url TEXT,
ADD COLUMN IF NOT EXISTS logo_provinsi_url TEXT,
ADD COLUMN IF NOT EXISTS village_type VARCHAR(20) DEFAULT 'desa',
ADD COLUMN IF NOT EXISTS kades_nip VARCHAR(50);

-- Penambahan Kolom Klasifikasi Wilayah pada Akun Aparat / Pamong
ALTER TABLE IF EXISTS public.village_officials
ADD COLUMN IF NOT EXISTS village_type VARCHAR(20) DEFAULT 'desa',
ADD COLUMN IF NOT EXISTS nip VARCHAR(50);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_letter_templates_village ON public.letter_templates(village_code);
CREATE INDEX IF NOT EXISTS idx_letter_templates_type ON public.letter_templates(letter_type_code);

-- Row Level Security (RLS)
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dekati_public_read_letter_templates" ON public.letter_templates;
CREATE POLICY "dekati_public_read_letter_templates" 
ON public.letter_templates FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "dekati_admin_all_letter_templates" ON public.letter_templates;
CREATE POLICY "dekati_admin_all_letter_templates" 
ON public.letter_templates FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- Aktifkan Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.letter_templates;
