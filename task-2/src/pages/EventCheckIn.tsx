import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Undo2, Users, UserCheck, Clock } from "lucide-react";
import { format } from "date-fns";

type Ev = { id: string; slug: string; title: string; start_at: string; capacity: number; host_id: string };
type Rsvp = {
  id: string;
  user_id: string;
  status: string;
  qr_code: string;
  checked_in_at: string | null;
  profiles?: { display_name: string | null; contact_email: string | null } | null;
};

const EventCheckIn = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [event, setEvent] = useState<Ev | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<{ rsvpId: string; previousAt: string | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !slug) { setLoading(false); return; }
    (async () => {
      const { data: ev } = await supabase
        .from("events")
        .select("id, slug, title, start_at, capacity, host_id")
        .eq("slug", slug)
        .maybeSingle();
      if (!ev) { setLoading(false); return; }
      setEvent(ev as Ev);

      const { data: mem } = await supabase
        .from("host_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("host_id", ev.host_id)
        .in("role", ["host", "checker"])
        .limit(1);
      const ok = !!mem && mem.length > 0;
      setAllowed(ok);
      if (!ok) { setLoading(false); return; }

      await loadRsvps(ev.id);
      setLoading(false);
    })();
  }, [user, authLoading, slug]);

  const loadRsvps = async (eventId: string) => {
    const { data } = await supabase
      .from("rsvps")
      .select("id, user_id, status, qr_code, checked_in_at, profiles(display_name, contact_email)")
      .eq("event_id", eventId)
      .in("status", ["going", "checked_in"])
      .order("created_at", { ascending: true });
    setRsvps((data as any) || []);
  };

  // Realtime updates
  useEffect(() => {
    if (!event) return;
    const channel = supabase
      .channel(`checkin-${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps", filter: `event_id=eq.${event.id}` },
        () => loadRsvps(event.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [event?.id]);

  const counts = useMemo(() => {
    const going = rsvps.filter((r) => r.status === "going").length;
    const checkedIn = rsvps.filter((r) => r.status === "checked_in").length;
    return { going, checkedIn, total: going + checkedIn };
  }, [rsvps]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = code.trim().toLowerCase();
    if (!trimmed || !event) return;
    setSubmitting(true);
    try {
      const match = rsvps.find((r) => r.qr_code.toLowerCase() === trimmed);
      if (!match) {
        toast.error("Code not found for this event");
        return;
      }
      if (match.status === "checked_in") {
        toast.warning(`Already checked in: ${match.profiles?.display_name || match.profiles?.contact_email || "Attendee"}`);
        return;
      }
      const previousAt = match.checked_in_at;
      const { error } = await supabase
        .from("rsvps")
        .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
        .eq("id", match.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setLastAction({ rsvpId: match.id, previousAt });
      toast.success(`✓ Checked in: ${match.profiles?.display_name || match.profiles?.contact_email || "Attendee"}`);
      setCode("");
      inputRef.current?.focus();
      await loadRsvps(event.id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!lastAction || !event) return;
    const { error } = await supabase
      .from("rsvps")
      .update({ status: "going", checked_in_at: lastAction.previousAt })
      .eq("id", lastAction.rsvpId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Last check-in undone");
    setLastAction(null);
    await loadRsvps(event.id);
  };

  if (authLoading || loading) {
    return <Layout><div className="text-muted-foreground">Loading…</div></Layout>;
  }
  if (!user) return <Navigate to={`/auth?redirect=/host/check-in/${slug}`} replace />;
  if (!event) {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">Event not found</h1>
          <Link to="/host/check-in" className="mt-4 inline-block text-primary">← Back to check-in</Link>
        </div>
      </Layout>
    );
  }
  if (!allowed) {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">Access denied</h1>
          <p className="mt-3 text-muted-foreground">You don't have access to check in for this event.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <Link to="/host/check-in" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-3">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{event.title}</h1>
          <p className="mt-1 text-muted-foreground">{format(new Date(event.start_at), "EEE, MMM d • h:mm a")}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Card className="glass p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <UserCheck className="h-3.5 w-3.5" /> Checked in
            </div>
            <div className="mt-1 font-display text-3xl font-bold text-primary">{counts.checkedIn}</div>
          </Card>
          <Card className="glass p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Awaiting
            </div>
            <div className="mt-1 font-display text-3xl font-bold">{counts.going}</div>
          </Card>
          <Card className="glass p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Total
            </div>
            <div className="mt-1 font-display text-3xl font-bold">{counts.total} / {event.capacity}</div>
          </Card>
        </div>

        <Card className="glass mt-6 p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Enter or scan ticket code…"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 font-mono"
              autoComplete="off"
            />
            <Button type="submit" disabled={submitting || !code.trim()} className="bg-gradient-primary shadow-glow hover:opacity-90">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Check in
            </Button>
            <Button type="button" variant="outline" onClick={handleUndo} disabled={!lastAction}>
              <Undo2 className="mr-2 h-4 w-4" /> Undo
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Codes are unique per ticket. Duplicate scans are blocked automatically.
          </p>
        </Card>

        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold">Attendees</h2>
          <div className="mt-3 grid gap-2">
            {rsvps.length === 0 ? (
              <Card className="glass p-8 text-center text-muted-foreground">No confirmed attendees yet.</Card>
            ) : (
              rsvps.map((r) => (
                <Card key={r.id} className="glass flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.profiles?.display_name || "Attendee"}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.profiles?.contact_email}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{r.qr_code.slice(0, 12)}…</div>
                  </div>
                  {r.status === "checked_in" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" /> In
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Waiting</span>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventCheckIn;
