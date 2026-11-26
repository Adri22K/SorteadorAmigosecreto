-- Harden access: all data access now happens in server routes using the service role.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS result_token_hash text;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS client_ref uuid;

CREATE UNIQUE INDEX IF NOT EXISTS participants_result_token_hash_uidx
  ON public.participants (result_token_hash)
  WHERE result_token_hash IS NOT NULL;

DROP POLICY IF EXISTS "Public read groups" ON public.groups;
DROP POLICY IF EXISTS "Public insert groups" ON public.groups;
DROP POLICY IF EXISTS "Public delete groups" ON public.groups;
DROP POLICY IF EXISTS "Public read participants" ON public.participants;
DROP POLICY IF EXISTS "Public insert participants" ON public.participants;
DROP POLICY IF EXISTS "Public read assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public insert assignments" ON public.assignments;

REVOKE ALL ON TABLE public.groups FROM anon, authenticated;
REVOKE ALL ON TABLE public.participants FROM anon, authenticated;
REVOKE ALL ON TABLE public.assignments FROM anon, authenticated;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
