-- Attach RSVP capacity + waitlist promotion triggers
DROP TRIGGER IF EXISTS rsvps_capacity_check ON public.rsvps;
CREATE TRIGGER rsvps_capacity_check
  BEFORE INSERT OR UPDATE OF status ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_rsvp_capacity();

DROP TRIGGER IF EXISTS rsvps_promote_waitlist ON public.rsvps;
CREATE TRIGGER rsvps_promote_waitlist
  AFTER UPDATE OR DELETE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_waitlist();

-- Updated-at trigger for rsvps
DROP TRIGGER IF EXISTS rsvps_set_updated_at ON public.rsvps;
CREATE TRIGGER rsvps_set_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Ensure new-user profile trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();