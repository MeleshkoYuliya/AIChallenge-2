-- Invites table
CREATE TABLE public.host_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  role public.host_role NOT NULL,
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_by uuid NOT NULL,
  expires_at timestamptz,
  used_by uuid,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_host_invites_host ON public.host_invites(host_id);
CREATE INDEX idx_host_invites_token ON public.host_invites(token);

ALTER TABLE public.host_invites ENABLE ROW LEVEL SECURITY;

-- Hosts (role=host) manage invites for their host
CREATE POLICY "Hosts manage invites"
  ON public.host_invites FOR ALL
  USING (public.is_host_member(auth.uid(), host_id, 'host'::public.host_role))
  WITH CHECK (
    public.is_host_member(auth.uid(), host_id, 'host'::public.host_role)
    AND created_by = auth.uid()
  );

-- Any signed-in user can read an invite by its token (so they can accept it)
CREATE POLICY "Authenticated can read invites"
  ON public.host_invites FOR SELECT
  TO authenticated
  USING (true);

-- Redeem invite: SECURITY DEFINER, validates token + expiry + single use
CREATE OR REPLACE FUNCTION public.redeem_host_invite(_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite public.host_invites%ROWTYPE;
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_invite FROM public.host_invites WHERE token = _token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite' USING ERRCODE = 'P0002';
  END IF;
  IF v_invite.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite already used' USING ERRCODE = 'P0001';
  END IF;
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite expired' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.host_members (host_id, user_id, role)
  VALUES (v_invite.host_id, v_user, v_invite.role)
  ON CONFLICT (host_id, user_id, role) DO NOTHING;

  UPDATE public.host_invites
  SET used_by = v_user, used_at = now()
  WHERE id = v_invite.id;

  RETURN v_invite.host_id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_host_invite(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_host_invite(text) TO authenticated;

-- host_members needs a unique index for ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS host_members_unique
  ON public.host_members(host_id, user_id, role);

-- List members helper (host members only see their team)
CREATE OR REPLACE FUNCTION public.list_host_members(_host_id uuid)
RETURNS TABLE(member_id uuid, user_id uuid, role public.host_role, display_name text, contact_email text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT hm.id, hm.user_id, hm.role, p.display_name, p.contact_email, hm.created_at
  FROM public.host_members hm
  LEFT JOIN public.profiles p ON p.id = hm.user_id
  WHERE hm.host_id = _host_id
    AND public.is_host_member_any(auth.uid(), _host_id)
  ORDER BY hm.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.list_host_members(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.list_host_members(uuid) TO authenticated;