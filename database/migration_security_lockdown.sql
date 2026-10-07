-- DEKATI initial security lockdown for the current custom-auth architecture.
-- Apply only after reviewing the behavior notes below. Existing admin data flows
-- use the anon key directly and will stop working for protected tables until
-- moved behind an authenticated server-side API.
--
-- Public read-only data retained: letter_types, announcements, apbdes_items,
-- village_profiles, emergency_contacts, village_events.
-- Private tables closed to anon and authenticated direct table access:
-- citizens, letter_requests, complaints, village_officials.
-- Authentication is temporarily limited to the existing SECURITY DEFINER RPCs.

BEGIN;

-- Make public catalog/content tables read-only for clients. Drop all existing
-- policies so permissive policies cannot combine with these read policies.
DO $$
DECLARE
    v_table TEXT;
    v_policy RECORD;
BEGIN
    FOREACH v_table IN ARRAY ARRAY[
        'letter_types',
        'announcements',
        'apbdes_items',
        'village_profiles',
        'emergency_contacts',
        'village_events'
    ] LOOP
        IF to_regclass(format('public.%I', v_table)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
            FOR v_policy IN
                SELECT policyname
                FROM pg_policies
                WHERE schemaname = 'public' AND tablename = v_table
            LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', v_policy.policyname, v_table);
            END LOOP;
            EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', v_table);
            EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', v_table);
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
                'dekati_public_read_' || v_table,
                v_table
            );
        END IF;
    END LOOP;
END;
$$;

-- Sensitive/operational tables have no client-role policies or table grants.
DO $$
DECLARE
    v_table TEXT;
    v_policy RECORD;
BEGIN
    FOREACH v_table IN ARRAY ARRAY[
        'citizens',
        'letter_requests',
        'complaints',
        'village_officials'
    ] LOOP
        IF to_regclass(format('public.%I', v_table)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
            FOR v_policy IN
                SELECT policyname
                FROM pg_policies
                WHERE schemaname = 'public' AND tablename = v_table
            LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', v_policy.policyname, v_table);
            END LOOP;
            EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', v_table);
        END IF;
    END LOOP;
END;
$$;

-- Keep the explicit authentication RPCs available to app clients.
REVOKE EXECUTE ON FUNCTION public.authenticate_official(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.authenticate_official(TEXT, TEXT) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.authenticate_citizen(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.authenticate_citizen(TEXT, TEXT) TO anon, authenticated;

-- Public registration stays disabled. The role that owns the functions retains
-- its owner privileges; clients cannot invoke the SECURITY DEFINER signup RPCs.
REVOKE EXECUTE ON FUNCTION public.register_official(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_citizen(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Ensure the legacy public storage policy is removed, if present.
UPDATE storage.buckets
SET public = FALSE
WHERE id IN ('dokumen-warga', 'foto-aduan', 'documents');

DROP POLICY IF EXISTS "Public Access Dokumen" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Documents" ON storage.objects;

COMMIT;