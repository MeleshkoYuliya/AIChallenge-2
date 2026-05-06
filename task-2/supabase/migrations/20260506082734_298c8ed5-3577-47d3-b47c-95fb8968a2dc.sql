-- Promote waitlist entries when event capacity is increased
CREATE OR REPLACE FUNCTION public.handle_capacity_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_going_count int;
  v_open_seats int;
  v_promoted int := 0;
  r record;
begin
  if new.capacity <= old.capacity then
    return new;
  end if;

  select count(*) into v_going_count
    from public.rsvps
    where event_id = new.id and status in ('going', 'checked_in');

  v_open_seats := new.capacity - v_going_count;
  if v_open_seats <= 0 then
    return new;
  end if;

  for r in
    select id from public.rsvps
    where event_id = new.id and status = 'waitlist'
    order by waitlist_position asc nulls last, created_at asc
    limit v_open_seats
  loop
    update public.rsvps
      set status = 'going', waitlist_position = null
      where id = r.id;
    v_promoted := v_promoted + 1;
  end loop;

  return new;
end; $$;

DROP TRIGGER IF EXISTS events_capacity_promote ON public.events;
CREATE TRIGGER events_capacity_promote
  AFTER UPDATE OF capacity ON public.events
  FOR EACH ROW
  WHEN (new.capacity > old.capacity)
  EXECUTE FUNCTION public.handle_capacity_change();

-- Enable realtime so the affected attendee sees status updates live
ALTER TABLE public.rsvps REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;