import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, MapPin, Users, ExternalLink, QrCode, Pencil } from "lucide-react";
import { format } from "date-fns";
import QRCode from "qrcode";
import { SocialMeta } from "@/components/SocialMeta";
import { EventFeedback } from "@/components/EventFeedback";
import { EventGallery } from "@/components/EventGallery";
import { ReportEventButton } from "@/components/ReportEventButton";

type EventDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  venue_address: string | null;
  online_url: string | null;
  capacity: number;
  status: string;
  host_id: string;
  hosts: { id: string; name: string; slug: string; logo_url: string | null; bio: string | null } | null;
};

type RsvpRow = { id: string; status: string; qr_code: string; waitlist_position: number | null };

const buildICS = (e: EventDetail) => {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${e.id}@lumi`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(e.start_at)}`,
    `DTEND:${fmt(e.end_at)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${(e.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${e.online_url || e.venue_address || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return "data:text/calendar;charset=utf8," + encodeURIComponent(lines.join("\n"));
};

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [rsvp, setRsvp] = useState<RsvpRow | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [going, setGoing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    const { data: ev } = await supabase
      .from("events")
      .select("id, slug, title, description, cover_image_url, start_at, end_at, timezone, venue_address, online_url, capacity, status, host_id, hosts(id, name, slug, logo_url, bio)")
      .eq("slug", slug)
      .maybeSingle();
    if (!ev) { setLoading(false); return; }
    setEvent(ev as any);
    const { count } = await supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", (ev as any).id)
      .in("status", ["going", "checked_in"]);
    setGoing(count || 0);
    if (user) {
      const { data: r } = await supabase
        .from("rsvps")
        .select("id, status, qr_code, waitlist_position")
        .eq("event_id", (ev as any).id)
        .eq("user_id", user.id)
        .maybeSingle();
      setRsvp(r as any);
      const { data: mem } = await supabase
        .from("host_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("host_id", (ev as any).host_id)
        .eq("role", "host")
        .maybeSingle();
      setCanEdit(!!mem);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug, user]);

  // Realtime: notify attendee when their RSVP status changes (e.g. promoted from waitlist)
  useEffect(() => {
    if (!user || !rsvp?.id) return;
    const channel = supabase
      .channel(`rsvp-${rsvp.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rsvps", filter: `id=eq.${rsvp.id}` },
        (payload) => {
          const next = payload.new as RsvpRow;
          const wasWaitlist = rsvp.status === "waitlist";
          const nowGoing = next.status === "going" || next.status === "checked_in";
          if (wasWaitlist && nowGoing) {
            toast.success("🎉 You're off the waitlist — you're going!");
          }
          setRsvp(next);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, rsvp?.id, rsvp?.status]);

  useEffect(() => {
    if (rsvp && (rsvp.status === "going" || rsvp.status === "checked_in")) {
      QRCode.toString(rsvp.qr_code, { type: "svg", margin: 1, color: { dark: "#ffffff", light: "#0000" } })
        .then(setQrSvg);
    }
  }, [rsvp]);

  if (loading) return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  if (!event) return <Layout><div>Event not found.</div></Layout>;

  const ended = new Date(event.end_at) < new Date();
  const start = new Date(event.start_at);

  const onRsvp = async () => {
    if (!user) {
      navigate(`/auth?redirect=/e/${event.slug}`);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("rsvps").insert({ event_id: event.id, user_id: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You're in!");
    load();
  };

  const onCancel = async () => {
    if (!rsvp) return;
    setBusy(true);
    const { error } = await supabase.from("rsvps").update({ status: "cancelled" }).eq("id", rsvp.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("RSVP cancelled");
    setRsvp(null);
    load();
  };

  return (
    <Layout>
      <SocialMeta
        title={`${event.title}${event.hosts ? ` · ${event.hosts.name}` : ""}`}
        description={event.description?.slice(0, 200) || `Join ${event.title}${event.hosts ? ` hosted by ${event.hosts.name}` : ""}.`}
        image={event.cover_image_url}
        type="article"
      />
      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className={`relative overflow-hidden rounded-3xl border border-border/60 bg-secondary aspect-[16/9] ${ended ? "grayscale" : ""}`}>
            {event.cover_image_url ? (
              <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-primary opacity-70" />
            )}
            {ended && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <span className="rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">Ended</span>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {ended && <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event ended</span>}
            {event.status === "draft" && <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">Draft</span>}
            <div className="ml-auto flex gap-2">
              <ReportEventButton eventId={event.id} />
              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/host/events/${event.slug}/edit`}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
                </Button>
              )}
            </div>
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{event.title}</h1>
          {event.hosts && (
            <Link to={`/h/${event.hosts.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              by <span className="font-medium text-foreground">{event.hosts.name}</span>
            </Link>
          )}
          {event.description && (
            <div className="prose prose-invert mt-8 whitespace-pre-wrap text-foreground/90 max-w-none">
              {event.description}
            </div>
          )}

          <EventGallery eventId={event.id} isHost={canEdit} />
          <EventFeedback
            eventId={event.id}
            ended={ended}
            userIsAttendee={!!rsvp && (rsvp.status === "going" || rsvp.status === "checked_in")}
          />
        </div>

        <aside className="space-y-4">
          <div className="glass glow-border rounded-2xl p-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">{format(start, "EEEE, MMMM d, yyyy")}</div>
                  <div className="text-muted-foreground">{format(start, "h:mm a")} • {event.timezone}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  {event.online_url ? (
                    <a href={event.online_url} target="_blank" rel="noreferrer" className="font-medium hover:underline inline-flex items-center gap-1">
                      Online event <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <div className="font-medium">{event.venue_address || "Venue TBA"}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-primary" />
                <div className="font-medium">{going} / {event.capacity} going</div>
              </div>
            </div>

            {!ended ? (
              <div className="mt-6 border-t border-border pt-6">
                {(rsvp?.status === "going" || rsvp?.status === "checked_in") ? (
                  <>
                    <div className="mb-2 text-sm font-medium text-accent">✓ You're going</div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={buildICS(event)} download={`${event.slug}.ics`}>Add to Calendar</a>
                    </Button>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground" disabled={busy} onClick={onCancel}>
                      Cancel RSVP
                    </Button>
                  </>
                ) : rsvp?.status === "waitlist" ? (
                  <>
                    <div className="mb-2 text-sm font-medium text-accent">On waitlist (#{rsvp.waitlist_position})</div>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" disabled={busy} onClick={onCancel}>
                      Leave waitlist
                    </Button>
                  </>
                ) : (
                  <Button onClick={onRsvp} disabled={busy} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
                    {going >= event.capacity ? "Join waitlist" : "RSVP"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                This event has ended. RSVPs are closed.
              </div>
            )}
          </div>

          {rsvp && (rsvp.status === "going" || rsvp.status === "checked_in") && (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" /> Your pass
              </div>
              <div className="mx-auto h-44 w-44" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <div className="mt-3 font-mono text-xs text-muted-foreground break-all">{rsvp.qr_code.slice(0, 12)}…</div>
            </div>
          )}
        </aside>
      </div>
    </Layout>
  );
};

export default EventDetail;
