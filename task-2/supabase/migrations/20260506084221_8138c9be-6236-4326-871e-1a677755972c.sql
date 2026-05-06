-- Hidden flag on events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

-- Feedback table
CREATE TABLE public.event_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback readable by all"
  ON public.event_feedback FOR SELECT USING (true);

CREATE POLICY "attendees insert own feedback after event end"
  ON public.event_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_feedback.event_id
        AND e.end_at < now()
    )
    AND EXISTS (
      SELECT 1 FROM public.rsvps r
      WHERE r.event_id = event_feedback.event_id
        AND r.user_id = auth.uid()
        AND r.status IN ('going','checked_in')
    )
  );

CREATE POLICY "users update own feedback"
  ON public.event_feedback FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users delete own feedback"
  ON public.event_feedback FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "host members manage feedback"
  ON public.event_feedback FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_feedback.event_id AND public.is_host_member_any(auth.uid(), e.host_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_feedback.event_id AND public.is_host_member_any(auth.uid(), e.host_id)));

CREATE TRIGGER event_feedback_updated_at BEFORE UPDATE ON public.event_feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Photos table
CREATE TYPE public.photo_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  storage_path text,
  caption text,
  status public.photo_status NOT NULL DEFAULT 'pending',
  hidden_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved photos readable by all"
  ON public.event_photos FOR SELECT
  USING (
    (status = 'approved' AND hidden_at IS NULL)
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_photos.event_id AND public.is_host_member_any(auth.uid(), e.host_id))
  );

CREATE POLICY "users upload own photos"
  ON public.event_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own photos"
  ON public.event_photos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "host members manage photos"
  ON public.event_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_photos.event_id AND public.is_host_member_any(auth.uid(), e.host_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_photos.event_id AND public.is_host_member_any(auth.uid(), e.host_id)));

CREATE TRIGGER event_photos_updated_at BEFORE UPDATE ON public.event_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reports table
CREATE TYPE public.report_target AS ENUM ('event','photo');
CREATE TYPE public.report_status AS ENUM ('open','resolved','hidden');

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type public.report_target NOT NULL,
  target_id uuid NOT NULL,
  event_id uuid,
  reporter_id uuid NOT NULL,
  reason text,
  status public.report_status NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users file reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reporters see own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "host members see event reports"
  ON public.reports FOR SELECT
  USING (event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = reports.event_id
      AND public.is_host_member_any(auth.uid(), e.host_id)
  ));

CREATE POLICY "host members update event reports"
  ON public.reports FOR UPDATE
  USING (event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = reports.event_id
      AND public.is_host_member_any(auth.uid(), e.host_id)
  ));

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Event photos publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-photos');

CREATE POLICY "Authenticated upload event photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own event photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
